import { motion } from 'framer-motion';
import type { DriverState, DriverMetrics, DriverConfig } from '@/lib/types';

interface MetricsPanelProps {
  metrics: DriverMetrics;
  state: DriverState;
  config: DriverConfig;
  address: string;
  onReset: () => void;
}

export default function MetricsPanel({ metrics, state, config, address, onReset }: MetricsPanelProps) {
  return (
    <div className="space-y-3">
      {/* EAR / MAR readouts */}
      <div className="glass-panel p-4 space-y-3">
        <span className="hud-label">Biometric Readouts</span>
        <div className="grid grid-cols-2 gap-3">
          <MetricBox label="EAR" value={metrics.ear.toFixed(3)} warn={metrics.ear < 0.2} />
          <MetricBox label="MAR" value={metrics.mar.toFixed(3)} warn={metrics.mar > 0.5} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MetricBox label="Face" value={metrics.faceDetected ? 'LOCKED' : 'LOST'} warn={!metrics.faceDetected} />
          <MetricBox label="State" value={state} warn={state === 'WARNING' || state === 'EMERGENCY'} amber={state === 'YAWN' || state === 'CAUTION'} />
        </div>
      </div>

      {/* Location */}
      <div className="glass-panel p-4 space-y-2">
        <span className="hud-label">GPS Location</span>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {address || 'Acquiring...'}
        </p>
      </div>

      {/* Vehicle Info */}
      <div className="glass-panel p-4 space-y-2">
        <span className="hud-label">Vehicle Profile</span>
        <div className="space-y-1">
          <InfoRow label="Plate" value={config.vehiclePlate} />
          <InfoRow label="Emergency" value={config.emergencyContact} />
          {config.hospitalPhone && <InfoRow label="Hospital" value={config.hospitalPhone} />}
        </div>
      </div>

      {/* Reset button */}
      {(state === 'WARNING' || state === 'EMERGENCY') && (
        <motion.button
          onClick={onReset}
          className="w-full py-3 rounded-lg font-orbitron text-sm font-bold tracking-wider border-2 border-neon text-neon"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          ✓ RESET — I'M AWAKE
        </motion.button>
      )}
    </div>
  );
}

function MetricBox({ label, value, warn, amber }: { label: string; value: string; warn?: boolean; amber?: boolean }) {
  const colorClass = warn ? 'crimson-text' : amber ? 'amber-text' : 'neon-text';
  return (
    <div className="glass-panel px-3 py-2 flex items-center justify-between">
      <span className="hud-label">{label}</span>
      <span className={`font-mono text-sm font-semibold ${colorClass}`}>{value}</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-[10px] text-muted-foreground uppercase">{label}</span>
      <span className="font-mono text-xs text-foreground">{value}</span>
    </div>
  );
}
