import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { LanguageSwitcher } from './language-switcher';
import { Zap } from 'lucide-react';

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t('header.title')}</h1>
              <p className="text-xs text-gray-500">{t('header.subtitle')}</p>
            </div>
          </Link>
          
          <nav className="flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">
              {t('navigation.home')}
            </Link>
            <LanguageSwitcher />
          </nav>
        </div>
      </div>
    </header>
  );
}