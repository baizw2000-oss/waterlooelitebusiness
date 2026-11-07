export type TabType = 'home' | 'directory' | 'help' | 'events' | 'points' | 'profile';

export type BusinessCategory =
  | '全部'
  | '科技研发'
  | '会计法律'
  | '地产建筑'
  | '餐饮零售'
  | '教育培训'
  | '医疗健康'
  | '跨境物流'
  | '金融投资';

export type MemberTier = '创会理事单位' | '金牌会员单位' | '认证商户' | '青年创客商户';

export interface Merchant {
  id: string | number;
  name: string;
  nameEn: string;
  category: BusinessCategory;
  tier: MemberTier;
  entityType?: 'company' | 'individual'; // 'company' (企业Logo) | 'individual' (个人照片/头像)
  logo: string; // 企业Logo图片或个人照片 (支持图片URL、Base64或Emoji徽标)
  photoUrl?: string; // 负责人个人独立照片 (可选，若企业已有Logo但同时提供个人头像)
  tagline: string;
  description: string;
  repName: string;
  repTitle: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  establishedYear: number;
  rating: number; // 0-5
  reviewCount: number;
  credibilityScore: number; // 0-100
  tags: string[];
  services: string[];
  memberPrivilege: string; // 会员专属权益
  verified: boolean;
  featured: boolean;
  ownerUid?: string;
  auditStatus?: 'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED' | 'SUSPENDED';
  isDelisted?: boolean;
  delistReason?: string;
  delistedAt?: string;
  delistedBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  appliedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  sampleReviews?: {
    author: string;
    date: string;
    content: string;
    rating: number;
  }[];
}

export interface HelpOffer {
  id: string | number;
  postId?: string | number;
  responderUid?: string;
  responderName: string;
  responderCompany: string;
  content: string;
  createdAt: string;
  accepted?: boolean;
}

export interface HelpPost {
  id: string | number;
  authorUid?: string;
  authorName: string;
  authorCompany: string;
  authorAvatar: string;
  title: string;
  category: '商机合作' | '供需对接' | '紧急求助' | '资源共享';
  description: string;
  rewardPoints: number;
  createdAt: string;
  status: '待对接' | '对接中' | '已圆满解决';
  responsesCount: number;
  tags: string[];
  contactInfo: string;
  offers: HelpOffer[];
}

export interface ChamberEvent {
  id: string | number;
  title: string;
  type: '高端峰会' | '私董会' | '投资酒会' | '公益慈善' | '创业研讨';
  date: string;
  time: string;
  location: string;
  capacity: number;
  registeredCount: number;
  pointsRequired: number; // 0 = 免费
  pointsReward: number; // 签到可得积分
  coverImage: string;
  description: string;
  agenda: { time: string; topic: string; speaker: string }[];
  isRegistered?: boolean;
  ticketQrCode?: string;
  checkedIn?: boolean;
}

export interface PointsTransaction {
  id: string;
  userId?: string;
  title: string;
  change: number; // positive or negative
  date: string;
  type: 'CHECKIN' | 'EVENT_ATTEND' | 'HELP_SOLVE' | 'POST_REWARD' | 'REDEEM' | 'NEW_MEMBER';
}

export interface RewardItem {
  id: number;
  title: string;
  category: '商机推广' | '高层社交' | '媒体权益' | '商务津贴';
  pointsCost: number;
  stock: number;
  description: string;
  validPeriod: string;
  iconName: string;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  company: string;
  avatar: string;
  points: number;
  helpedCount: number;
  tier: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  company: string;
  title: string;
  phone: string;
  avatar: string;
  tier: MemberTier;
  points: number;
  bio: string;
  industry: string;
  joinedDate: string;
  hasCheckedInToday?: boolean;
  lastCheckinDate?: string;
  wechatId?: string;
  address?: string;
  registeredEventIds?: (string | number)[];
  checkedInEventIds?: (string | number)[];
}

export interface AIReputationResult {
  credibilityScore: number;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'ATTENTION_NEEDED';
  trustTier: string;
  analysisSummary: string;
  strengths: string[];
  riskPoints: string[];
  googleSearchSentiment: {
    positiveRatio: number;
    neutralRatio: number;
    negativeRatio: number;
    mentionFrequency: string;
  };
  actionableRecommendations: string[];
  source?: string;
  notice?: string;
}

export interface AIMatchResult {
  matchRationale: string;
  recommendedMemberIds: (number | string)[];
  suggestedNextSteps: string[];
  confidenceScore: number;
  source?: string;
  notice?: string;
}
