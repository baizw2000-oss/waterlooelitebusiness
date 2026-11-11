import { Merchant, HelpPost, ChamberEvent, RewardItem, LeaderboardUser, PointsTransaction } from '../types';

// Clean baseline for real customer testing — zero fake/mock businesses
export const INITIAL_MERCHANTS: Merchant[] = [];

// Clean baseline for real customer testing — zero fake posts
export const INITIAL_HELP_POSTS: HelpPost[] = [];

// Clean baseline for real customer testing — zero fake events
export const INITIAL_EVENTS: ChamberEvent[] = [];

// Chamber Points Redemption Catalog (Official Chamber Benefits)
export const INITIAL_REWARD_ITEMS: RewardItem[] = [
  {
    id: 1,
    title: '滑铁卢融商峰会 VIP 首排入席资格',
    category: '高层社交',
    pointsCost: 500,
    stock: 20,
    description: '尊享融商峰会前排嘉宾贵宾席位、专属迎宾签到与大会名录特别鸣谢致辞。',
    validPeriod: '长期有效 · 峰会举办前兑换',
    iconName: 'Award'
  },
  {
    id: 2,
    title: '融商汇官方网站 / App 黄金首页展位 (1周)',
    category: '商机推广',
    pointsCost: 800,
    stock: 5,
    description: '在商会数字名录首页置顶轮播展示企业形象与专属特权，全网会员触达。',
    validPeriod: '兑换后由秘书处排期上线',
    iconName: 'Sparkles'
  },
  {
    id: 3,
    title: '融商企业家内刊《滑铁卢商业周评》深度专访',
    category: '媒体权益',
    pointsCost: 1500,
    stock: 3,
    description: '商会采编团队一对一专访创始人，撰写2000字深度商业报道并在公众号及合作媒体矩阵发布。',
    validPeriod: '兑换后30天内完成采编',
    iconName: 'FileText'
  },
  {
    id: 4,
    title: '滑铁卢星级商务宴请 $200 加币礼遇抵用金',
    category: '商务津贴',
    pointsCost: 1200,
    stock: 10,
    description: '可用于商会合作星级餐厅的高端商务宴请，尊享包房免低消及特级接待服务。',
    validPeriod: '自兑换起90天内有效',
    iconName: 'Utensils'
  }
];

export const INITIAL_LEADERBOARD: LeaderboardUser[] = [];

export const INITIAL_TRANSACTIONS: PointsTransaction[] = [];
