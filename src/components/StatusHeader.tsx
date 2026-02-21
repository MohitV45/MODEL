import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import type { DriverState, DriverConfig } from '@/lib/types';

interface StatusHeaderProps {
  config: DriverConfig;
  state: DriverState;
  isOnline: boolean;
  serialConnected: boolean;
}

const stateConfig: Record<DriverState, { label: string; colorClass: string; icon: string }> = {
  SAFE: { label: 'ALL SYSTEMS NOMINAL', colorClass: 'neon-text', icon: '●' },
  YAWN: { label: 'YAWN DETECTED', colorClass: 'amber-text', icon: '◐' },
  CAUTION: { label: 'DRIVER OUT OF FRAME', colorClass: 'amber-text', icon: '◑' },
  WARNING: { label: 'DROWSINESS WARNING', colorClass: 'crimson-text', icon: '▲' },
  EMERGENCY: { label: 'EMERGENCY SOS', colorClass: 'crimson-text', icon: '⚠' },
};

export default function StatusHeader({ config, state, isOnline, serialConnected }: StatusHeaderProps) {
  const s = stateConfig[state];

  return (
    <header className="glass-panel px-5 py-3 flex items-center justify-between">
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
          <Eye className="w-5 h-5 neon-text" />
        </div>
        <div className="flex items-center gap-3">
          <h1 className="font-orbitron text-lg font-bold neon-text tracking-[0.2em]">
            RESCU-EYE
          </h1>
          <span className="font-orbitron text-[10px] font-medium text-primary/40 tracking-widest">PRO</span>
        </div>
      </div>

      {/* Center: Vehicle Plate */}
      <div className="hidden sm:flex items-center gap-3">
        <span className="hud-label">VEHICLE</span>
        <div className="glass-panel px-4 py-1.5 border border-primary/30">
          <span className="font-mono text-sm neon-text tracking-[0.15em]">
            {config.vehiclePlate || '---'}
          </span>
        </div>
      </div>

      {/* Right: System Status */}
      <div className="flex items-center gap-4">
        {/* State indicator */}
        <motion.div
          className="flex items-center gap-2"
          key={state}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.4 }}
        >
          <motion.span
            className={`text-lg ${s.colorClass}`}
            animate={state === 'WARNING' || state === 'EMERGENCY' ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            {s.icon}
          </motion.span>
          <span className={`font-orbitron text-xs font-semibold tracking-wider ${s.colorClass}`}>
            {s.label}
          </span>
        </motion.div>

        {/* Heartbeat & connectivity */}
        <div className="hidden md:flex items-center gap-3 pl-3 border-l border-border">
          <div className="flex items-center gap-1.5">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="font-mono text-[10px] text-muted-foreground">SYS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: isOnline ? 'hsl(136, 100%, 50%)' : 'hsl(346, 100%, 50%)' }}
            />
            <span className="font-mono text-[10px] text-muted-foreground">NET</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: serialConnected ? 'hsl(136, 100%, 50%)' : 'hsl(0, 0%, 30%)' }}
            />
            <span className="font-mono text-[10px] text-muted-foreground">HW</span>
          </div>
        </div>
      </div>
    </header>
  );
}
