import React, { useState } from 'react';
import { Building2, User } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface MerchantAvatarProps {
  merchant: {
    name?: string;
    nameEn?: string;
    logo?: string;
    entityType?: 'company' | 'individual';
    category?: string;
    repName?: string;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
}

export const MerchantAvatar: React.FC<MerchantAvatarProps> = ({
  merchant,
  size = 'md',
  className = '',
  showBadge = false,
}) => {
  const { isEn, t } = useLanguage();
  const [imageError, setImageError] = useState(false);
  const isIndividual = merchant.entityType === 'individual';
  const logo = (merchant.logo || '').trim();

  const isImage =
    !imageError &&
    (logo.startsWith('http://') ||
      logo.startsWith('https://') ||
      logo.startsWith('data:image/') ||
      logo.startsWith('/'));

  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 sm:w-24 sm:h-24 text-2xl',
  };

  const badgeSizeClasses = {
    sm: 'w-3.5 h-3.5 text-[8px] -bottom-0.5 -right-0.5',
    md: 'w-4 h-4 text-[9px] -bottom-0.5 -right-0.5',
    lg: 'w-5 h-5 text-[10px] bottom-0 right-0',
    xl: 'w-6 h-6 text-xs bottom-0.5 right-0.5',
  };

  const label = isEn
    ? (merchant.nameEn || merchant.name || merchant.repName || 'W')
    : (merchant.name || merchant.repName || '商');
  const displayInitial = label[0] || (isEn ? 'W' : '商');

  return (
    <div className={`relative inline-block flex-shrink-0 ${className}`}>
      <div
        className={`relative overflow-hidden flex items-center justify-center font-bold select-none transition-all shadow-sm ${
          sizeClasses[size]
        } ${
          isIndividual
            ? 'rounded-full bg-gradient-to-br from-[#0F172A] to-[#1E293B] border-2 border-[#C5A059]/50'
            : 'rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-[#C5A059]/35'
        }`}
      >
        {isImage ? (
          <img
            src={logo}
            alt={label}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover bg-white"
          />
        ) : logo && logo.length <= 4 && !logo.includes('/') ? (
          <span className="leading-none drop-shadow-sm">{logo}</span>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#0F172A] text-[#DFBA73]">
            {isIndividual ? (
              <span className="text-[#DFBA73] font-editorial tracking-tight">
                {displayInitial}
              </span>
            ) : (
              <span className="text-white font-editorial tracking-tight">
                {displayInitial}
              </span>
            )}
          </div>
        )}
      </div>

      {showBadge && (
        <span
          className={`absolute rounded-full flex items-center justify-center shadow-sm border ${
            badgeSizeClasses[size]
          } ${
            isIndividual
              ? 'bg-[#0F172A] border-[#C5A059] text-[#DFBA73]'
              : 'bg-[#C5A059] border-white text-[#0F172A]'
          }`}
          title={
            isIndividual
              ? t('个人执业/专家照片', 'Independent Practitioner Portrait')
              : t('企业官方Logo', 'Official Corporate Logo')
          }
        >
          {isIndividual ? (
            <User className="w-2.5 h-2.5" />
          ) : (
            <Building2 className="w-2.5 h-2.5" />
          )}
        </span>
      )}
    </div>
  );
};
