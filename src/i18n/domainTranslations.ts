import { BusinessCategory, ChamberEvent, HelpPost, MemberTier, Merchant, RewardItem, UserProfile } from '../types';

export const CATEGORY_EN_MAP: Record<string, string> = {
  '全部': 'All Sectors',
  '科技研发': 'Tech & Innovation',
  '会计法律': 'Accounting & Legal',
  '地产建筑': 'Real Estate & Dev',
  '餐饮零售': 'Hospitality & Retail',
  '教育培训': 'Education & Advisory',
  '医疗健康': 'Healthcare & Wellness',
  '跨境物流': 'Cross-Border Logistics',
  '金融投资': 'Finance & Wealth',
  '未分类': 'General Advisory',
  '待认证': 'Unverified',
};

export function translateCategory(category: BusinessCategory | string, isEn: boolean): string {
  if (!isEn) return category;
  return CATEGORY_EN_MAP[category] || category;
}

export const TIER_EN_MAP: Record<string, string> = {
  '创会理事单位': 'Founding Council',
  '金牌会员单位': 'Premier Gold Member',
  '认证商户': 'Verified Corporate Member',
  '青年创客商户': 'Emerging Venture Member',
  '外部客户': 'External Guest',
  '访客体验': 'Guest Access',
};

export function translateTier(tier: MemberTier | string, isEn: boolean): string {
  if (!isEn) return tier;
  return TIER_EN_MAP[tier] || tier;
}

export const HELP_CATEGORY_EN_MAP: Record<string, string> = {
  '全部': 'All',
  '商机合作': 'Business Venture',
  '供需对接': 'Supply & Demand',
  '紧急求助': 'Urgent Advisory',
  '资源共享': 'Resource Exchange',
};

export function translateHelpCategory(category: HelpPost['category'] | string, isEn: boolean): string {
  if (!isEn) return category;
  return HELP_CATEGORY_EN_MAP[category] || category;
}

export const HELP_STATUS_EN_MAP: Record<string, string> = {
  '待对接': 'Open for Matching',
  '对接中': 'In Negotiation',
  '已圆满解决': 'Completed & Closed',
};

export function translateHelpStatus(status: HelpPost['status'] | string, isEn: boolean): string {
  if (!isEn) return status;
  return HELP_STATUS_EN_MAP[status] || status;
}

export const EVENT_TYPE_EN_MAP: Record<string, string> = {
  '全部': 'All Events',
  '高端峰会': 'Executive Summit',
  '私董会': 'Executive Roundtable',
  '投资酒会': 'Capital Reception',
  '公益慈善': 'Philanthropic Gala',
  '创业研讨': 'Founder Symposium',
  '业务推介': 'Enterprise Showcase',
};

export function translateEventType(type: ChamberEvent['type'] | string, isEn: boolean): string {
  if (!isEn) return type;
  return EVENT_TYPE_EN_MAP[type] || type;
}

export const REWARD_CATEGORY_EN_MAP: Record<string, string> = {
  '商机推广': 'Brand Spotlight',
  '高层社交': 'Executive Access',
  '媒体权益': 'Media Editorial',
  '商务津贴': 'Hospitality Credit',
};

export function translateRewardCategory(category: RewardItem['category'] | string, isEn: boolean): string {
  if (!isEn) return category;
  return REWARD_CATEGORY_EN_MAP[category] || category;
}

const REWARD_ITEM_EN_MAP: Record<number, { title: string; description: string; validPeriod: string }> = {
  1: {
    title: 'WBCA Summit VIP Front-Row Access',
    description: 'Complimentary VIP front-row seating at the Waterloo Business Convergence Summit, priority concierge check-in, and official acknowledgment in the summit program.',
    validPeriod: 'Redeemable prior to annual summit dates',
  },
  2: {
    title: 'WBCA Official Portal Featured Banner (1 Week)',
    description: 'Prime homepage spotlight placement across the WBCA digital directory and member network, showcasing your enterprise profile and member privileges.',
    validPeriod: 'Scheduled by Secretariat upon redemption',
  },
  3: {
    title: 'In-Depth Founder Feature in Waterloo Business Review',
    description: 'One-on-one interview by the WBCA editorial desk for a 2,000-word executive feature published across our official journal and partner media network.',
    validPeriod: 'Editorial completed within 30 days',
  },
  4: {
    title: '$200 CAD Fine-Dining Executive Hospitality Voucher',
    description: 'Redeemable toward private executive dining at WBCA partner venues, with private-suite minimum waiver and dedicated hospitality concierge.',
    validPeriod: 'Valid for 90 days from redemption',
  },
};

export function translateRewardItem(item: RewardItem, isEn: boolean): RewardItem {
  if (!isEn) return item;
  const mapped = REWARD_ITEM_EN_MAP[item.id];
  if (!mapped) {
    return {
      ...item,
      category: translateRewardCategory(item.category, true) as RewardItem['category'],
    };
  }
  return {
    ...item,
    title: mapped.title,
    description: mapped.description,
    validPeriod: mapped.validPeriod,
    category: translateRewardCategory(item.category, true) as RewardItem['category'],
  };
}

export function getLocalizedMerchantName(merchant: Pick<Merchant, 'name' | 'nameEn'>, isEn: boolean): string {
  if (isEn) {
    return (merchant.nameEn || merchant.name || '').trim();
  }
  return (merchant.name || merchant.nameEn || '').trim();
}

export function getLocalizedMerchantSecondaryName(merchant: Pick<Merchant, 'name' | 'nameEn'>, isEn: boolean): string {
  if (isEn) {
    return merchant.name && merchant.nameEn && merchant.name !== merchant.nameEn ? merchant.name : '';
  }
  return merchant.nameEn && merchant.nameEn !== merchant.name ? merchant.nameEn : '';
}

export function translateRelativeTime(val: string, isEn: boolean): string {
  if (!isEn || !val) return val;
  if (val === '刚刚') return 'Just now';
  if (val === '今天') return 'Today';
  if (val === '昨天') return 'Yesterday';
  return val;
}

const KNOWN_USER_STRINGS_EN: Record<string, string> = {
  'Brandon Bai (白政玮)': 'Brandon Bai',
  '滑铁卢融商汇认证商户': 'WBCA Verified Corporate Member',
  '企业创始人 / 投资顾问': 'Founder & Wealth Advisor',
  '2025年 真实测试会员': 'Verified Member · 2025',
  '滑铁卢融商汇实名认证企业会员，诚邀本地华商精英深度链接合作。':
    'Verified corporate member of the Waterloo Business Convergence Alliance, committed to strategic local partnerships and cross-sector growth.',
  '扎根滑铁卢地区，诚信经营，致力为本地社区及华商业界提供高品质专业金融投资与商业咨询服务。':
    'Rooted in Waterloo Region, delivering trusted financial advisory and corporate wealth solutions for the local business community.',
  '外部商业访客': 'External Commercial Guest',
  '外部商业访客 (未加入名录)': 'External Commercial Guest',
  '待认证企业 / 潜在客户': 'Unverified Enterprise / Prospect',
  '暂未加入商会实名名录': 'Non-Member Enterprise',
  '商业访客': 'Commercial Guest',
  '商务咨询': 'Business Advisory',
  '外部访客视角': 'Guest Access',
  '欢迎访问滑铁卢融商汇官网，您可浏览企业名录、商机信息并报名公开商务活动。':
    'Welcome to the WBCA official portal. Browse our verified enterprise directory, explore business opportunities, and register for open events.',
  '外部访客 / 潜在合作伙伴': 'Visiting Executive / Prospective Member',
  '尚未入驻滑铁卢融商汇企业名录，点击上方按钮即可提交企业入驻申请，解锁全部会员特权。':
    'Not yet listed in the WBCA Verified Directory. Submit your corporate application to unlock verified credentials, independent URLs, and AI matchmaking.',
  '新晋会员': 'New Member',
  '新入驻成员': 'Newly Onboarded Member',
  '实名企业成员': 'Verified Enterprise Member',
  '新注册实名企业成员。': 'Newly registered verified corporate member.',
  '商会实名会员': 'WBCA Verified Member',
  '融商汇认证企业': 'WBCA Certified Enterprise',
  '外部潜在客户': 'External Prospect',
  '商会秘书处': 'WBCA Secretariat',
  '滑铁卢融商汇官方': 'WBCA Official',
  '实名融商会员': 'Verified Member',
  'Google 快捷认证会员': 'Google Verified Member',
  '商会实名认证会员': 'WBCA Verified Member',
  '企业法定代表人 / 负责人': 'Managing Principal / Representative',
  '企业负责人': 'Managing Principal',
  '会员嘉宾': 'Guest Member',
  '融商汇成员': 'WBCA Member',
  '融商会员': 'Member',
};

export function translateUserField(value: string | undefined, isEn: boolean, fallback = ''): string {
  const raw = (value ?? '').trim();
  if (!raw) return fallback;
  if (!isEn) return raw;
  return KNOWN_USER_STRINGS_EN[raw] || translateCategory(translateTier(raw, true), true);
}

export function getLocalizedUserProfile(user: UserProfile, isEn: boolean): UserProfile {
  if (!isEn) return user;
  return {
    ...user,
    name: translateUserField(user.name, true),
    company: translateUserField(user.company, true),
    title: translateUserField(user.title, true),
    industry: translateCategory(user.industry, true) as string,
    joinedDate: translateUserField(user.joinedDate, true),
    bio: translateUserField(user.bio, true),
  };
}

export function translateTransactionTitle(title: string, isEn: boolean): string {
  if (!isEn || !title) return title;
  if (title === '每日登录商信签到奖励' || title === '每日名商打卡签到成功') {
    return 'Daily Trust Credit Check-In Bonus';
  }
  if (title === '全网发布商机互助需求') return 'Published Mutual-Aid Business Opportunity';
  if (title === '成功提交互助方案对接') return 'Submitted Strategic Solution Proposal';
  if (title === '出席线下峰会/沙龙现场核销打卡') return 'Event Attendance Verification Check-In Bonus';
  if (title.startsWith('参加活动现场核销奖励：')) {
    return `Event Attendance Check-In Bonus: ${title.replace('参加活动现场核销奖励：', '')}`;
  }
  if (title.startsWith('报名商会活动：')) {
    return `Event Registration: ${title.replace('报名商会活动：', '')}`;
  }
  if (title.startsWith('兑换特权：')) {
    return `Benefit Redeemed: ${title.replace('兑换特权：', '')}`;
  }
  if (title.startsWith('兑换商会特权')) {
    return `Alliance Benefit Redeemed ${title.replace('兑换商会特权', '').replace(/「/g, '"').replace(/」/g, '"')}`;
  }
  if (title.startsWith('完成商户资料实名入驻名录奖励：')) {
    return `Directory Verification Bonus: ${title.replace('完成商户资料实名入驻名录奖励：', '')}`;
  }
  if (title.startsWith('成功为商会推荐入驻新商户')) {
    return `New Enterprise Referral Bonus ${title.replace('成功为商会推荐入驻新商户', '').replace(/「/g, '"').replace(/」/g, '"')}`;
  }
  if (title.startsWith('发布互助需求')) {
    return `Escrowed Bounty for ${title.replace('发布互助需求', '').replace('托管悬赏', '').replace(/「/g, '"').replace(/」/g, '"').trim()}`;
  }
  return title;
}

const SYSTEM_TEXT_EN_MAP: Record<string, string> = {
  '不符合商会发布规范或已失效': 'No longer aligns with Alliance publishing standards or has expired',
  '不符合商会发布规范': 'Does not meet Alliance publishing guidelines',
  '商会平台内信沟通': 'In-Portal Direct Messaging',
  '未填': 'Not provided',
  '经会员实名反馈及秘书处核查，该商户存在失信履约及负面评价风险，暂予下架公示。':
    'Temporarily delisted by the Secretariat following verified member feedback and compliance risk review.',
  '涉嫌违约或严重负面舆情投诉，经商会秘书处核查暂予下架':
    'Temporarily delisted pending Secretariat review of compliance or service-delivery concerns.',
  '请补充滑铁卢地区实体经营资质或工商登记编号':
    'Please provide Waterloo Region business registration or local operating credentials.',
  '请补齐滑铁卢地区实体经营资质或工商注册文件':
    'Please submit Ontario / Waterloo Region business registration documents.',
  '滑铁卢融商汇认证新晋会员单位': 'Newly Verified Member of Waterloo Business Convergence Alliance',
  '扎根滑铁卢地区，诚信经营，致力为本地社区及华商业界提供高品质专业服务。':
    'Serving Waterloo Region with integrity and excellence across professional and commercial services.',
  '为滑铁卢融商汇会员提供专属9折会友优惠及优先接待服务。':
    'Exclusive 10% member privilege and priority executive consultation for WBCA members.',
};

export function translateSystemText(text: string | undefined, isEn: boolean): string {
  const raw = (text ?? '').trim();
  if (!raw || !isEn) return raw;
  return SYSTEM_TEXT_EN_MAP[raw] || raw;
}

