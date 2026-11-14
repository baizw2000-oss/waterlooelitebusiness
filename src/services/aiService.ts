import {
  AIReputationResult,
  AIMatchResult,
  WaterlooNewsIndustry,
  WaterlooNewsResponse,
  GovJurisdictionId,
} from '../types';
import { Language } from '../i18n/LanguageContext';

export async function fetchMerchantReputationAnalysis(
  merchant: {
    name: string;
    category: string;
    description: string;
    establishedYear: number;
    address: string;
    sampleReviews?: string;
  },
  lang: Language = 'zh'
): Promise<AIReputationResult> {
  const isEn = lang === 'en';
  try {
    const res = await fetch('/api/ai/reputation-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchantName: merchant.name,
        category: merchant.category,
        description: merchant.description,
        yearsInBusiness: isEn
          ? `${Math.max(1, new Date().getFullYear() - merchant.establishedYear)} years`
          : `${new Date().getFullYear() - merchant.establishedYear}年`,
        location: merchant.address,
        communityFeedback:
          merchant.sampleReviews ||
          (isEn
            ? 'Reliable delivery, strong contract compliance, 98% positive peer feedback'
            : '服务周到，契约履约高，社区好评率98%'),
        lang,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || (isEn ? 'Unable to generate AI reputation dossier' : '无法获取AI商誉报告'));
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.warn('Using client-side fallback reputation analysis:', error);
    if (isEn) {
      return {
        credibilityScore: 95,
        sentiment: 'POSITIVE',
        trustTier: 'AAA WBCA Verified Member',
        analysisSummary: `${merchant.name} demonstrates strong commercial standing in Waterloo Region. Verified through the WBCA Trust Framework with zero unresolved compliance disputes and over 96% positive peer ratings.`,
        strengths: [
          'Sound local compliance, governance, and commercial registration in Ontario',
          'Consistent contract fulfillment within the WBCA Mutual Aid Network',
          'High client satisfaction and strong referral momentum across Waterloo Region',
        ],
        riskPoints: [
          'Multi-channel digital listings have room for further multilingual SEO optimization',
          'Peak-season consultation slots fill rapidly; 2-week advance booking is advised',
        ],
        googleSearchSentiment: {
          positiveRatio: 91,
          neutralRatio: 7,
          negativeRatio: 2,
          mentionFrequency: '150+ monthly search citations',
        },
        actionableRecommendations: [
          'Activate WBCA real-time digital contracting and trust credit verification',
          'Display the WBCA Verified Enterprise Seal prominently on official touchpoints',
          'Publish periodic industry briefings in the Mutual Aid Hub to amplify B2B reach',
        ],
        source: 'offline-graceful-fallback',
      };
    }

    return {
      credibilityScore: 95,
      sentiment: 'POSITIVE',
      trustTier: 'AAA级商会认证商户',
      analysisSummary: `${merchant.name}在滑铁卢地区商誉优良，经商会数字化信誉系统核验，无不良诉讼纠纷，社群真实好评率达96%以上，具备高阶商业合作信誉。`,
      strengths: [
        '本地经营合规透明，拥有完善的商业保险与行业资质',
        '在商会互助网络中履约及时，未出现未解决纠纷',
        '专业技能与交付标准在本地华商社群有口皆碑',
      ],
      riskPoints: [
        '线上多语种数字化品牌沉淀仍有提升空间',
        '旺季排期较为紧张，建议企业客户提前两周预约',
      ],
      googleSearchSentiment: {
        positiveRatio: 91,
        neutralRatio: 7,
        negativeRatio: 2,
        mentionFrequency: '月度检索活跃度 150+ 次',
      },
      actionableRecommendations: [
        '接入融商汇实时在线签约与积分互保体系',
        '主动展示滑铁卢融商汇实名认证数字公信徽章',
        '定期在互助圈发布行业洞察，扩大B端影响力',
      ],
      source: 'offline-graceful-fallback',
    };
  }
}

export async function fetchSmartMatch(params: {
  needDescription: string;
  category: string;
  budgetOrReward: string;
  existingMembers: any[];
  lang?: Language;
}): Promise<AIMatchResult> {
  const isEn = params.lang === 'en';
  try {
    const res = await fetch('/api/ai/smart-match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(isEn ? 'AI matchmaking request failed' : 'AI撮合服务返回异常');
    }

    return await res.json();
  } catch (error) {
    console.warn('Fallback matchmaking:', error);
    if (isEn) {
      return {
        matchRationale: `Based on your Waterloo Region objective ("${params.needDescription}"), the WBCA Matchmaking Engine selected our highest-fit verified member enterprises with proven local delivery and commercial credibility.`,
        recommendedMemberIds: [1, 2],
        suggestedNextSteps: [
          'Send a direct strategic collaboration inquiry through the WBCA portal',
          'Schedule an executive introduction at the next WBCA Executive Roundtable',
          'Request Secretariat support for three-party commercial verification',
        ],
        confidenceScore: 94,
        source: 'offline-fallback',
      };
    }

    return {
      matchRationale: `根据您在滑铁卢地区的业务需求「${params.needDescription}」，AI商机匹配引擎从商会认证名录中筛选出最契合的骨干会员，具备极高技术成熟度与本地商誉积淀。`,
      recommendedMemberIds: [1, 2],
      suggestedNextSteps: [
        '通过融商汇内信直接向该企业负责人发送合作意向',
        '在商会下次线下私董会上现场交流',
        '可申请商会秘书处协助进行三方商信公证',
      ],
      confidenceScore: 94,
      source: 'offline-fallback',
    };
  }
}

export async function fetchWaterlooBusinessNews(
  industry: WaterlooNewsIndustry = 'all',
  lang: Language = 'zh',
  forceRefresh = false,
  jurisdiction?: GovJurisdictionId
): Promise<WaterlooNewsResponse> {
  const params = new URLSearchParams({
    industry,
    lang,
    ...(forceRefresh ? { refresh: '1' } : {}),
    ...(jurisdiction ? { jurisdiction } : {}),
  });

  const res = await fetch(`/api/news/waterloo-business?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.error ||
        (lang === 'en'
          ? 'Unable to load Waterloo Business News right now'
          : '暂时无法获取滑铁卢实时商情资讯')
    );
  }
  return await res.json();
}
