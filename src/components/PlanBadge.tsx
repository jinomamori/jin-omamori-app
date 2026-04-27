import { getPlanBadgeStyle, getPlanDisplayName } from '@/lib/utils';

interface PlanBadgeProps {
  plan: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export default function PlanBadge({ plan, size = 'md', showIcon = true, className = '' }: PlanBadgeProps) {
  const style = getPlanBadgeStyle(plan);
  const displayName = getPlanDisplayName(plan);

  const sizeClass = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }[size];

  const icon = plan === 'vip' ? '♦' : plan === 'gold' ? '★' : '○';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold border ${style.bg} ${style.text} ${style.border} ${sizeClass} ${className}`}
    >
      {showIcon && <span>{icon}</span>}
      {displayName}
    </span>
  );
}
