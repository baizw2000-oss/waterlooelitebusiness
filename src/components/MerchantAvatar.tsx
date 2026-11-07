import React, { useState } from 'react';
import { Building2, User } from 'lucide-react';
import { Merchant } from '../types';

interface MerchantAvatarProps {
  merchant: {
    name?: string;
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
  const [imageError, setImageError] = useState(false);
  const isIndividual = merchant.entityType === 'individual';
  const logo = (merchant.logo || '').trim();

  // Check if logo is a real image (URL, base64 data URL, or asset path)
  const isImage =
    !imageError &&
    (logo.startsWith('http://') ||
      logo.startsWith('https://') ||
      logo.startsWith('data:image/') ||
      logo.startsWith('/'));

  // Size configurations
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

  // Initial letter for fallback monogram
  const displayInitial = (merchant.name || merchant.repName || '商')[0];

  return (
    <div className={`relative inline-block flex-shrink-0 ${className}`}>
      <div
        className={`relative overflow-hidden flex items-center justify-center font-bold select-none transition-all shadow-md ${
          sizeClasses[size]
        } ${
          isIndividual
            ? 'rounded-full bg-gradient-to-br from-slate-800 via-slate-850 to-blue-950/80 border-2 border-amber-500/30'
            : 'rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 border border-slate-700/80'
        }`}
      >
        {isImage ? (
          <img
            src={logo}
            alt={merchant.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : logo && logo.length <= 4 && !logo.includes('/') ? (
          // Emoji or 1-2 character monogram
          <span className="leading-none drop-shadow-sm">{logo}</span>
        ) : (
          // Elegant Letter & Icon Monogram Fallback
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-850 text-slate-200">
            {isIndividual ? (
              <span className="text-amber-300 font-serif tracking-tight">
                {displayInitial}
              </span>
            ) : (
              <span className="text-white font-sans tracking-tight">
                {displayInitial}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Entity Type Indicator Badge (Company vs Individual) */}
      {showBadge && (
        <span
          className={`absolute rounded-full flex items-center justify-center shadow-md border ${
            badgeSizeClasses[size]
          } ${
            isIndividual
              ? 'bg-blue-600 border-blue-400 text-white'
              : 'bg-amber-500 border-amber-300 text-slate-950'
          }`}
          title={isIndividual ? '个人执业/专家照片' : '企业官方Logo'}
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
