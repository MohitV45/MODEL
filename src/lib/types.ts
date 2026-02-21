export type DriverState = 'SAFE' | 'YAWN' | 'CAUTION' | 'WARNING' | 'EMERGENCY';

export interface DriverConfig {
  vehiclePlate: string;
  emergencyContact: string;
  hospitalPhone: string;
}

export interface DriverMetrics {
  ear: number;
  mar: number;
  faceDetected: boolean;
  fatigueScore: number;
  eyeClosureProbability: number;
}

export function getDefaultConfig(): DriverConfig {
  const stored = localStorage.getItem('rescu-eye-config');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  return { vehiclePlate: '', emergencyContact: '', hospitalPhone: '' };
}

export function saveConfig(config: DriverConfig) {
  localStorage.setItem('rescu-eye-config', JSON.stringify(config));
}

export function isConfigured(): boolean {
  const config = getDefaultConfig();
  return !!(config.vehiclePlate && config.emergencyContact);
}
