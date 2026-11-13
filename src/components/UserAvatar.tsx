import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface UserAvatarProps {
  avatar?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  name,
  size = 'md',
  className = '',
}) => {
  const { isEn } = useLanguage();
  const [hasError, setHasError] = useState(false);
  const str = (avatar || '').trim();

  const isImage =
    !hasError &&
    (str.startsWith('data:image/') ||
      str.startsWith('http://') ||
      str.startsWith('https://') ||
      str.startsWith('/'));

  const sizeMap = {
    xs: 'w-5 h-5 text-xs',
    sm: 'w-6 h-6 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-20 h-20 sm:w-24 sm:h-24 text-4xl sm:text-5xl',
  };

  if (isImage) {
    return (
      <img
        src={str}
        alt={name || 'Avatar'}
        onError={() => setHasError(true)}
        className={`${sizeMap[size]} object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  if (str && str.length <= 4 && !str.includes('/') && !str.includes(';') && !str.includes(':')) {
    return (
      <span className={`inline-flex items-center justify-center flex-shrink-0 leading-none select-none ${className}`}>
        {str}
      </span>
    );
  }

  const initial = (name || (isEn ? 'W' : '商'))[0];
  return (
    <div
      className={`${sizeMap[size]} bg-[#0F172A] border border-[#C5A059]/45 rounded-full flex items-center justify-center font-bold text-[#DFBA73] font-editorial flex-shrink-0 select-none ${className}`}
    >
      {initial}
    </div>
  );
};
