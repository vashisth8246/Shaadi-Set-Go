interface LoadingSpinnerProps {
  label?: string;
  subtitle?: string;
  compact?: boolean;
}

export default function LoadingSpinner({
  label = 'Loading...',
  subtitle,
  compact = false,
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${compact ? 'py-8' : 'min-h-screen'} px-4 text-center`}>
      <div
        className={`animate-spin rounded-full border-4 border-gold/20 border-t-gold ${compact ? 'h-10 w-10' : 'h-14 w-14'}`}
        aria-hidden="true"
      />
      <div className="mt-4 text-lg font-semibold text-gray-700">{label}</div>
      {subtitle && <div className="mt-1 text-sm text-gray-500">{subtitle}</div>}
    </div>
  );
}