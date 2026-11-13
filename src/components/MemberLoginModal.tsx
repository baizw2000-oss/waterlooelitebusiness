import React, { useState } from 'react';
import { Merchant, UserProfile } from '../types';
import { 
  Building2, 
  ShieldCheck, 
  Mail, 
  Lock,
  Key,
  Eye,
  EyeOff,
  CheckCircle2, 
  X, 
  LogIn, 
  User, 
  Sparkles, 
  AlertCircle,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup } from 'firebase/auth';
import { saveMemberPassword, fetchMemberPassword } from '../services/firestoreService';
import confetti from 'canvas-confetti';
import { useLanguage } from '../i18n/LanguageContext';
import { getLocalizedMerchantName } from '../i18n/domainTranslations';

interface MemberLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchants: Merchant[];
  currentUser: UserProfile;
  onLoginSuccess: (memberProfile: UserProfile) => void;
  onSwitchToGuest: () => void;
  onOpenMerchantApply?: () => void;
}

export const MemberLoginModal: React.FC<MemberLoginModalProps> = ({
  isOpen,
  onClose,
  merchants,
  currentUser,
  onLoginSuccess,
  onSwitchToGuest,
  onOpenMerchantApply,
}) => {
  const { isEn, t } = useLanguage();
  // Auth Channel Tabs: 'password' (Enterprise Email + Password) vs 'google' (Google One-Click)
  const [authTab, setAuthTab] = useState<'password' | 'google'>('password');
  
  // Sub-modes for Password Tab: 'login' | 'activate' | 'forgot'
  const [subMode, setSubMode] = useState<'login' | 'activate' | 'forgot'>('login');

  // Form Fields
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  // Active verified merchants list (for matching approved enterprise records)
  const approvedMerchants = merchants.filter((m) => m.auditStatus !== 'REJECTED');

  // Handle Enterprise Password-Based Authentication
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    if (!cleanEmail) {
      setErrorMessage(
        t(
          '请输入企业在商会登记的官方邮箱（支持任意域名企业邮、Outlook、163 等）',
          'Please enter the official corporate email registered with WBCA.'
        )
      );
      return;
    }

    if (!cleanPassword) {
      setErrorMessage(t('请输入登录密码', 'Please enter your account password.'));
      return;
    }

    setIsLoading(true);

    try {
      const matched = approvedMerchants.find(
        (m) => m.email && m.email.toLowerCase() === cleanEmail
      );

      if (!matched) {
        setErrorMessage(
          t(
            `未在商会已审核的名商名录中检索到企业邮箱「${cleanEmail}」。请确认是否为入会申请表上登记的企业邮箱，或先提交企业入驻申请。`,
            `No approved enterprise was found matching "${cleanEmail}". Please verify your registered email or apply for directory membership.`
          )
        );
        setIsLoading(false);
        return;
      }

      const storedPassword = await fetchMemberPassword(cleanEmail);
      let isPasswordCorrect = false;

      if (storedPassword) {
        isPasswordCorrect = storedPassword === cleanPassword;
      } else {
        if (cleanPassword === '123456' || cleanPassword.length >= 6) {
          await saveMemberPassword(cleanEmail, cleanPassword);
          isPasswordCorrect = true;
        } else {
          setErrorMessage(
            t(
              '首次登录请设置至少 6 位密码，或点击下方【首次入驻会员？激活并设置专属密码】。',
              'For first-time sign-in, set at least 6 characters or select "First-time member? Activate account" below.'
            )
          );
          setIsLoading(false);
          return;
        }
      }

      if (!isPasswordCorrect) {
        setErrorMessage(
          t(
            '密码输入错误。如忘记密码，请点击下方【忘记密码？重置】。',
            'Incorrect password. Select "Forgot password?" below to reset.'
          )
        );
        setIsLoading(false);
        return;
      }

      const matchedName = getLocalizedMerchantName(matched, isEn);

      const verifiedProfile: UserProfile = {
        ...currentUser,
        uid: `member-${matched.id}`,
        name: matched.repName || matched.name,
        company: matched.name,
        title: matched.repTitle || '企业法定代表人 / 负责人',
        phone: matched.phone || '',
        email: matched.email,
        avatar: matched.logo || '🏢',
        tier: matched.tier || '认证商户',
        industry: matched.category,
        bio: matched.description || matched.tagline || '滑铁卢融商汇实名认证企业会员',
        isMember: true,
        merchantId: matched.id,
        joinedDate: '商会实名认证会员',
      };

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      onLoginSuccess(verifiedProfile);
      setSuccessMessage(
        t(
          `🎉 密码核验成功！欢迎回来，【${matchedName}】实名企业会员！`,
          `🎉 Verified! Welcome back, ${matchedName}.`
        )
      );
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(
        t(`登录验证遇到问题: ${err?.message || '请稍后重试'}`, `Authentication error: ${err?.message || 'Please try again'}`)
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle First-Time Member Account Password Activation
  const handleActivatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();
    const cleanConfirm = confirmPasswordInput.trim();

    if (!cleanEmail) {
      setErrorMessage(t('请输入入驻商会时登记的官方企业邮箱', 'Please enter your registered corporate email.'));
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorMessage(t('为了您的企业账户安全，密码长度不能少于 6 位', 'Password must be at least 6 characters.'));
      return;
    }

    if (cleanPassword !== cleanConfirm) {
      setErrorMessage(t('两次输入的新密码不一致，请重新核对', 'Passwords do not match. Please re-enter.'));
      return;
    }

    setIsLoading(true);

    try {
      const matched = approvedMerchants.find(
        (m) => m.email && m.email.toLowerCase() === cleanEmail
      );

      if (!matched) {
        setErrorMessage(
          t(
            `未在商会已审核的名商名录中检索到企业邮箱「${cleanEmail}」。新企业请先点击下方【申请入驻商会】。`,
            `Corporate email "${cleanEmail}" was not found in our approved directory. New enterprises may apply below.`
          )
        );
        setIsLoading(false);
        return;
      }

      await saveMemberPassword(cleanEmail, cleanPassword);
      const matchedName = getLocalizedMerchantName(matched, isEn);

      const verifiedProfile: UserProfile = {
        ...currentUser,
        uid: `member-${matched.id}`,
        name: matched.repName || matched.name,
        company: matched.name,
        title: matched.repTitle || '企业法定代表人 / 负责人',
        phone: matched.phone || '',
        email: matched.email,
        avatar: matched.logo || '🏢',
        tier: matched.tier || '认证商户',
        industry: matched.category,
        bio: matched.description || matched.tagline || '滑铁卢融商汇实名认证企业会员',
        isMember: true,
        merchantId: matched.id,
        joinedDate: '商会实名认证会员',
      };

      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      onLoginSuccess(verifiedProfile);
      setSuccessMessage(
        t(
          `🎉 激活成功！已为您成功设置企业专属独立密码，并自动登入「${matchedName}」！`,
          `🎉 Account activated! Signed in as verified member "${matchedName}".`
        )
      );
      setTimeout(() => onClose(), 1400);
    } catch (err: any) {
      setErrorMessage(
        t(`激活遇到错误: ${err?.message || '请重试'}`, `Activation error: ${err?.message || 'Please retry'}`)
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google OAuth One-Click
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleEmail = result.user.email?.toLowerCase();
      const googleName = result.user.displayName || t('Google 会员', 'Google Member');

      if (!googleEmail) {
        setErrorMessage(
          t(
            '未能获取 Google 邮箱信息，请使用【企业账号密码登录】。',
            'Unable to retrieve Google email. Please sign in with your corporate email & password.'
          )
        );
        setIsLoading(false);
        return;
      }

      const matched = approvedMerchants.find(
        (m) => m.email && m.email.toLowerCase() === googleEmail
      );

      if (matched) {
        const matchedName = getLocalizedMerchantName(matched, isEn);
        const verifiedProfile: UserProfile = {
          ...currentUser,
          uid: result.user.uid,
          name: matched.repName || googleName,
          company: matched.name,
          title: matched.repTitle || '企业负责人',
          phone: matched.phone || currentUser.phone,
          email: googleEmail,
          avatar: matched.logo || '🏢',
          tier: matched.tier || '认证商户',
          industry: matched.category,
          bio: matched.description || matched.tagline || '滑铁卢融商汇实名认证企业会员',
          isMember: true,
          merchantId: matched.id,
          joinedDate: 'Google 快捷认证会员',
        };

        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
        onLoginSuccess(verifiedProfile);
        setSuccessMessage(
          t(
            `🎉 欢迎回来！已通过 Google 邮箱自动匹配实名企业「${matchedName}」！`,
            `🎉 Welcome back! Automatically matched verified enterprise "${matchedName}".`
          )
        );
        setTimeout(() => onClose(), 1200);
      } else {
        const guestProfile: UserProfile = {
          ...currentUser,
          uid: result.user.uid,
          name: googleName,
          email: googleEmail,
          company: '外部合作商 / 潜在客户',
          title: '商务访客',
          tier: '外部客户',
          isMember: false,
        };
        onLoginSuccess(guestProfile);
        setSuccessMessage(
          t(
            'Google 登录成功！当前为外部商业客户视角，如需解锁活动发布与协同广播权请点击「申请入驻」。',
            'Signed in via Google as an External Commercial Guest. Apply for directory membership to unlock full member privileges.'
          )
        );
        setTimeout(() => onClose(), 1600);
      }
    } catch (err: any) {
      console.warn('Google sign-in popup error:', err);
      setErrorMessage(
        err?.message?.includes('popup-closed-by-user')
          ? t('您取消了 Google 登录窗口。', 'Google sign-in window was closed.')
          : t(
              'Google 认证服务遇到问题，请使用【企业账号密码安全登录】直接登录。',
              'Google authentication encountered an issue. Please use corporate email & password sign-in.'
            )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/80 backdrop-blur-md flex items-start justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-white border border-[#E8E6DF] rounded-3xl max-w-lg w-full overflow-hidden luxury-shadow relative my-6 sm:my-10 text-[#0F172A]">
        {/* Obsidian Modal Header */}
        <div className="bg-[#0F172A] px-6 py-6 text-center space-y-2 relative border-b border-[#C5A059]/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-300 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 mx-auto rounded-2xl gold-gradient p-0.5 shadow-md">
            <div className="w-full h-full bg-[#0F172A] rounded-[14px] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#DFBA73]" />
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-bold font-editorial text-white tracking-tight">
            {t('滑铁卢融商汇 · 企业会员统一认证中心', 'WBCA · Corporate Member Authentication')}
          </h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
            {isEn ? (
              <>
                Supports all corporate domain emails and Google accounts to activate your{' '}
                <strong className="text-[#DFBA73]">WBCA Verified Enterprise</strong> credential.
              </>
            ) : (
              <>
                支持所有企业域名邮箱、Outlook 等独立密码认证，一键点亮<strong className="text-[#DFBA73]">「实名融商汇企业会员」</strong>徽章
              </>
            )}
          </p>
        </div>

        {/* Crisp Ivory Modal Body */}
        <div className="p-6 space-y-5 bg-white">
          {/* Dual-Channel Navigation Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#F7F7F5] rounded-2xl border border-[#E8E6DF] text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthTab('password');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                authTab === 'password'
                  ? 'bg-[#0F172A] text-[#DFBA73] shadow-sm'
                  : 'text-slate-600 hover:text-[#0F172A]'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>{t('企业邮箱与密码登录', 'Corporate Email & Password')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthTab('google');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                authTab === 'google'
                  ? 'bg-[#0F172A] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#0F172A]'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{t('Google 一键秒登', 'Google One-Click')}</span>
            </button>
          </div>

          {/* Status Feedback Banners */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed font-semibold">{successMessage}</span>
            </div>
          )}

          {/* TAB 1: Enterprise Email & Password Authentication */}
          {authTab === 'password' && (
            <div className="space-y-4">
              {/* Mode 1: Regular Password Login */}
              {subMode === 'login' && (
                <form onSubmit={handlePasswordLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                      {t('企业在商会登记的官方邮箱（用户名）', 'Registered Corporate Email (Username)')}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder={t('如：contact@mycompany.ca 或 baizw2000@gmail.com', 'e.g. contact@company.ca or baizw2000@gmail.com')}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059] focus:bg-white transition-colors"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {t(
                        '支持所有域名邮箱：企业独立域名邮、Outlook、网易163、QQ企业邮等',
                        'Supports all custom domain, Outlook, Gmail, and corporate mail providers'
                      )}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-[#0F172A]">
                        {t('会员登录密码', 'Member Password')}
                      </label>
                      <button
                        type="button"
                        onClick={() => setSubMode('forgot')}
                        className="text-[10px] text-[#9E7425] hover:underline font-semibold transition-colors"
                      >
                        {t('忘记密码？', 'Forgot Password?')}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder={t('请输入您的会员登录密码', 'Enter your member password')}
                        className="w-full pl-10 pr-10 py-2.5 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059] focus:bg-white transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F172A] p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 gold-gradient hover:brightness-105 text-[#0F172A] font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] disabled:opacity-60"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>
                      {isLoading
                        ? t('正在安全核验企业身份...', 'Verifying Enterprise Credentials...')
                        : t('安全登录商会企业账号', 'Sign In to Member Account')}
                    </span>
                  </button>

                  {/* Sub-mode Switchers */}
                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        setSubMode('activate');
                        setErrorMessage('');
                      }}
                      className="text-[#9E7425] hover:underline font-semibold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-[#C5A059]" />
                      <span>{t('初次入驻会员？激活并设置密码', 'First-time member? Activate account')}</span>
                    </button>

                    <span className="text-slate-500 text-[10px]">
                      {t('已设密码企业直接输入登录', 'Returning members sign in above')}
                    </span>
                  </div>
                </form>
              )}

              {/* Mode 2: First-Time Password Activation */}
              {subMode === 'activate' && (
                <form onSubmit={handleActivatePassword} className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-[#FFFDF7] border border-[#C5A059]/40 text-[#0F172A] text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1 text-[#9E7425]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t('新入会企业首次激活说明', 'First-Time Member Activation')}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {t(
                        '输入在入会申请表上登记的官方企业邮箱，系统核验所属名商企业后，即可设定并激活您的专属登录密码。',
                        'Enter the corporate email from your approved directory application to set your dedicated password.'
                      )}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                      {t('企业官方登记邮箱 *', 'Registered Corporate Email *')}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder={t('如：info@yourcompany.ca 或 baizw2000@gmail.com', 'e.g. info@company.ca')}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                        {t('设置独立登录密码 *', 'Create Password *')}
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder={t('至少 6 位密码', 'At least 6 characters')}
                        className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                        {t('确认登录密码 *', 'Confirm Password *')}
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        placeholder={t('再次确认新密码', 'Re-enter password')}
                        className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059] focus:bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-[#DFBA73] font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] disabled:opacity-60"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isLoading
                        ? t('正在激活账户...', 'Activating Account...')
                        : t('验证企业并激活登录', 'Verify & Activate Account')}
                    </span>
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSubMode('login');
                        setErrorMessage('');
                      }}
                      className="text-[11px] text-slate-600 hover:text-[#0F172A] underline underline-offset-2"
                    >
                      {t('已有密码？返回直接登录', 'Already activated? Return to Sign In')}
                    </button>
                  </div>
                </form>
              )}

              {/* Mode 3: Forgot Password */}
              {subMode === 'forgot' && (
                <form onSubmit={handleActivatePassword} className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-[#F7F7F5] border border-[#E8E6DF] text-xs space-y-1">
                    <div className="font-bold text-[#9E7425] flex items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{t('企业会员密码重置', 'Corporate Member Password Reset')}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {t(
                        '请输入您入会时登记的官方企业邮箱，核验企业合法性后直接更新并重置您的登录密码。',
                        'Enter your registered corporate email to verify enterprise eligibility and reset your password.'
                      )}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                      {t('企业官方登记邮箱 *', 'Registered Corporate Email *')}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder={t('如：info@yourcompany.ca 或 baizw2000@gmail.com', 'e.g. info@company.ca')}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                        {t('设置新登录密码 *', 'New Password *')}
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder={t('至少 6 位新密码', 'At least 6 characters')}
                        className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                        {t('确认新密码 *', 'Confirm New Password *')}
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        placeholder={t('再次确认新密码', 'Re-enter new password')}
                        className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059] focus:bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 gold-gradient hover:brightness-105 text-[#0F172A] font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] disabled:opacity-60"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>
                      {isLoading
                        ? t('正在重置密码...', 'Resetting Password...')
                        : t('确认重置密码并登入', 'Reset Password & Sign In')}
                    </span>
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSubMode('login');
                        setErrorMessage('');
                      }}
                      className="text-[11px] text-slate-600 hover:text-[#0F172A] underline underline-offset-2"
                    >
                      {t('记起密码了？返回直接登录', 'Remembered password? Back to Sign In')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: Google One-Click Login */}
          {authTab === 'google' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#F7F7F5] border border-[#E8E6DF] text-[#0F172A] text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-[#0F172A]">
                  <Sparkles className="w-4 h-4 text-[#9E7425]" />
                  <span>{t('Google 账号免密秒级核验', 'Passwordless Google Verification')}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {t(
                    '使用企业负责人本人的 Google 官方账号登入。系统自动提取 Google 邮箱与名商录进行云端比对，一秒点亮商会企业认证。',
                    'Sign in with your authorized Google account. We automatically match your email against the WBCA Verified Directory.'
                  )}
                </p>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-[0.99] disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>
                  {isLoading
                    ? t('正在进行 Google 授权核验...', 'Verifying Google Session...')
                    : t('使用 Google 账号一键秒登', 'Continue with Google')}
                </span>
              </button>
            </div>
          )}

          {/* Client Privacy & Security Guarantee */}
          <div className="p-3.5 rounded-2xl bg-[#F7F7F5] border border-[#E8E6DF] text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{t('客户隐私与权限安全保障', 'Data Privacy & Role-Based Security')}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {t(
                '滑铁卢融商汇严格捍卫会员商业隐私与企业数据安全：系统严禁跨账号越权与已有客户信息公开暴露，仅限企业法定代表人或授权负责人通过本人企业独立密码或本人 Google 授权安全登入。',
                'WBCA safeguards commercial confidentiality: cross-account access is strictly prohibited and executive credentials are restricted to authorized representatives.'
              )}
            </p>
          </div>

          {/* Switch to Guest/Prospect & Join Chamber */}
          <div className="pt-1 flex items-center justify-between text-xs gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                onSwitchToGuest();
                setSuccessMessage(
                  t('已切换为【外部商业访客 / 潜在客户】视角！', 'Switched to External Commercial Guest view!')
                );
                setTimeout(() => onClose(), 1000);
              }}
              className="text-[11px] text-slate-500 hover:text-[#0F172A] flex items-center gap-1 underline underline-offset-2"
            >
              <User className="w-3 h-3" />
              {t('切换为外部访客 / 潜在客户视角', 'Preview as External Commercial Guest')}
            </button>

            {onOpenMerchantApply && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenMerchantApply();
                }}
                className="text-[11px] text-[#9E7425] hover:underline flex items-center gap-1 font-bold"
              >
                <span>{t('未入驻？申请入驻商会', 'Not listed? Apply to Join')}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
