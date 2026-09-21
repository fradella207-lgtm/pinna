import React from "react";

interface PinnaLogoProps {
  className?: string;
  size?: number;
  withText?: boolean;
  textColor?: string;
}

export const PinnaLogo: React.FC<PinnaLogoProps> = ({
  className = "w-8 h-8",
  size = 32,
  withText = false,
  textColor = "text-slate-900 dark:text-white",
}) => {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <div
        className="relative shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-xs transition-transform"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 512 512"
          width="100%"
          height="100%"
          className="w-full h-full drop-shadow-xs"
        >
          <defs>
            <radialGradient id={`bgGrad-${size}`} cx="50%" cy="42%" r="58%">
              <stop offset="0%" stopColor="#0e2320" />
              <stop offset="100%" stopColor="#071513" />
            </radialGradient>
            <linearGradient id={`sunGrad-${size}`} x1="20%" y1="10%" x2="80%" y2="90%">
              <stop offset="0%" stopColor="#f58529" />
              <stop offset="60%" stopColor="#e67012" />
              <stop offset="100%" stopColor="#c95707" />
            </linearGradient>
            <filter id={`pinShadow-${size}`} x="-15%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000000" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* Squircle Background */}
          <rect width="512" height="512" rx="124" fill={`url(#bgGrad-${size})`} />

          {/* Map Pin Marker */}
          <path
            d="M 256 98
               C 174 98 108 164 108 246
               C 108 308 170 376 244 425
               C 251 430 261 430 268 425
               C 342 376 404 308 404 246
               C 404 164 338 98 256 98 Z"
            fill="#edf3f0"
            filter={`url(#pinShadow-${size})`}
          />

          {/* Dark Pine Mountain Peak / Sector */}
          <path
            d="M 256 156
               L 338 298
               C 314 316 286 324 256 324
               C 226 324 198 316 174 298
               Z"
            fill="#1d3f38"
          />

          {/* Glowing Beacon / Sun */}
          <circle cx="256" cy="236" r="30" fill={`url(#sunGrad-${size})`} />
        </svg>
      </div>

      {withText && (
        <span className={`font-black tracking-tight text-sm sm:text-base font-display ${textColor}`}>
          pinna
        </span>
      )}
    </div>
  );
};
