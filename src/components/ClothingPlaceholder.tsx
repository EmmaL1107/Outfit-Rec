import type { ClothingCategory, ClothingColor } from '../types';
import { COLOR_HEX_MAP } from '../types';

interface ClothingPlaceholderProps {
  category: ClothingCategory;
  color: ClothingColor;
  size?: number;
}

export function ClothingPlaceholder({ category, color, size = 100 }: ClothingPlaceholderProps) {
  const bgColor = COLOR_HEX_MAP[color];
  const strokeColor = color === '白' || color === '黄' ? '#333' : '#fff';
  const strokeWidth = size / 40;

  const renderClothing = () => {
    switch (category) {
      case '短袖':
        return (
          <g>
            <ellipse cx={size * 0.5} cy={size * 0.35} rx={size * 0.2} ry={size * 0.08} fill={bgColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d={`M${size * 0.3} ${size * 0.3} L${size * 0.25} ${size * 0.15} M${size * 0.7} ${size * 0.3} L${size * 0.75} ${size * 0.15}`} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <path d={`M${size * 0.3} ${size * 0.3} L${size * 0.28} ${size * 0.65}`} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d={`M${size * 0.7} ${size * 0.3} L${size * 0.72} ${size * 0.65}`} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x={size * 0.32} y={size * 0.3} width={size * 0.36} height={size * 0.4} rx={size * 0.05} fill={bgColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1={size * 0.5} y1={size * 0.35} x2={size * 0.5} y2={size * 0.68} stroke={strokeColor} strokeWidth={strokeWidth * 0.6} />
          </g>
        );

      case '长袖':
        return (
          <g>
            <ellipse cx={size * 0.5} cy={size * 0.35} rx={size * 0.2} ry={size * 0.08} fill={bgColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d={`M${size * 0.3} ${size * 0.3} L${size * 0.25} ${size * 0.15} M${size * 0.7} ${size * 0.3} L${size * 0.75} ${size * 0.15}`} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <path d={`M${size * 0.3} ${size * 0.3} L${size * 0.1} ${size * 0.55} L${size * 0.08} ${size * 0.7}`} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <path d={`M${size * 0.7} ${size * 0.3} L${size * 0.9} ${size * 0.55} L${size * 0.92} ${size * 0.7}`} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <rect x={size * 0.32} y={size * 0.3} width={size * 0.36} height={size * 0.4} rx={size * 0.05} fill={bgColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1={size * 0.5} y1={size * 0.35} x2={size * 0.5} y2={size * 0.68} stroke={strokeColor} strokeWidth={strokeWidth * 0.6} />
          </g>
        );

      case '长裤':
        return (
          <g>
            <rect x={size * 0.28} y={size * 0.25} width={size * 0.44} height={size * 0.55} rx={size * 0.05} fill={bgColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1={size * 0.5} y1={size * 0.25} x2={size * 0.5} y2={size * 0.78} stroke={strokeColor} strokeWidth={strokeWidth * 0.6} />
            <rect x={size * 0.28} y={size * 0.75} width={size * 0.16} height={size * 0.08} rx={size * 0.02} fill={bgColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x={size * 0.56} y={size * 0.75} width={size * 0.16} height={size * 0.08} rx={size * 0.02} fill={bgColor} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case '短裤':
        return (
          <g>
            <rect x={size * 0.28} y={size * 0.35} width={size * 0.44} height={size * 0.3} rx={size * 0.05} fill={bgColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1={size * 0.5} y1={size * 0.35} x2={size * 0.5} y2={size * 0.62} stroke={strokeColor} strokeWidth={strokeWidth * 0.6} />
            <rect x={size * 0.28} y={size * 0.62} width={size * 0.16} height={size * 0.08} rx={size * 0.02} fill={bgColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x={size * 0.56} y={size * 0.62} width={size * 0.16} height={size * 0.08} rx={size * 0.02} fill={bgColor} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case '裙子':
        return (
          <g>
            <rect x={size * 0.28} y={size * 0.3} width={size * 0.44} height={size * 0.15} fill={bgColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d={`M${size * 0.28} ${size * 0.45} Q${size * 0.15} ${size * 0.65} ${size * 0.28} ${size * 0.75} Q${size * 0.5} ${size * 0.85} ${size * 0.72} ${size * 0.75} Q${size * 0.85} ${size * 0.65} ${size * 0.72} ${size * 0.45} Z`} fill={bgColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1={size * 0.5} y1={size * 0.3} x2={size * 0.5} y2={size * 0.75} stroke={strokeColor} strokeWidth={strokeWidth * 0.6} />
          </g>
        );

      case '外套':
        return (
          <g>
            <path d={`M${size * 0.25} ${size * 0.2} L${size * 0.3} ${size * 0.25} L${size * 0.3} ${size * 0.15} L${size * 0.7} ${size * 0.15} L${size * 0.7} ${size * 0.25} L${size * 0.75} ${size * 0.2} Z`} fill={bgColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x={size * 0.22} y={size * 0.25} width={size * 0.56} height={size * 0.5} rx={size * 0.05} fill={bgColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d={`M${size * 0.22} ${size * 0.3} L${size * 0.08} ${size * 0.45} L${size * 0.05} ${size * 0.65}`} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <path d={`M${size * 0.78} ${size * 0.3} L${size * 0.92} ${size * 0.45} L${size * 0.95} ${size * 0.65}`} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <line x1={size * 0.5} y1={size * 0.25} x2={size * 0.5} y2={size * 0.72} stroke={strokeColor} strokeWidth={strokeWidth * 0.6} />
            <path d={`M${size * 0.4} ${size * 0.45} L${size * 0.4} ${size * 0.65} M${size * 0.6} ${size * 0.45} L${size * 0.6} ${size * 0.65}`} stroke={strokeColor} strokeWidth={strokeWidth * 0.4} strokeDasharray={`${size * 0.04} ${size * 0.04}`} />
          </g>
        );

      case '卫衣':
        return (
          <g>
            <ellipse cx={size * 0.5} cy={size * 0.3} rx={size * 0.18} ry={size * 0.08} fill={bgColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d={`M${size * 0.32} ${size * 0.28} L${size * 0.25} ${size * 0.12} M${size * 0.68} ${size * 0.28} L${size * 0.75} ${size * 0.12}`} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <path d={`M${size * 0.32} ${size * 0.28} L${size * 0.1} ${size * 0.5} L${size * 0.08} ${size * 0.68}`} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <path d={`M${size * 0.68} ${size * 0.28} L${size * 0.9} ${size * 0.5} L${size * 0.92} ${size * 0.68}`} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <path d={`M${size * 0.3} ${size * 0.28} Q${size * 0.2} ${size * 0.2} ${size * 0.3} ${size * 0.15} Q${size * 0.5} ${size * 0.08} ${size * 0.7} ${size * 0.15} Q${size * 0.8} ${size * 0.2} ${size * 0.7} ${size * 0.28}`} fill={bgColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x={size * 0.32} y={size * 0.28} width={size * 0.36} height={size * 0.42} rx={size * 0.08} fill={bgColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1={size * 0.5} y1={size * 0.32} x2={size * 0.5} y2={size * 0.68} stroke={strokeColor} strokeWidth={strokeWidth * 0.6} />
            <rect x={size * 0.4} y={size * 0.42} width={size * 0.2} height={size * 0.12} rx={size * 0.03} fill={strokeColor} fillOpacity={0.2} stroke={strokeColor} strokeWidth={strokeWidth * 0.5} />
          </g>
        );

      case '衬衫':
        return (
          <g>
            <path d={`M${size * 0.5} ${size * 0.2} L${size * 0.35} ${size * 0.32} L${size * 0.35} ${size * 0.18} L${size * 0.65} ${size * 0.18} L${size * 0.65} ${size * 0.32} Z`} fill={bgColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d={`M${size * 0.35} ${size * 0.3} L${size * 0.25} ${size * 0.12} M${size * 0.65} ${size * 0.3} L${size * 0.75} ${size * 0.12}`} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <path d={`M${size * 0.35} ${size * 0.3} L${size * 0.12} ${size * 0.5} L${size * 0.1} ${size * 0.68}`} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <path d={`M${size * 0.65} ${size * 0.3} L${size * 0.88} ${size * 0.5} L${size * 0.9} ${size * 0.68}`} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <rect x={size * 0.35} y={size * 0.3} width={size * 0.3} height={size * 0.4} rx={size * 0.02} fill={bgColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1={size * 0.5} y1={size * 0.3} x2={size * 0.5} y2={size * 0.68} stroke={strokeColor} strokeWidth={strokeWidth * 0.6} />
            <line x1={size * 0.45} y1={size * 0.45} x2={size * 0.55} y2={size * 0.45} stroke={strokeColor} strokeWidth={strokeWidth * 0.4} />
            <line x1={size * 0.43} y1={size * 0.52} x2={size * 0.57} y2={size * 0.52} stroke={strokeColor} strokeWidth={strokeWidth * 0.4} />
          </g>
        );

      case '毛衣':
        return (
          <g>
            <ellipse cx={size * 0.5} cy={size * 0.3} rx={size * 0.2} ry={size * 0.08} fill={bgColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d={`M${size * 0.3} ${size * 0.28} L${size * 0.25} ${size * 0.15} M${size * 0.7} ${size * 0.28} L${size * 0.75} ${size * 0.15}`} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <path d={`M${size * 0.3} ${size * 0.28} L${size * 0.1} ${size * 0.5} L${size * 0.08} ${size * 0.68}`} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <path d={`M${size * 0.7} ${size * 0.28} L${size * 0.9} ${size * 0.5} L${size * 0.92} ${size * 0.68}`} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <rect x={size * 0.3} y={size * 0.28} width={size * 0.4} height={size * 0.42} rx={size * 0.05} fill={bgColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1={size * 0.5} y1={size * 0.32} x2={size * 0.5} y2={size * 0.68} stroke={strokeColor} strokeWidth={strokeWidth * 0.6} />
            {[0.38, 0.5, 0.62].map((x) => (
              <line key={x} x1={size * x} y1={size * 0.4} x2={size * x} y2={size * 0.65} stroke={strokeColor} strokeWidth={strokeWidth * 0.3} strokeDasharray={`${size * 0.06} ${size * 0.04}`} />
            ))}
          </g>
        );

      case '鞋子':
        return (
          <g>
            <ellipse cx={size * 0.5} cy={size * 0.7} rx={size * 0.35} ry={size * 0.08} fill={bgColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d={`M${size * 0.2} ${size * 0.65} Q${size * 0.15} ${size * 0.5} ${size * 0.2} ${size * 0.4} L${size * 0.75} ${size * 0.35} Q${size * 0.85} ${size * 0.45} ${size * 0.8} ${size * 0.6} L${size * 0.75} ${size * 0.68} Z`} fill={bgColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <ellipse cx={size * 0.7} cy={size * 0.42} rx={size * 0.08} ry={size * 0.05} fill={bgColor} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case '帽子':
        return (
          <g>
            <ellipse cx={size * 0.5} cy={size * 0.65} rx={size * 0.3} ry={size * 0.06} fill={bgColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d={`M${size * 0.25} ${size * 0.62} Q${size * 0.15} ${size * 0.45} ${size * 0.25} ${size * 0.3} Q${size * 0.5} ${size * 0.15} ${size * 0.75} ${size * 0.3} Q${size * 0.85} ${size * 0.45} ${size * 0.75} ${size * 0.62}`} fill={bgColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <ellipse cx={size * 0.5} cy={size * 0.55} rx={size * 0.2} ry={size * 0.05} fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.6} />
          </g>
        );

      case '配饰':
        return (
          <g>
            <circle cx={size * 0.5} cy={size * 0.5} r={size * 0.35} fill="none" stroke={bgColor} strokeWidth={strokeWidth * 2} />
            <circle cx={size * 0.5} cy={size * 0.5} r={size * 0.25} fill="none" stroke={bgColor} strokeWidth={strokeWidth} />
            <circle cx={size * 0.5} cy={size * 0.5} r={size * 0.08} fill={bgColor} />
            {[0, 60, 120, 180, 240, 300].map((angle) => {
              const x1 = size * 0.5 + Math.cos((angle * Math.PI) / 180) * size * 0.18;
              const y1 = size * 0.5 + Math.sin((angle * Math.PI) / 180) * size * 0.18;
              const x2 = size * 0.5 + Math.cos((angle * Math.PI) / 180) * size * 0.28;
              const y2 = size * 0.5 + Math.sin((angle * Math.PI) / 180) * size * 0.28;
              return (
                <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke={bgColor} strokeWidth={strokeWidth} />
              );
            })}
          </g>
        );

      default:
        return (
          <rect x={size * 0.1} y={size * 0.1} width={size * 0.8} height={size * 0.8} rx={size * 0.1} fill={bgColor} stroke={strokeColor} strokeWidth={strokeWidth} />
        );
    }
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="clothing-placeholder">
      {renderClothing()}
    </svg>
  );
}
