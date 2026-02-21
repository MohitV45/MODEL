import { motion, AnimatePresence } from 'framer-motion';
import type { DriverState } from '@/lib/types';

interface EmergencyOverlayProps {
  state: DriverState;
  onReset: () => void;
  sosPayload: string;
  whatsappLink: string;
  isOnline: boolean;
}

export default function EmergencyOverlay({ state, onReset, sosPayload, whatsappLink, isOnline }: EmergencyOverlayProps) {
  if (state !== 'EMERGENCY') return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Pulsing red background */}
        <motion.div
          className="absolute inset-0"
          style={{ backgroundColor: 'hsl(346, 100%, 50%)' }}
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Content */}
        <div className="relative z-10 mx-4 max-w-lg w-full glass-panel p-8 crimson-border border-2 text-center space-y-6">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <h1 className="font-orbitron text-4xl font-black crimson-text tracking-wider">
              ⚠ CRITICAL SOS ⚠
            </h1>
          </motion.div>

          <p className="font-rajdhani text-lg text-destructive-foreground opacity-90">
            DRIVER UNRESPONSIVE — Emergency protocols activated
          </p>

          {/* SOS Payload */}
          <div className="glass-panel p-4 text-left space-y-2 border border-destructive/30">
            <span className="hud-label crimson-text">SOS PAYLOAD</span>
            <p className="font-mono text-sm text-destructive-foreground/80 break-all leading-relaxed">
              {sosPayload}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {isOnline ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-6 rounded-lg font-orbitron text-sm font-bold tracking-wider text-primary-foreground"
                style={{ backgroundColor: '#25D366' }}
              >
                📱 SEND VIA WHATSAPP
              </a>
            ) : (
              <button
                onClick={() => navigator.clipboard.writeText(sosPayload)}
                className="w-full py-3 px-6 rounded-lg font-orbitron text-sm font-bold tracking-wider bg-amber text-primary-foreground"
              >
                📋 COPY SOS — MANUAL SMS TRIGGER
              </button>
            )}

            <motion.button
              onClick={onReset}
              className="w-full py-3 px-6 rounded-lg font-orbitron text-sm font-bold tracking-wider border-2 border-neon text-neon"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ✓ DRIVER RESPONSIVE — RESET
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
