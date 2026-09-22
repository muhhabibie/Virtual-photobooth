export default function MonochromeFloralOrnament({ className = '', style = {}, variant = 'corner-tr' }) {
  // Variant transform styles
  let variantClass = '';
  if (variant === 'corner-tr') variantClass = 'transform rotate-12';
  if (variant === 'corner-tl') variantClass = 'transform -rotate-12 scale-x-[-1]';
  if (variant === 'corner-br') variantClass = 'transform rotate-190 scale-y-[-1]';
  if (variant === 'corner-bl') variantClass = 'transform -rotate-135 scale-x-[-1]';
  if (variant === 'header') variantClass = 'transform rotate-0';

  return (
    <svg 
      viewBox="0 0 220 220" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={`${variantClass} ${className}`.trim()} 
      style={style}
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* Main Rose Center & Spiraling Petals */}
        <path d="M165 55 C160 45, 148 42, 142 48 C136 54, 140 65, 148 70 C157 75, 170 72, 175 60 C180 48, 168 32, 150 30 C132 28, 118 42, 120 60 C122 78, 140 94, 162 94 C184 94, 202 76, 200 52 C198 28, 174 10, 148 12 C122 14, 102 38, 105 66 C108 94, 134 116, 165 116" strokeWidth="1.4" opacity="0.85" />
        
        {/* Outer Rose Layers */}
        <path d="M135 60 C118 54, 102 70, 108 88 C114 105, 136 110, 154 106" strokeWidth="1.2" opacity="0.6" />
        <path d="M172 82 C188 88, 205 76, 202 58 C198 40, 182 28, 164 30" strokeWidth="1.2" opacity="0.6" />
        <path d="M156 108 C142 128, 170 142, 186 126 C198 114, 200 96, 192 85" strokeWidth="1.1" opacity="0.5" />
        <path d="M108 88 C90 100, 96 122, 114 130 C130 138, 152 132, 156 118" strokeWidth="1.1" opacity="0.5" />

        {/* Secondary Rosebud */}
        <path d="M72 142 C65 136, 56 138, 54 146 C52 154, 60 162, 68 162 C76 162, 82 154, 80 145 C78 136, 66 130, 58 132" strokeWidth="1.2" opacity="0.75" />
        <path d="M50 148 C42 156, 48 170, 60 174 C72 178, 85 170, 86 158" strokeWidth="1.1" opacity="0.5" />

        {/* Main Botanical Vine */}
        <path d="M155 118 C132 142, 98 165, 45 185" strokeWidth="1.6" opacity="0.75" />
        <path d="M45 185 C28 194, 15 188, 20 172 C25 156, 42 162, 45 175" strokeWidth="1" opacity="0.5" />

        {/* Large Botanical Leaves */}
        <path d="M120 148 C102 138, 80 144, 70 160 C60 176, 76 192, 92 182 C108 172, 114 154, 120 148 Z" fill="currentColor" fillOpacity="0.06" strokeWidth="1.2" opacity="0.7" />
        <path d="M82 168 C98 158, 104 152, 104 152" strokeWidth="0.9" opacity="0.45" />

        <path d="M142 132 C158 138, 175 126, 180 110 C185 94, 170 82, 154 92 C138 102, 138 120, 142 132 Z" fill="currentColor" fillOpacity="0.06" strokeWidth="1.2" opacity="0.65" />
        <path d="M158 108 C148 116, 145 122, 145 122" strokeWidth="0.9" opacity="0.45" />

        <path d="M78 174 C62 178, 50 192, 56 206 C62 220, 80 216, 90 202 C100 188, 90 176, 78 174 Z" fill="currentColor" fillOpacity="0.06" strokeWidth="1.2" opacity="0.65" />
        <path d="M68 196 C76 188, 80 182, 80 182" strokeWidth="0.9" opacity="0.45" />

        {/* Baby's Breath Floral Buds & Delicate Dots */}
        <path d="M88 120 C76 102, 54 98, 38 108" strokeWidth="1" strokeDasharray="3 3" opacity="0.55" />
        <circle cx="38" cy="108" r="3.5" fill="currentColor" fillOpacity="0.4" strokeWidth="1" opacity="0.85" />
        <circle cx="56" cy="98" r="2.8" fill="currentColor" fillOpacity="0.4" strokeWidth="1" opacity="0.85" />
        <circle cx="72" cy="114" r="2.4" fill="currentColor" fillOpacity="0.4" strokeWidth="1" opacity="0.85" />
        <circle cx="26" cy="124" r="2.8" fill="currentColor" fillOpacity="0.4" strokeWidth="1" opacity="0.85" />
        <path d="M38 108 L26 124" strokeWidth="0.8" opacity="0.4" />

        <path d="M182 45 C194 32, 210 26, 216 14" strokeWidth="1" strokeDasharray="3 3" opacity="0.55" />
        <circle cx="216" cy="14" r="3.5" fill="currentColor" fillOpacity="0.4" strokeWidth="1" opacity="0.85" />
        <circle cx="198" cy="26" r="2.5" fill="currentColor" fillOpacity="0.4" strokeWidth="1" opacity="0.85" />
        <circle cx="186" cy="15" r="2.8" fill="currentColor" fillOpacity="0.4" strokeWidth="1" opacity="0.85" />
        <path d="M198 26 L186 15" strokeWidth="0.8" opacity="0.4" />

        {/* Delicate Botanical Fill Petals */}
        <path d="M110 40 C100 28, 86 32, 80 44 C74 56, 84 68, 96 66 C108 64, 114 48, 110 40 Z" fill="currentColor" fillOpacity="0.05" strokeWidth="1" opacity="0.5" />
      </g>
    </svg>
  );
}