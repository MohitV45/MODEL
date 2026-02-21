import { motion } from 'framer-motion';

interface HudGaugeProps {
  value: number;
  max: number;
  label: string;
  unit?: string;
  color?: 'green' | 'red' | 'amber';
  size?: number;
}

export default function HudGauge({ value, max, label, unit = '%', color = 'green', size = 160 }: HudGaugeProps) {
  const percentage = Math.min(100, (value / max) * 100);
  const strokeWidth = 6;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const colorMap = {
    green: { stroke: 'hsl(136, 100%, 50%)', glow: '0 0 15px hsl(136, 100%, 50%, 0.5)' },
    red: { stroke: 'hsl(346, 100%, 50%)', glow: '0 0 15px hsl(346, 100%, 50%, 0.5)' },
    amber: { stroke: 'hsl(45, 100%, 50%)', glow: '0 0 15px hsl(45, 100%, 50%, 0.5)' },
  };

  const c = colorMap[color];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(136, 40%, 10%)"
            strokeWidth={strokeWidth}
          />
          {/* Animated progress */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={c.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{ filter: `drop-shadow(${c.glow})` }}
          />
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-mono text-2xl font-bold"
            style={{ color: c.stroke, textShadow: c.glow }}
            key={value}
            initial={{ scale: 1.2, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {value}
          </motion.span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
      <span className="hud-label">{label}</span>
    </div>
  );
}
