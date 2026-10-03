import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';

const FilmReelIcon = () => {
  return (
    <div className="relative inline-flex items-center justify-center select-none w-[0.88em] h-[0.88em]">
      {/* 
        Square layout viewBox (140x140) centered at (70,70).
        The reel defines the element's layout footprint so both '4's sit symmetrically.
        The trailing 35mm film strip flows out with overflow-visible to the right behind the second '4'.
      */}
      <svg
        viewBox="0 0 140 140"
        className="w-full h-full overflow-visible drop-shadow-[0_14px_28px_rgba(0,0,0,0.95)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Metallic rim gradient */}
          <linearGradient id="reelOuter" x1="10" y1="10" x2="130" y2="130" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="28%" stopColor="#e4e4e7" />
            <stop offset="65%" stopColor="#71717a" />
            <stop offset="100%" stopColor="#27272a" />
          </linearGradient>

          {/* Main wheel face */}
          <linearGradient id="reelBody" x1="20" y1="15" x2="120" y2="125" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f4f4f5" />
            <stop offset="35%" stopColor="#a1a1aa" />
            <stop offset="70%" stopColor="#52525b" />
            <stop offset="100%" stopColor="#3f3f46" />
          </linearGradient>

          {/* Beveled hole inner rim */}
          <linearGradient id="holeBevel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#18181b" />
            <stop offset="65%" stopColor="#3f3f46" />
            <stop offset="100%" stopColor="#e4e4e7" />
          </linearGradient>

          {/* Center spindle hub */}
          <radialGradient id="hubGrad" cx="70" cy="70" r="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#e4e4e7" />
            <stop offset="70%" stopColor="#52525b" />
            <stop offset="100%" stopColor="#18181b" />
          </radialGradient>

          {/* Film strip acetate ribbon */}
          <linearGradient id="stripGrad" x1="90" y1="95" x2="280" y2="130" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3f3f46" />
            <stop offset="25%" stopColor="#27272a" />
            <stop offset="65%" stopColor="#18181b" />
            <stop offset="100%" stopColor="#09090b" />
          </linearGradient>

          <filter id="shadowFilter" x="-20%" y="-20%" width="150%" height="150%">
            <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#000000" floodOpacity="0.85" />
          </filter>
        </defs>

        {/* --- Trailing Film Strip (sweeps out from bottom of reel, curving under right '4') --- */}
        <g className="film-strip-ribbon">
          {/* Main film strip ribbon */}
          <path
            d="M 96 102 C 124 114, 168 118, 272 106 C 280 119, 275 128, 260 131 C 185 143, 126 137, 78 120 Z"
            fill="url(#stripGrad)"
            stroke="#52525b"
            strokeWidth="0.85"
            filter="url(#shadowFilter)"
          />

          {/* Film frames separator dashes */}
          <path
            d="M 132 111 L 126 129 M 174 115 L 168 133 M 216 116 L 210 133 M 256 113 L 250 129"
            stroke="#71717a"
            strokeWidth="0.9"
            strokeDasharray="1.2 1.5"
            opacity="0.55"
          />

          {/* Upper sprocket perforations */}
          <g fill="#f4f4f5" opacity="0.9">
            <rect x="104" y="104" width="3.4" height="2.2" rx="0.5" transform="rotate(22 104 104)" />
            <rect x="121" y="109" width="3.4" height="2.2" rx="0.5" transform="rotate(16 121 109)" />
            <rect x="139" y="113" width="3.4" height="2.2" rx="0.5" transform="rotate(10 139 113)" />
            <rect x="158" y="115" width="3.4" height="2.2" rx="0.5" transform="rotate(5 158 115)" />
            <rect x="177" y="116" width="3.4" height="2.2" rx="0.5" transform="rotate(1 177 116)" />
            <rect x="196" y="116" width="3.4" height="2.2" rx="0.5" transform="rotate(-3 196 116)" />
            <rect x="216" y="115" width="3.4" height="2.2" rx="0.5" transform="rotate(-6 216 115)" />
            <rect x="236" y="113" width="3.4" height="2.2" rx="0.5" transform="rotate(-9 236 113)" />
            <rect x="255" y="110" width="3.4" height="2.2" rx="0.5" transform="rotate(-12 255 110)" />
          </g>

          {/* Lower sprocket perforations */}
          <g fill="#f4f4f5" opacity="0.9">
            <rect x="89" y="119" width="3.4" height="2.2" rx="0.5" transform="rotate(22 89 119)" />
            <rect x="106" y="124" width="3.4" height="2.2" rx="0.5" transform="rotate(16 106 124)" />
            <rect x="124" y="128" width="3.4" height="2.2" rx="0.5" transform="rotate(10 124 128)" />
            <rect x="143" y="130" width="3.4" height="2.2" rx="0.5" transform="rotate(5 143 130)" />
            <rect x="162" y="131" width="3.4" height="2.2" rx="0.5" transform="rotate(1 162 131)" />
            <rect x="182" y="131" width="3.4" height="2.2" rx="0.5" transform="rotate(-3 182 131)" />
            <rect x="202" y="130" width="3.4" height="2.2" rx="0.5" transform="rotate(-6 202 130)" />
            <rect x="222" y="127" width="3.4" height="2.2" rx="0.5" transform="rotate(-9 222 127)" />
            <rect x="241" y="124" width="3.4" height="2.2" rx="0.5" transform="rotate(-12 241 124)" />
          </g>
        </g>

        {/* --- Continuously Rotating Film Reel Assembly --- */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 70 70"
            to="360 70 70"
            dur="14s"
            repeatCount="indefinite"
          />

          {/* Outer Beveled Rim */}
          <circle cx="70" cy="70" r="64" fill="url(#reelOuter)" filter="url(#shadowFilter)" />
          <circle cx="70" cy="70" r="60" fill="none" stroke="#ffffff" strokeWidth="1.4" opacity="0.75" />

          {/* Main Reel Face Disc */}
          <circle cx="70" cy="70" r="56" fill="url(#reelBody)" />

          {/* Recessed concentric grooves */}
          <circle cx="70" cy="70" r="53" fill="none" stroke="#27272a" strokeWidth="1" opacity="0.6" />
          <circle cx="70" cy="70" r="31" fill="none" stroke="#27272a" strokeWidth="1" opacity="0.45" />

          {/* 6 Circular Projector Cutout Holes */}
          {/* Angle 0 deg */}
          <circle cx="103" cy="70" r="11.5" fill="#070709" stroke="url(#holeBevel)" strokeWidth="2.4" />
          {/* Angle 60 deg */}
          <circle cx="86.5" cy="98.5" r="11.5" fill="#070709" stroke="url(#holeBevel)" strokeWidth="2.4" />
          {/* Angle 120 deg */}
          <circle cx="53.5" cy="98.5" r="11.5" fill="#070709" stroke="url(#holeBevel)" strokeWidth="2.4" />
          {/* Angle 180 deg */}
          <circle cx="37" cy="70" r="11.5" fill="#070709" stroke="url(#holeBevel)" strokeWidth="2.4" />
          {/* Angle 240 deg */}
          <circle cx="53.5" cy="41.5" r="11.5" fill="#070709" stroke="url(#holeBevel)" strokeWidth="2.4" />
          {/* Angle 300 deg */}
          <circle cx="86.5" cy="41.5" r="11.5" fill="#070709" stroke="url(#holeBevel)" strokeWidth="2.4" />

          {/* Central Hub Disc */}
          <circle cx="70" cy="70" r="20" fill="url(#hubGrad)" stroke="#27272a" strokeWidth="1.2" />
          <circle cx="70" cy="70" r="16" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.55" />

          {/* Center spindle hole */}
          <circle cx="70" cy="70" r="6.2" fill="#070709" stroke="#71717a" strokeWidth="1.4" />

          {/* Hub drive notches */}
          <circle cx="70" cy="60.5" r="1.5" fill="#27272a" />
          <circle cx="61.8" cy="74.8" r="1.5" fill="#27272a" />
          <circle cx="78.2" cy="74.8" r="1.5" fill="#27272a" />
        </g>
      </svg>
    </div>
  );
};

const NotFoundScreen = () => {
  return (
    <div className="relative min-h-screen w-full bg-[#070709] text-white flex flex-col justify-between overflow-x-hidden selection:bg-red-500/30 selection:text-white">
      {/* Top Header Navbar - shown on desktop and tablet */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 flex flex-col md:flex-row items-center justify-between w-full min-h-screen md:min-h-[calc(100vh-64px)] md:pt-20 md:pb-12">
        {/* Visual: Cozy Cat Movie Night Scene */}
        {/* On mobile: top banner (h-[42vh] to h-[46vh]) that smoothly fades into the bottom half */}
        {/* On desktop: right side backdrop (w-[60%] h-full) */}
        <div className="relative md:absolute md:right-0 top-0 w-full h-[42vh] xs:h-[45vh] md:h-full md:w-[60%] lg:w-[62%] xl:w-[60%] pointer-events-none select-none z-0 shrink-0">
          <img
            src="https://ik.imagekit.io/dhyh95euj/movie%20posters/Cozy%20Cat%20Movie%20Night.webp"
            alt="Cozy Cat Movie Night"
            className="w-full h-full object-cover object-center brightness-[0.92] contrast-[1.05]"
          />

          {/* Smooth Gradient Blending Overlays */}
          {/* Mobile bottom fade: seamlessly transitions into the dark content area below */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#070709]/40 via-55% to-[#070709] md:hidden" />

          {/* Desktop left horizontal fade */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#070709] via-[#070709]/80 via-25% to-transparent hidden md:block" />

          {/* Desktop top/bottom vignettes */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#070709] via-[#070709]/40 to-transparent hidden md:block" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#070709] via-[#070709]/50 to-transparent hidden md:block" />
        </div>

        {/* Ambient Room Glow Behind Left Content (Desktop) */}
        <div className="absolute left-[-10%] top-1/3 w-[32rem] h-[32rem] bg-red-600/5 rounded-full blur-[140px] pointer-events-none hidden md:block" />
        <div className="absolute left-[15%] bottom-10 w-[24rem] h-[24rem] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none hidden md:block" />

        {/* Content Container */}
        {/* On mobile: centered below the image with clean vertical rhythm matching mobile reference */}
        {/* On desktop: left-aligned in standard container */}
        <div className="relative z-10 max-w-7xl w-full mx-auto px-6 sm:px-10 md:px-14 lg:px-16 flex-1 flex flex-col justify-center items-center md:items-start -mt-8 sm:-mt-10 md:mt-0 pb-10 md:pb-0">
          <div className="max-w-xl flex flex-col items-center md:items-start text-center md:text-left gap-4 xs:gap-5 sm:gap-6 md:gap-7">
            
            {/* 404 Display with Film Reel '0' and trailing film strip */}
            <div className="relative flex items-center justify-center select-none font-black text-[5.2rem] xs:text-[6.4rem] sm:text-[8rem] md:text-[10.5rem] lg:text-[12rem] xl:text-[12.5rem] leading-none tracking-tight">
              {/* First '4' */}
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-zinc-400 drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)]">
                4
              </span>

              {/* Film Reel '0' with film strip - perfectly centered square layout box */}
              <div className="relative z-10 mx-1 sm:mx-2 md:mx-3 flex items-center justify-center">
                <FilmReelIcon />
              </div>

              {/* Second '4' - placed with relative z-20 to overlay above film strip */}
              <span className="relative z-20 text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-zinc-400 drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)]">
                4
              </span>
            </div>

            {/* Typography Heading */}
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.18]">
                Looks like this page <br />
                went <span className="text-zinc-400 font-semibold">off-script</span>.
              </h1>
              
              <p className="text-zinc-400 text-xs sm:text-base md:text-lg max-w-xs sm:max-w-md font-normal leading-relaxed mx-auto md:mx-0">
                The page you're looking for might have been moved, deleted, or never existed in our universe.
              </p>
            </div>

            {/* Red Pill Call To Action Button */}
            <div className="pt-2 sm:pt-3">
              <Link
                to="/"
                className="group inline-flex items-center gap-2.5 px-7 py-3 sm:px-8 sm:py-4 rounded-full text-sm sm:text-base font-semibold text-white bg-[#E50914] hover:bg-[#c80812] active:scale-95 transition-all duration-300 shadow-[0_4px_25px_rgba(229,9,20,0.35)] hover:shadow-[0_6px_35px_rgba(229,9,20,0.55)] hover:-translate-y-0.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:-translate-x-1" />
                <span>Go Back Home</span>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundScreen;
