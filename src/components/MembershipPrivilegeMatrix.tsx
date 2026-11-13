import React, { useState } from 'react';
import { 
  ShieldCheck, 
  XCircle, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Sparkles, 
  ArrowRight, 
  Building2, 
  Users, 
  Mail, 
  Award, 
  Calendar, 
  FileCheck2
} from 'lucide-react';
import { UserProfile } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { translateUserField } from '../i18n/domainTranslations';

interface MembershipPrivilegeMatrixProps {
  user: UserProfile;
  onOpenApplyModal: () => void;
  onOpenLogin: () => void;
  variant?: 'inline' | 'modal';
  onClose?: () => void;
}

export const MembershipPrivilegeMatrix: React.FC<MembershipPrivilegeMatrixProps> = ({
  user,
  onOpenApplyModal,
  onOpenLogin,
  variant = 'inline',
  onClose,
}) => {
  const { isEn, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'matrix' | 'steps'>('matrix');

  const comparisonRows = [
    {
      title: t('商户独立建档与全网检索', 'Dedicated Profile & Search Indexing'),
      icon: Building2,
      guest: {
        label: t('无法建档', 'No Directory Listing'),
        desc: t(
          '仅限公开查阅，企业无法在滑铁卢融商汇挂牌，无专属主页与 Google 索引。',
          'Read-only browsing. No verified enterprise card, custom permalink, or structured search visibility.'
        ),
      },
      member: {
        label: t('专属独立建档 + SEO 直达', 'Independent URL + SEO Indexing'),
        desc: t(
          '拥有 ?merchant=ID 独立永久直达网址、二维码名片海报生成权，享搜索引擎深度收录。',
          'Includes a permanent ?merchant=ID direct URL, downloadable QR credential poster, and Schema.org indexing.'
        ),
      },
    },
    {
      title: t('商机合作与采购互助发布', 'Opportunity Broadcasts & Mutual Aid'),
      icon: Users,
      guest: {
        label: t('只读旁观权限', 'View-Only Access'),
        desc: t(
          '无权发布供需采购与业务协作需求，无法调动商会庞大商业网络。',
          'Pending Secretariat pre-screening for submissions; cannot dispatch automated network broadcasts.'
        ),
      },
      member: {
        label: t('全员邮件广播推送', 'Instant Member-Wide Dispatch'),
        desc: t(
          '自主发布商机互助悬赏，系统即刻向 100+ 认证华商决策层邮箱派发全员通报。',
          'Publish strategic RFPs and collaboration inquiries dispatched immediately to 100+ verified executive inboxes.'
        ),
      },
    },
    {
      title: t('实名企业决策层直通专线', 'Direct Executive Contact Line'),
      icon: Mail,
      guest: {
        label: t('脱敏加密保护', 'Masked Contact Fields'),
        desc: t(
          '企业负责人手机、微信、办公直邮受隐私保护隐藏，无法直接联系。',
          'Direct phone numbers, personal WeChat IDs, and executive emails remain privacy-masked.'
        ),
      },
      member: {
        label: t('实名双向直接连通', 'Verified Direct Access'),
        desc: t(
          '一键查看认证商户高管电话、微信直联码与工作邮箱，高效建立 B2B 业务协作。',
          'One-click access to verified leadership phones, WeChat handles, and corporate emails for swift B2B execution.'
        ),
      },
    },
    {
      title: t('商会官方公信力与AI商誉报告', 'Alliance Seal & AI Reputation Audit'),
      icon: ShieldCheck,
      guest: {
        label: t('无资质信用背书', 'No Trust Endorsement'),
        desc: t(
          '缺乏本地权威商会背书，新客户与合作伙伴建立信任成本高昂。',
          'No regional institutional accreditation, increasing friction in building new enterprise client trust.'
        ),
      },
      member: {
        label: t('AAA 级合规认证 + AI 评估', 'AAA Verification + AI Dossier'),
        desc: t(
          '授予融商汇数字认证徽章，并可随时生成 Gemini AI 权威第三方商誉分析报告。',
          'Display the official WBCA Trust Seal and generate on-demand Gemini AI credibility and sentiment dossiers.'
        ),
      },
    },
    {
      title: t('高端闭门私董会与领袖峰会', 'Executive Roundtables & Summits'),
      icon: Calendar,
      guest: {
        label: t('门槛限制 / 仅限公开场', 'Public Sessions Only'),
        desc: t(
          '无法参与季度高管私董会、UW 科技创业闭门晚宴等高净值核心圈层活动。',
          'Restricted from quarterly closed-door roundtables, investor salons, and private leadership dinners.'
        ),
      },
      member: {
        label: t('VIP 优先席位 + 动态电子票', 'VIP Seating + Dynamic E-Pass'),
        desc: t(
          '凭独立动态二维码电子入场券验票入场，现场扫码即得 +50/+100 商会高额积分。',
          'Priority admission with dynamic QR E-Passes and automatic +50/+100 Trust Credit awards on check-in.'
        ),
      },
    },
    {
      title: t('名商专属积分通兑商业资源', 'Trust Credit Resource Redemption'),
      icon: Award,
      guest: {
        label: t('0 积分 / 无通兑权益', 'Zero Credit Privileges'),
        desc: t(
          '无法参与积分累积与荣誉商城资源兑换。',
          'Ineligible to accrue Trust Credits or redeem homepage spotlights and hospitality benefits.'
        ),
      },
      member: {
        label: t('官网展位 & 年度名册推广', 'Homepage Banners & Media Features'),
        desc: t(
          '每日签到、履约协作赚取积分，通兑商会官网首屏推荐展位与年度纸质名册整版曝光。',
          'Earn credits daily and redeem prime portal placements, summit VIP seats, and Waterloo Business Review features.'
        ),
      },
    },
  ];

  const steps = [
    {
      step: '01',
      title: t('在线提交企业登记', 'Submit Corporate Profile'),
      desc: t(
        '2分钟快速填报企业/个人执业名称、行业领域及联络方式，支持自主上传 Logo 或个人职业头像。',
        'Complete a 2-minute digital filing with your enterprise name, sector, leadership contact details, and corporate logo or executive portrait.'
      ),
      tag: t('极速便捷 · 免繁琐材料', '2-Min Streamlined Intake'),
    },
    {
      step: '02',
      title: t('秘书处准入高效核验', 'Secretariat Expedited Review'),
      desc: t(
        '系统自动生成《入驻待审批申报单》派发至秘书处管理员，当天高效核验真实性与合规性。',
        'Our automated dossier routes straight to the WBCA Secretariat for same-day verification of business authenticity and standing.'
      ),
      tag: t('专人响应 · 当天办结', 'Same-Day Verification'),
    },
    {
      step: '03',
      title: t('点亮全网认证商录', 'Activate Verified Listing'),
      desc: t(
        '核准后即刻点亮名商名录、生成专属独立分享直达链接与名片海报，并纳入全员商机通报池！',
        'Once approved, your ?merchant=ID permalink, shareable credential poster, and member-wide opportunity alerts go live immediately.'
      ),
      tag: t('尊享背书 · 开启裂变', 'Instant Visibility & Access'),
    },
  ];

  const companyDisplay = translateUserField(user.company, isEn) || translateUserField(user.name, isEn);

  const content = (
    <div className="space-y-6">
      {/* Editorial Section Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-[#E8E6DF] pb-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="text-[11px] font-bold text-[#9E7425] uppercase tracking-[0.2em]">
            Membership Privileges &amp; Fast-Track Onboarding
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            {isEn ? (
              <>
                Member Privileges vs. Commercial Guests <span className="text-gold-ink">Access Matrix</span>
              </>
            ) : (
              <>
                尊享会员特权 vs 外部商业访客 <span className="text-gold-ink">权益深度对比</span>
              </>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            {t(
              '加入滑铁卢非营利华商实名联合体。以权威商会公信力背书、本地核心商机池与全员邮件直达，为您的企业构筑长期商业护城河。',
              'Join Waterloo Region’s verified non-profit executive alliance. Build enduring commercial authority with institutional accreditation, direct member access, and targeted deal flow.'
            )}
          </p>
        </div>

        {/* Clean Segmented Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-[#E8E6DF] shadow-sm self-stretch sm:self-auto">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'matrix'
                ? 'bg-[#0F172A] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#0F172A]'
            }`}
          >
            {t('权益矩阵对比', 'Privilege Matrix')}
          </button>
          <button
            onClick={() => setActiveTab('steps')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'steps'
                ? 'bg-[#0F172A] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#0F172A]'
            }`}
          >
            {t('3步入会通道', '3-Step Onboarding')}
          </button>
        </div>
      </div>

      {/* Dynamic Current Perspective Callout */}
      <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 luxury-shadow ${
        user.isMember 
          ? 'bg-emerald-50/70 border-emerald-200 text-[#0F172A]' 
          : 'bg-white border-[#C5A059]/40 text-[#0F172A]'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg border flex-shrink-0 ${
            user.isMember 
              ? 'bg-emerald-600 text-white border-emerald-700' 
              : 'bg-[#0F172A] text-[#DFBA73] border-[#C5A059]/50'
          }`}>
            {user.isMember ? '👑' : '🏛️'}
          </div>
          <div>
            <div className="text-xs font-bold text-[#0F172A] flex flex-wrap items-center gap-2">
              <span>{t('当前访问视角：', 'Active Access Tier:')}</span>
              <span className={`font-semibold ${
                user.isMember ? 'text-emerald-700' : 'text-[#9E7425]'
              }`}>
                {user.isMember
                  ? t(`已认证会员企业（${companyDisplay}）`, `Verified Member (${companyDisplay})`)
                  : t('外部商业访客 / 潜在客户（只读受限模式）', 'External Guest / Prospective Member (Restricted Preview)')}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              {user.isMember 
                ? t(
                    '您已享有全网认证建档、商机全员邮件广播与私董活动报名资格，信用积分正常累积中。',
                    'Full verified listing, network-wide opportunity broadcasts, executive roundtables, and Trust Credit accrual are active on your account.'
                  )
                : t(
                    '外部访客受限 6 项核心商机发布、高管实名直联与独立 SEO 建档特权。完成 2 分钟实名登记即可全量解锁。',
                    'Guest visitors are restricted across 6 core privileges including direct executive access and ?merchant=ID SEO listings. Complete the 2-minute filing to unlock full access.'
                  )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-shrink-0">
          {!user.isMember ? (
            <>
              <button
                onClick={onOpenApplyModal}
                className="flex-1 sm:flex-initial px-4 py-2.5 gold-gradient text-[#0F172A] font-bold rounded-xl text-xs shadow-sm hover:brightness-105 transition-all flex items-center justify-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{t('立即申请入驻', 'Apply Now')}</span>
              </button>
              <button
                onClick={onOpenLogin}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold rounded-xl text-xs transition-colors"
              >
                {t('会员登录', 'Sign In')}
              </button>
            </>
          ) : (
            <button
              onClick={onOpenApplyModal}
              className="px-4 py-2 bg-[#F7F7F5] border border-[#E8E6DF] hover:border-[#C5A059] text-[#0F172A] text-xs font-semibold rounded-xl transition-all"
            >
              {t('更新/增补企业档案', 'Update / Add Listing')}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'matrix' ? (
        <div className="overflow-hidden rounded-2xl border border-[#E8E6DF] bg-white luxury-shadow">
          {/* Table Header */}
          <div className="grid grid-cols-12 bg-[#0F172A] text-xs font-semibold text-white py-3.5 px-4 sm:px-6">
            <div className="col-span-5 sm:col-span-4 flex items-center gap-2">
              <span>{t('商会赋能与核心特权维度', 'Privilege Dimension')}</span>
            </div>
            <div className="col-span-3 sm:col-span-4 text-center sm:text-left text-slate-300 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-400 hidden sm:inline" />
              <span>{t('外部商业访客 (受限)', 'External Guest (Limited)')}</span>
            </div>
            <div className="col-span-4 sm:col-span-4 text-right sm:text-left text-[#DFBA73] flex items-center gap-1.5 sm:justify-start justify-end">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#DFBA73] hidden sm:inline" />
              <span>{t('融商汇认证会员 (尊享)', 'Verified Member (Full Access)')}</span>
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-[#E8E6DF]">
            {comparisonRows.map((row, idx) => {
              const Icon = row.icon;
              return (
                <div 
                  key={idx}
                  className="grid grid-cols-12 py-4 px-4 sm:px-6 items-start sm:items-center gap-2 hover:bg-[#F7F7F5]/60 transition-colors"
                >
                  {/* Dimension */}
                  <div className="col-span-5 sm:col-span-4 pr-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-[#F7F7F5] border border-[#E8E6DF] text-[#9E7425] flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] leading-snug">
                        {row.title}
                      </h4>
                    </div>
                  </div>

                  {/* Guest */}
                  <div className="col-span-3 sm:col-span-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-700 text-xs font-semibold">
                      <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{row.guest.label}</span>
                    </div>
                    <p className="hidden sm:block text-[11px] text-slate-500 leading-relaxed pr-2">
                      {row.guest.desc}
                    </p>
                  </div>

                  {/* Member */}
                  <div className="col-span-4 sm:col-span-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-[#0F172A] text-xs font-bold">
                      <Unlock className="w-3.5 h-3.5 flex-shrink-0 text-[#9E7425]" />
                      <span className="truncate text-[#9E7425]">{row.member.label}</span>
                    </div>
                    <p className="hidden sm:block text-[11px] text-slate-600 leading-relaxed">
                      {row.member.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Conversion Strip */}
          <div className="p-5 sm:p-6 bg-[#F7F7F5] border-t border-[#E8E6DF] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-0.5 text-center sm:text-left">
              <h4 className="font-editorial text-base font-bold text-[#0F172A] flex items-center justify-center sm:justify-start gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C5A059]" />
                {t(
                  '仅需 2 分钟，让您的企业在滑铁卢主流华商生态中脱颖而出',
                  'Elevate your enterprise standing across the Waterloo business community in just 2 minutes'
                )}
              </h4>
              <p className="text-xs text-slate-600">
                {t(
                  '通过审核后，即刻获得商会官网认证展示、专属 ?merchant=ID 直达档案与全员商机邮件广播资格',
                  'Upon Secretariat verification, immediately activate your ?merchant=ID profile, QR credential card, and member broadcast privileges.'
                )}
              </p>
            </div>

            <button
              onClick={onOpenApplyModal}
              className="w-full sm:w-auto px-6 py-3 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 group border border-[#C5A059]/40"
            >
              <span className="text-[#DFBA73]">
                {t('立即申请入驻名商名录', 'Apply for Directory Listing')}
              </span>
              <ArrowRight className="w-4 h-4 text-[#DFBA73] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      ) : (
        /* 3-Step Fast-Track Membership Onboarding Guide */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((st, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white border border-[#E8E6DF] hover:border-[#C5A059]/60 flex flex-col justify-between luxury-shadow transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E8E6DF] pb-3">
                    <span className="text-3xl font-editorial font-bold text-[#C5A059]">
                      {st.step}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {st.tag}
                    </span>
                  </div>

                  <h3 className="font-editorial text-lg font-bold text-[#0F172A]">
                    {st.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed pl-3 border-l-2 border-[#C5A059]/50">
                    {st.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E8E6DF] flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>{t('流程时效：当天响应', 'Turnaround: Same-Day Review')}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E8E6DF] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs luxury-shadow">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-[#F7F7F5] border border-[#E8E6DF] text-[#9E7425]">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-[#0F172A]">
                  {t('支持哪些类型主体加入？', 'Eligible Entity Types')}
                </div>
                <div className="text-slate-600">
                  {t(
                    '支持安省注册商业公司（有限责任/合伙公司）以及个人独立专家执业顾问（地产/保险/法律/财税等）。',
                    'Open to Ontario-registered corporations, partnerships, and licensed independent practitioners (Real Estate, Wealth, Legal, CPA).'
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onOpenApplyModal}
              className="w-full sm:w-auto px-5 py-2.5 gold-gradient text-[#0F172A] font-bold rounded-xl text-xs whitespace-nowrap shadow-sm flex items-center justify-center gap-1.5 hover:brightness-105 transition-all"
            >
              <Building2 className="w-4 h-4" />
              {t('开始 2 分钟极速入驻申请', 'Start 2-Minute Application')}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-[#0F172A]/75 backdrop-blur-md overflow-y-auto animate-in fade-in">
        <div className="max-w-4xl w-full my-4 bg-[#F7F7F5] border border-[#E8E6DF] rounded-2xl p-6 shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white border border-[#E8E6DF] text-slate-500 hover:text-[#0F172A] transition-colors"
          >
            ✕
          </button>
          {content}
        </div>
      </div>
    );
  }

  return content;
};
