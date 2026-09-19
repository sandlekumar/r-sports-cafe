export function CoffeeCupSketch({ className }) {
  return (
    <svg viewBox="0 0 190 165" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M55 90 Q54 140 62 148 Q95 158 128 148 Q136 140 135 90 Z"/>
      <ellipse cx="95" cy="90" rx="40" ry="6"/>
      <path d="M133 100 Q158 100 158 118 Q158 136 133 134"/>
      <path d="M78 78 Q74 62 82 50" opacity="0.7"/>
      <path d="M96 78 Q92 58 102 44" opacity="0.7"/>
      <path d="M114 78 Q110 64 118 52" opacity="0.7"/>
    </svg>
  );
}

export function FootballSketch({ className }) {
  return (
    <svg viewBox="0 0 200 175" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="100" cy="95" r="46"/>
      <path d="M100 55 L120 78 L112 105 L88 105 L80 78 Z" strokeWidth="1.2"/>
      <path d="M100 55 L100 42 M120 78 L137 70 M112 105 L122 122 M88 105 L78 122 M80 78 L63 70" strokeWidth="1.2"/>
      <path d="M40 118 Q20 128 3 122" opacity="0.6"/>
    </svg>
  );
}

export function StitchedDivider({ className }) {
  return (
    <div className={`w-full flex items-center justify-center py-6 text-darkText/15 ${className || ''}`} aria-hidden="true">
      <svg viewBox="0 0 300 20" className="w-40 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M0 10 L120 10" strokeDasharray="2 6"/>
        <path d="M180 10 L300 10" strokeDasharray="2 6"/>
        <circle cx="150" cy="10" r="3" fill="currentColor"/>
      </svg>
    </div>
  );
}

export function TableSketch({ className }) {
  return (
    <svg viewBox="0 0 240 200" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {/* Table Surface lines (faint) */}
      <path d="M20 160 L220 100" opacity="0.2" strokeWidth="1"/>
      <path d="M40 180 L240 120" opacity="0.2" strokeWidth="1"/>
      
      {/* Isometric Plate */}
      <ellipse cx="100" cy="140" rx="65" ry="25" />
      <ellipse cx="100" cy="140" rx="45" ry="15" opacity="0.6"/>
      {/* Plate thickness */}
      <path d="M35 140 A 65 25 0 0 0 165 140" transform="translate(0, 4)" opacity="0.5"/>
      
      {/* Folded Napkin on Plate */}
      <path d="M 70 145 L 120 125 L 140 140 L 90 160 Z" opacity="0.8"/>
      <path d="M 70 145 L 75 140 L 125 120" opacity="0.5"/>
      
      {/* Wine Glass */}
      <ellipse cx="180" cy="90" rx="18" ry="6" opacity="0.8"/>
      <path d="M180 90 L180 45" />
      <path d="M160 20 C 160 55, 200 55, 200 20" />
      <ellipse cx="180" cy="20" rx="20" ry="6" />
      <ellipse cx="180" cy="35" rx="17" ry="5" opacity="0.4" strokeDasharray="2 2"/>
      
      {/* Abstract Cutlery */}
      <path d="M40 155 L15 100" opacity="0.7"/>
      <path d="M140 170 L190 120" opacity="0.7"/>
    </svg>
  );
}
