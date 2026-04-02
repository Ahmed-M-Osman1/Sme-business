'use client';

import {createContext, useContext, useState, useCallback, useEffect} from 'react';
import en from './en.json';
import ar from './ar.json';

type Locale = 'en' | 'ar';
type Translations = typeof en;

const translations: Record<Locale, Translations> = {en, ar};

interface I18nContextValue {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  t: Translations;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  dir: 'ltr',
  t: en,
  setLocale: () => {},
  toggleLocale: () => {},
});

export function I18nProvider({children}: {children: React.ReactNode}) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedLocale = localStorage.getItem('shory-locale') as Locale | null;
    const nextLocale = savedLocale === 'ar' ? 'ar' : 'en';
    setLocaleState(nextLocale);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shory-locale', newLocale);
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'en' ? 'ar' : 'en');
  }, [locale, setLocale]);

  return (
    <I18nContext.Provider
      value={{
        locale,
        dir: locale === 'ar' ? 'rtl' : 'ltr',
        t: translations[locale],
        setLocale,
        toggleLocale,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
