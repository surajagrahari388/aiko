"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface PreloaderWrapperProps {
  children: React.ReactNode;
}

export function PreloaderWrapper({ children }: PreloaderWrapperProps) {
  const pathname = usePathname();
  const isEmbed = pathname.startsWith("/embed");
  const [isLoading, setIsLoading] = useState(!isEmbed);

  useEffect(() => {
    if (isEmbed) return;
    // Hide preloader after 1 second (adjust as needed)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isEmbed]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="loading-container relative flex items-center justify-center">
          {/* Loading spinner with favicon in center */}
          <div className="relative">
            {/* Enhanced spinning ring */}
            <div className="loading-ring w-32 h-32 rounded-full border border-transparent animate-spin-smooth">
              <style jsx>{`
                .loading-ring {
                  border-color: transparent #A6171B transparent #A6171B;
                  animation: rotate-loading 1.5s linear 0s infinite normal;
                  transform-origin: 50% 50%;
                  transition: all 0.5s ease-in-out;
                }
                
                @keyframes rotate-loading {
                  0% {
                    transform: rotate(0deg);
                  }
                  100% {
                    transform: rotate(360deg);
                  }
                }
              `}</style>
            </div>
            
            {/* Favicon/Logo in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center">
                <Image 
                  src="/favicon.ico" 
                  alt="Logo" 
                  width={64}
                  height={64}
                  className="transition-all duration-500 ease-in-out"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}