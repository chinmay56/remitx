export default function LoadingSkeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-white/10 rounded-lg ${className}`} />
  );
}
