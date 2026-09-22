export function BrandLogo({ className = 'h-9' }: { className?: string }) {
  return (
    <img
      src="/omnia-logo.png"
      alt="Omnia"
      className={`${className} w-auto object-contain`}
    />
  );
}
