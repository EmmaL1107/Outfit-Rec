interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function IconSun({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <circle cx="12" cy="12" r="4.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2" />
      <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconCloudSun({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <circle cx="17" cy="8" r="3.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.15" />
      <path d="M17 3v1M17 12v1M21.5 8h-1M13.5 8h-1M20.3 4.7l-.7.7M14.7 10.3l-.7.7M20.3 11.3l-.7-.7M14.7 5.7l-.7-.7" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M7 19h10a4.5 4.5 0 10-3.5-7.5A6 6 0 007 19z" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function IconCloud({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M6 19h12a4.5 4.5 0 10-3.5-7.5A6 6 0 006 19z" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function IconRain({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M6 15h12a4.5 4.5 0 10-3.5-7.5A6 6 0 006 15z" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5" />
      <path d="M8 19l-1 3M12 18l-1 3M16 19l-1 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconSnow({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M6 14h12a4.5 4.5 0 10-3.5-7.5A6 6 0 006 14z" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="1.5" />
      <path d="M8 18v2M8 19l-1.5 1M8 19l1.5 1M12 17v2M12 18l-1.5 1M12 18l1.5 1M16 18v2M16 19l-1.5 1M16 19l1.5 1" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconDroplet({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0L12 2.69z" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.15" />
    </svg>
  );
}

export function IconWind({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M9.59 4.59A2 2 0 1111 8H2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.59 19.41A2 2 0 1014 16H2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.73 7.73A2.5 2.5 0 1119.5 12H2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconLocation({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.15" />
      <circle cx="12" cy="9" r="2.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.3" />
    </svg>
  );
}

export function IconLeaf({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M11 20A7 7 0 015 7.5C8.5 4 17 3 20 6s1 11.5-1.5 15A7 7 0 0111 20z" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.12" />
      <path d="M5 19l6-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconCoat({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M8 3h8M10 3v7M14 3v7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 3L4 7v13h16V7l-4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.1" />
      <path d="M4 10h16" stroke={color} strokeWidth="1.5" />
      <path d="M12 10v10" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
    </svg>
  );
}

export function IconRefresh({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M23 4v6h-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCalendar({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.05" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="15" r="1" fill={color} />
      <circle cx="12" cy="15" r="1" fill={color} />
      <circle cx="16" cy="15" r="1" fill={color} />
    </svg>
  );
}

export function IconShirt({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M8 3h8l4 4-3 2v12H7V9L4 7l4-4z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill={color} fillOpacity="0.1" />
      <path d="M10 3l2 3 2-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconOutfit({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M12 2a2 2 0 012 2v1H10V4a2 2 0 012-2z" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.15" />
      <path d="M8 5L4 9v2h3v9h10v-9h3V9l-4-4" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill={color} fillOpacity="0.08" />
      <path d="M8 5h8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 5l2 3 2-3" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSettings({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function IconChevronLeft({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconChevronRight({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M9 18l6-6-6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconPlus({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconClose({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconCheck({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconBriefcase({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="2" y="7" width="20" height="14" rx="2" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.08" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke={color} strokeWidth="1.5" />
      <path d="M2 13h20" stroke={color} strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

export function IconRunning({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M3 15l2-4h4l2-3h3l2 3h3l2 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 15h18v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3z" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" strokeLinejoin="round" />
      <path d="M7 15v2M11 15v2M15 15v2M19 15v2" stroke={color} strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

export function IconSparkle({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.15" strokeLinejoin="round" />
      <path d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15z" stroke={color} strokeWidth="1" fill={color} fillOpacity="0.1" strokeLinejoin="round" />
    </svg>
  );
}

export function IconEvent({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.05" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconLocate({ size = 24, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.5" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2" />
    </svg>
  );
}
