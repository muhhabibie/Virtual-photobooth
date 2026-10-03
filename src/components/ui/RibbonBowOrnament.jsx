export default function RibbonBowOrnament({ className = '', count = 5 }) {
  return (
    <div className={`flex items-center justify-center gap-3 sm:gap-5 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg 
          key={i} 
          viewBox="0 0 44 32" 
          className="w-7 h-5 sm:w-9 sm:h-6 fill-none stroke-current opacity-80" 
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Left Bow Loop */}
          <path d="M22 14 C15 6, 4 8, 8 15 C12 21, 19 16, 22 14 Z" />
          {/* Right Bow Loop */}
          <path d="M22 14 C29 6, 40 8, 36 15 C32 21, 25 16, 22 14 Z" />
          {/* Center Knot */}
          <ellipse cx="22" cy="14" rx="2.5" ry="2" fill="currentColor" />
          {/* Left Ribbon Tail */}
          <path d="M20 15 C17 21, 13 26, 9 29" />
          {/* Right Ribbon Tail */}
          <path d="M24 15 C27 21, 31 26, 35 29" />
        </svg>
      ))}
    </div>
  );
}
