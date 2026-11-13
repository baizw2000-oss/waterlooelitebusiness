import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Language = 'zh' | 'en';

interface LanguageContextValue {
  lang: Language;
  isEn: boolean;
  setLanguage: (nextLang: Language) => void;
  toggleLanguage: () => void;
  t: (zh: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function detectLanguageFromLocation(): Language {
  if (typeof window === 'undefined') return 'zh';
  const pathname = window.location.pathname || '/';
  const params = new URLSearchParams(window.location.search);
  const queryLang = params.get('lang');

  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return 'en';
  }
  if (queryLang === 'en') {
    return 'en';
  }
  return 'zh';
}

function buildLocalizedUrl(nextLang: Language): string {
  const { pathname, search, hash } = window.location;
  const params = new URLSearchParams(search);
  if (params.has('lang')) {
    params.delete('lang');
  }
  const cleanSearch = params.toString();
  const querySuffix = cleanSearch ? `?${cleanSearch}` : '';

  let nextPath = pathname || '/';
  if (nextLang === 'en') {
    if (nextPath !== '/en' && !nextPath.startsWith('/en/')) {
      nextPath = nextPath === '/' ? '/en' : `/en${nextPath.startsWith('/') ? '' : '/'}${nextPath}`;
    }
  } else {
    if (nextPath === '/en' || nextPath === '/en/') {
      nextPath = '/';
    } else if (nextPath.startsWith('/en/')) {
      nextPath = nextPath.slice(3) || '/';
    }
  }

  return `${nextPath}${querySuffix}${hash || ''}`;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => detectLanguageFromLocation());

  const applyDocumentMeta = useCallback((currentLang: Language) => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = currentLang === 'en' ? 'en' : 'zh-CN';
    document.title =
      currentLang === 'en'
        ? 'WBCA · Waterloo Business Convergence Alliance | Verified Corporate Directory & AI Hub'
        : '滑铁卢融商汇 · WBCA | 滑铁卢精英企业认证名录与AI协同生态';
    const descContent =
      currentLang === 'en'
        ? 'Waterloo Business Convergence Alliance (WBCA): Verified corporate directory, executive networking, event registration, trust credit rewards, and Gemini AI matchmaking across the Waterloo Region.'
        : '滑铁卢融商汇会员高效互助平台：汇聚本地商界精英名录、产融协同对接、活动报名签到、商户信用积分榜与AI智能撮合引擎。';
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute('content', descContent);
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', document.title);
    }
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', descContent);
    }
  }, []);

  useEffect(() => {
    applyDocumentMeta(lang);
  }, [lang, applyDocumentMeta]);

  useEffect(() => {
    const handlePopState = () => {
      const detected = detectLanguageFromLocation();
      setLangState(detected);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setLanguage = useCallback((nextLang: Language) => {
    setLangState(nextLang);
    if (typeof window !== 'undefined') {
      const targetUrl = buildLocalizedUrl(nextLang);
      const currentFullUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (targetUrl !== currentFullUrl) {
        window.history.pushState({ lang: nextLang }, '', targetUrl);
      }
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(lang === 'en' ? 'zh' : 'en');
  }, [lang, setLanguage]);

  const t = useCallback(
    (zh: string, en: string) => (lang === 'en' ? en : zh),
    [lang]
  );

  return (
    <LanguageContext.Provider
      value={{
        lang,
        isEn: lang === 'en',
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
