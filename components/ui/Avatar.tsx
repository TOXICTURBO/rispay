'use client';

interface AvatarProps {
  username: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

// Client-side avatar color generation
function getAvatarColor(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  const saturation = 65 + (Math.abs(hash) % 20);
  const lightness = 45 + (Math.abs(hash) % 15);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function Avatar({ username, size = 'md', className = '' }: AvatarProps) {
  const firstLetter = username.charAt(0).toUpperCase();
  const bgColor = getAvatarColor(username);

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white shadow-inner ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {firstLetter}
    </div>
  );
}
