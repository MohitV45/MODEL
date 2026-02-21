import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import StatusHeader from '@/components/StatusHeader';
import CameraFeed from '@/components/CameraFeed';
import HudGauge from '@/components/HudGauge';
import MetricsPanel from '@/components/MetricsPanel';
import EmergencyOverlay from '@/components/EmergencyOverlay';
import SetupModal from '@/components/SetupModal';
import { useDriverMonitoring } from '@/hooks/useDriverMonitoring';
import { useSerialPort } from '@/hooks/useSerialPort';
import { useGeolocation } from '@/hooks/useGeolocation';
import { getDefaultConfig, isConfigured } from '@/lib/types';
import type { DriverConfig } from '@/lib/types';

export default function Index() {
  const [config, setConfig] = useState<DriverConfig>(getDefaultConfig());
  const [showSetup, setShowSetup] = useState(!isConfigured());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { state, metrics, processLandmarks, resetState } = useDriverMonitoring();
  const serial = useSerialPort();
  const { geo } = useGeolocation();
  const prevStateRef = useRef(state);

  // Network awareness
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // Serial commands on state change
  useEffect(() => {
    if (state !== prevStateRef.current) {
      if (state === 'WARNING') serial.send('W');
      if (state === 'EMERGENCY') serial.send('E');
      prevStateRef.current = state;
    }
  }, [state, serial]);

  // Listen for hardware reset
  useEffect(() => {
    serial.setOnReset(resetState);
  }, [serial, resetState]);

  // Audio alarm for warning/emergency
  useEffect(() => {
    if (state === 'WARNING' || state === 'EMERGENCY') {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = state === 'EMERGENCY' ? 880 : 660;
      osc.type = 'square';
      gain.gain.value = 0.1;
      osc.start();
      const timeout = setTimeout(() => { osc.stop(); ctx.close(); }, 500);
      return () => { clearTimeout(timeout); try { osc.stop(); ctx.close(); } catch {} };
    }
  }, [state]);

  const sosPayload = `EMERGENCY: Driver Unresponsive. Vehicle: ${config.vehiclePlate}. Location: ${geo?.address || 'Unknown'}. View on Maps: ${geo?.mapsLink || 'N/A'}`;
  const whatsappLink = `https://wa.me/${config.emergencyContact.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent(sosPayload)}`;

  const gaugeColor = metrics.fatigueScore > 70 ? 'red' as const : metrics.fatigueScore > 40 ? 'amber' as const : 'green' as const;
  const eyeColor = metrics.eyeClosureProbability > 70 ? 'red' as const : metrics.eyeClosureProbability > 40 ? 'amber' as const : 'green' as const;

  return (
    <div className="min-h-screen bg-background bg-grid">
      <SetupModal
        open={showSetup}
        onComplete={(c) => { setConfig(c); setShowSetup(false); }}
      />

      <EmergencyOverlay
        state={state}
        onReset={resetState}
        sosPayload={sosPayload}
        whatsappLink={whatsappLink}
        isOnline={isOnline}
      />

      <div className="max-w-7xl mx-auto p-3 space-y-3">
        <StatusHeader
          config={config}
          state={state}
          isOnline={isOnline}
          serialConnected={serial.isConnected}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Left: Camera */}
          <div className="lg:col-span-2 space-y-3">
            <CameraFeed onLandmarks={processLandmarks} />

            {/* Gauges row */}
            <div className="glass-panel p-4">
              <div className="flex items-center justify-around">
                <HudGauge
                  value={metrics.fatigueScore}
                  max={100}
                  label="Fatigue Score"
                  color={gaugeColor}
                />
                <HudGauge
                  value={metrics.eyeClosureProbability}
                  max={100}
                  label="Eye Closure Prob."
                  color={eyeColor}
                />
              </div>
            </div>
          </div>

          {/* Right: Metrics */}
          <div className="space-y-3">
            <MetricsPanel
              metrics={metrics}
              state={state}
              config={config}
              address={geo?.address || ''}
              onReset={resetState}
            />

            {/* Serial connection */}
            <div className="glass-panel p-4 space-y-3">
              <span className="hud-label">Hardware Interface</span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground">
                  Serial @ 115200 baud
                </span>
                <motion.button
                  onClick={serial.isConnected ? serial.disconnect : serial.connect}
                  className={`px-4 py-1.5 rounded text-xs font-orbitron font-bold tracking-wider border ${
                    serial.isConnected
                      ? 'border-neon text-neon'
                      : 'border-muted-foreground text-muted-foreground'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {serial.isConnected ? 'CONNECTED' : 'CONNECT'}
                </motion.button>
              </div>
              {serial.lastReceived && (
                <div className="font-mono text-[10px] text-muted-foreground">
                  Last RX: <span className="neon-text">{serial.lastReceived}</span>
                </div>
              )}
            </div>

            {/* Settings button */}
            <motion.button
              onClick={() => setShowSetup(true)}
              className="w-full py-2 rounded-lg glass-panel font-orbitron text-xs tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ⚙ RECONFIGURE
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
