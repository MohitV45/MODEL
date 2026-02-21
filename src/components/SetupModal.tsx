import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DriverConfig } from '@/lib/types';
import { saveConfig } from '@/lib/types';

interface SetupModalProps {
  open: boolean;
  onComplete: (config: DriverConfig) => void;
}

export default function SetupModal({ open, onComplete }: SetupModalProps) {
  const [plate, setPlate] = useState('');
  const [emergency, setEmergency] = useState('');
  const [hospital, setHospital] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate || !emergency) return;
    const config: DriverConfig = {
      vehiclePlate: plate.toUpperCase(),
      emergencyContact: emergency,
      hospitalPhone: hospital,
    };
    saveConfig(config);
    onComplete(config);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="glass-panel neon-border border p-8 w-full max-w-md mx-4 space-y-6"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            <div className="text-center space-y-2">
              <h2 className="font-orbitron text-2xl font-bold neon-text tracking-wider">
                RESCU-EYE PRO
              </h2>
              <p className="hud-label">SYSTEM INITIALIZATION</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="hud-label">Vehicle Plate Number</label>
                <input
                  type="text"
                  value={plate}
                  onChange={e => setPlate(e.target.value)}
                  placeholder="TN 01 AB 1234"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="hud-label">Emergency Contact</label>
                <input
                  type="tel"
                  value={emergency}
                  onChange={e => setEmergency(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="hud-label">Hospital Phone (Optional)</label>
                <input
                  type="tel"
                  value={hospital}
                  onChange={e => setHospital(e.target.value)}
                  placeholder="+91 44 2345 6789"
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <motion.button
                type="submit"
                className="w-full py-3 px-6 rounded-lg bg-primary text-primary-foreground font-orbitron text-sm font-bold tracking-widest"
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px hsl(136, 100%, 50%, 0.4)' }}
                whileTap={{ scale: 0.98 }}
              >
                INITIALIZE SYSTEM
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
