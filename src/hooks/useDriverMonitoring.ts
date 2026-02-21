import { useState, useCallback, useRef, useEffect } from 'react';
import { calculateEAR, calculateMAR } from '@/lib/ear-mar';
import type { DriverState, DriverMetrics } from '@/lib/types';

const EAR_THRESHOLD = 0.2;
const MAR_THRESHOLD = 0.5;
const WARNING_DURATION = 3000; // 3s for WARNING
const EMERGENCY_DURATION = 10000; // 10s for EMERGENCY escalation

export function useDriverMonitoring() {
  const [state, setState] = useState<DriverState>('SAFE');
  const [metrics, setMetrics] = useState<DriverMetrics>({
    ear: 0.3,
    mar: 0.1,
    faceDetected: false,
    fatigueScore: 0,
    eyeClosureProbability: 0,
  });

  const earBelowStartRef = useRef<number | null>(null);
  const warningStartRef = useRef<number | null>(null);
  const stateRef = useRef<DriverState>('SAFE');

  const resetState = useCallback(() => {
    setState('SAFE');
    stateRef.current = 'SAFE';
    earBelowStartRef.current = null;
    warningStartRef.current = null;
    setMetrics(prev => ({ ...prev, fatigueScore: 0, eyeClosureProbability: 0 }));
  }, []);

  const processLandmarks = useCallback((landmarks: { x: number; y: number; z: number }[] | null) => {
    const now = Date.now();

    if (!landmarks || landmarks.length === 0) {
      setMetrics(prev => ({ ...prev, faceDetected: false }));
      if (stateRef.current !== 'EMERGENCY' && stateRef.current !== 'WARNING') {
        setState('CAUTION');
        stateRef.current = 'CAUTION';
      }
      return;
    }

    const ear = calculateEAR(landmarks);
    const mar = calculateMAR(landmarks);
    const eyeClosureProbability = Math.min(1, Math.max(0, (EAR_THRESHOLD - ear) / EAR_THRESHOLD));

    // Calculate fatigue score based on how long eyes have been closing
    let fatigueScore = metrics.fatigueScore;

    if (ear < EAR_THRESHOLD) {
      if (!earBelowStartRef.current) {
        earBelowStartRef.current = now;
      }
      const elapsed = now - earBelowStartRef.current;
      fatigueScore = Math.min(100, (elapsed / WARNING_DURATION) * 60);

      if (elapsed >= WARNING_DURATION && stateRef.current !== 'EMERGENCY') {
        setState('WARNING');
        stateRef.current = 'WARNING';
        if (!warningStartRef.current) {
          warningStartRef.current = now;
        }
      }
    } else {
      earBelowStartRef.current = null;
      if (stateRef.current === 'SAFE' || stateRef.current === 'YAWN' || stateRef.current === 'CAUTION') {
        fatigueScore = Math.max(0, fatigueScore - 2);
      }
    }

    // Check for yawn
    if (mar > MAR_THRESHOLD && stateRef.current === 'SAFE') {
      setState('YAWN');
      stateRef.current = 'YAWN';
      fatigueScore = Math.min(100, fatigueScore + 5);
    } else if (mar <= MAR_THRESHOLD && stateRef.current === 'YAWN') {
      setState('SAFE');
      stateRef.current = 'SAFE';
    }

    // Emergency escalation
    if (stateRef.current === 'WARNING' && warningStartRef.current) {
      const warningElapsed = now - warningStartRef.current;
      fatigueScore = Math.min(100, 60 + (warningElapsed / EMERGENCY_DURATION) * 40);
      if (warningElapsed >= EMERGENCY_DURATION) {
        setState('EMERGENCY');
        stateRef.current = 'EMERGENCY';
        fatigueScore = 100;
        warningStartRef.current = null;
      }
    }

    // If eyes open and was in safe-adjacent state, go back to safe
    if (ear >= EAR_THRESHOLD && mar <= MAR_THRESHOLD && stateRef.current === 'CAUTION') {
      setState('SAFE');
      stateRef.current = 'SAFE';
    }

    setMetrics({
      ear: Math.round(ear * 1000) / 1000,
      mar: Math.round(mar * 1000) / 1000,
      faceDetected: true,
      fatigueScore: Math.round(fatigueScore),
      eyeClosureProbability: Math.round(eyeClosureProbability * 100),
    });
  }, [metrics.fatigueScore]);

  return { state, metrics, processLandmarks, resetState };
}
