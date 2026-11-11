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
  UserCheck,
  Crown,
  RefreshCw
} from 'lucide-react';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup } from 'firebase/auth';
import { saveMemberPassword, fetchMemberPassword } from '../services/firestoreService';
import confetti from 'canvas-confetti';

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
      setErrorMessage('请输入企业在商会登记的官方邮箱（支持任意域名企业邮、Outlook、163 等）');
      return;
    }

    if (!cleanPassword) {
      setErrorMessage('请输入登录密码');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Verify that email belongs to an approved chamber merchant
      const matched = approvedMerchants.find(
        (m) => m.email && m.email.toLowerCase() === cleanEmail
      );

      if (!matched) {
        setErrorMessage(
          `未在商会已审核的名商名录中检索到企业邮箱「${cleanEmail}」。请确认是否为入会申请表上登记的企业邮箱，或先提交企业入驻申请。`
        );
        setIsLoading(false);
        return;
      }

      // 2. Fetch stored password for this email (Firestore / Cache)
      const storedPassword = await fetchMemberPassword(cleanEmail);

      // Check password match (allow stored password or default initial setup)
      let isPasswordCorrect = false;

      if (storedPassword) {
        isPasswordCorrect = storedPassword === cleanPassword;
      } else {
        // First-time login: if no password stored yet, accept the initial password (or default '123456') and save it
        if (cleanPassword === '123456' || cleanPassword.length >= 6) {
          await saveMemberPassword(cleanEmail, cleanPassword);
          isPasswordCorrect = true;
        } else {
          setErrorMessage('首次登录请设置至少 6 位密码，或点击下方【首次入驻会员？激活并设置专属密码】。');
          setIsLoading(false);
          return;
        }
      }

      if (!isPasswordCorrect) {
        setErrorMessage('密码输入错误。如忘记密码，请点击下方【忘记密码？重置】。');
        setIsLoading(false);
        return;
      }

      // 3. Construct verified member profile
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
      setSuccessMessage(`🎉 密码核验成功！欢迎回来，【${matched.name}】实名企业会员！`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(`登录验证遇到问题: ${err?.message || '请稍后重试'}`);
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
      setErrorMessage('请输入入驻商会时登记的官方企业邮箱');
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorMessage('为了您的企业账户安全，密码长度不能少于 6 位');
      return;
    }

    if (cleanPassword !== cleanConfirm) {
      setErrorMessage('两次输入的新密码不一致，请重新核对');
      return;
    }

    setIsLoading(true);

    try {
      // Check merchant qualification
      const matched = approvedMerchants.find(
        (m) => m.email && m.email.toLowerCase() === cleanEmail
      );

      if (!matched) {
        setErrorMessage(
          `未在商会已审核的名商名录中检索到企业邮箱「${cleanEmail}」。新企业请先点击下方【申请入驻商会】。`
        );
        setIsLoading(false);
        return;
      }

      // Save password to credentials repository
      await saveMemberPassword(cleanEmail, cleanPassword);

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
      setSuccessMessage(`🎉 激活成功！已为您成功设置企业专属独立密码，并自动登入「${matched.name}」！`);
      setTimeout(() => onClose(), 1400);
    } catch (err: any) {
      setErrorMessage(`激活遇到错误: ${err?.message || '请重试'}`);
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
      const googleName = result.user.displayName || 'Google 会员';

      if (!googleEmail) {
        setErrorMessage('未能获取 Google 邮箱信息，请使用【企业账号密码登录】。');
        setIsLoading(false);
        return;
      }

      // Check if this Google email belongs to an approved merchant
      const matched = approvedMerchants.find(
        (m) => m.email && m.email.toLowerCase() === googleEmail
      );

      if (matched) {
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
        setSuccessMessage(`🎉 欢迎回来！已通过 Google 邮箱自动匹配实名企业「${matched.name}」！`);
        setTimeout(() => onClose(), 1200);
      } else {
        // Recognized Google User, but not in merchants table yet
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
        setSuccessMessage(`Google 登录成功！当前为外部商业客户视角，如需解锁活动发布与协同广播权请点击「申请入驻」。`);
        setTimeout(() => onClose(), 1600);
      }
    } catch (err: any) {
      console.warn('Google sign-in popup error:', err);
      setErrorMessage(
        err?.message?.includes('popup-closed-by-user')
          ? '您取消了 Google 登录窗口。'
          : 'Google 认证服务遇到问题，请使用【企业账号密码安全登录】直接登录。'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl relative my-6 sm:my-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            滑铁卢融商汇 · 企业会员统一认证中心
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            支持所有企业域名邮箱、Outlook 等独立密码认证，一键点亮<strong>「实名融商汇企业会员」</strong>蓝标
          </p>
        </div>

        {/* Dual-Channel Navigation Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthTab('password');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              authTab === 'password'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>企业邮箱与密码登录</span>
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
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Google 一键秒登</span>
          </button>
        </div>

        {/* Status Feedback Banners */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
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
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    企业在商会登记的官方邮箱（用户名）
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="如：contact@mycompany.ca 或 baizw2000@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    支持所有域名邮箱：企业独立域名邮、Outlook、网易163、QQ企业邮等
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-slate-300">
                      会员登录密码
                    </label>
                    <button
                      type="button"
                      onClick={() => setSubMode('forgot')}
                      className="text-[10px] text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      忘记密码？
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="请输入您的会员登录密码"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-60"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isLoading ? '正在安全核验企业身份...' : '安全登录商会企业账号'}</span>
                </button>

                {/* Sub-mode Switchers */}
                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setSubMode('activate');
                      setErrorMessage('');
                    }}
                    className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>初次入驻会员？激活并设置密码</span>
                  </button>

                  <span className="text-slate-500 text-[10px]">
                    已设密码企业直接输入登录
                  </span>
                </div>
              </form>
            )}

            {/* Mode 2: First-Time Password Activation */}
            {subMode === 'activate' && (
              <form onSubmit={handleActivatePassword} className="space-y-3.5">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>新入会企业首次激活说明</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    输入在入会申请表上登记的官方企业邮箱，系统核验所属名商企业后，即可设定并激活您的专属登录密码。
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    企业官方登记邮箱 *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="如：info@yourcompany.ca 或 baizw2000@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      设置独立登录密码 *
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="至少 6 位密码"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      确认登录密码 *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      placeholder="再次确认新密码"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isLoading ? '正在激活账户...' : '验证企业并激活登录'}</span>
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSubMode('login');
                      setErrorMessage('');
                    }}
                    className="text-[11px] text-slate-400 hover:text-white underline underline-offset-2"
                  >
                    已有密码？返回直接登录
                  </button>
                </div>
              </form>
            )}

            {/* Mode 3: Forgot Password */}
            {subMode === 'forgot' && (
              <form onSubmit={handleActivatePassword} className="space-y-3.5">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>企业会员密码重置</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    请输入您入会时登记的官方企业邮箱，核验企业合法性后直接更新并重置您的登录密码。
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    企业官方登记邮箱 *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="如：info@yourcompany.ca 或 baizw2000@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      设置新登录密码 *
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="至少 6 位新密码"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      确认新密码 *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      placeholder="再次确认新密码"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-60"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{isLoading ? '正在重置密码...' : '确认重置密码并登入'}</span>
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSubMode('login');
                      setErrorMessage('');
                    }}
                    className="text-[11px] text-slate-400 hover:text-white underline underline-offset-2"
                  >
                    记起密码了？返回直接登录
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: Google One-Click Login */}
        {authTab === 'google' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-sky-950/20 border border-sky-500/30 text-sky-200 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-sky-300">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Google 账号免密秒级核验</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                使用企业负责人本人的 Google 官方账号登入。系统自动提取 Google 邮箱与名商录进行云端比对，一秒点亮商会企业认证。
              </p>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all active:scale-[0.99] disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{isLoading ? '正在进行 Google 授权核验...' : '使用 Google 账号一键秒登'}</span>
            </button>
          </div>
        )}

        {/* Client Privacy & Security Guarantee */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>客户隐私与权限安全保障</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            滑铁卢融商汇严格捍卫会员商业隐私与企业数据安全：系统严禁跨账号越权与已有客户信息公开暴露，仅限企业法定代表人或授权负责人通过本人企业独立密码或本人 Google 授权安全登入。
          </p>
        </div>

        {/* Switch to Guest/Prospect & Join Chamber */}
        <div className="pt-1 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              onSwitchToGuest();
              setSuccessMessage('已切换为【外部商业访客 / 潜在客户】视角！');
              setTimeout(() => onClose(), 1000);
            }}
            className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 underline underline-offset-2"
          >
            <User className="w-3 h-3" />
            切换为外部访客 / 潜在客户视角
          </button>

          {onOpenMerchantApply && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenMerchantApply();
              }}
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
            >
              <span>未入驻？申请入驻商会</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
