import { useState } from 'react';

interface ShimmerImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ShimmerImage({ src, alt, className = '' }: ShimmerImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative">
      {!loaded && <div className="absolute inset-0 skeleton-shimmer rounded-lg" />}
      <img
        src={src}
        alt={alt}
        className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
