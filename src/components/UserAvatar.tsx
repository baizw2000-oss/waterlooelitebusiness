import React, { useState } from 'react';

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
  const [hasError, setHasError] = useState(false);
  const str = (avatar || '').trim();

  // Detect if avatar is an image data URL, HTTP URL, or local path
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

  // Emoji or short monogram (up to 4 characters)
  if (str && str.length <= 4 && !str.includes('/') && !str.includes(';') && !str.includes(':')) {
    return (
      <span className={`inline-flex items-center justify-center flex-shrink-0 leading-none select-none ${className}`}>
        {str}
      </span>
    );
  }

  // Fallback initial character if string is long or invalid
  const initial = (name || '商')[0];
  return (
    <div
      className={`${sizeMap[size]} bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center font-bold text-amber-300 flex-shrink-0 select-none ${className}`}
    >
      {initial}
    </div>
  );
};
