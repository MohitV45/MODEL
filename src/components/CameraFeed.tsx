import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface CameraFeedProps {
  onLandmarks: (landmarks: { x: number; y: number; z: number }[] | null) => void;
}

declare global {
  interface Window {
    FaceMesh: any;
    Camera: any;
  }
}

export default function CameraFeed({ onLandmarks }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const animFrameRef = useRef<number>();
  const faceMeshRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      onLandmarks(null);
    }
  }, [onLandmarks]);

  useEffect(() => {
    let cancelled = false;

    const loadMediaPipe = async () => {
      // Load MediaPipe scripts
      const loadScript = (src: string) =>
        new Promise<void>((resolve, reject) => {
          if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
          }
          const script = document.createElement('script');
          script.src = src;
          script.crossOrigin = 'anonymous';
          script.onload = () => resolve();
          script.onerror = reject;
          document.head.appendChild(script);
        });

      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');

        if (cancelled) return;

        const faceMesh = new window.FaceMesh({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMesh.onResults((results: any) => {
          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            onLandmarks(results.multiFaceLandmarks[0]);
          } else {
            onLandmarks(null);
          }

          // Draw on canvas
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (ctx && canvas && videoRef.current) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(videoRef.current, 0, 0);

            // Draw face mesh wireframe
            if (results.multiFaceLandmarks?.[0]) {
              const landmarks = results.multiFaceLandmarks[0];
              ctx.strokeStyle = 'hsla(136, 100%, 50%, 0.3)';
              ctx.lineWidth = 0.5;
              for (let i = 0; i < landmarks.length; i++) {
                const x = landmarks[i].x * canvas.width;
                const y = landmarks[i].y * canvas.height;
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, 2 * Math.PI);
                ctx.fillStyle = 'hsla(136, 100%, 50%, 0.6)';
                ctx.fill();
              }
            }
          }
        });

        faceMeshRef.current = faceMesh;
        setLoading(false);
        await startCamera();

        // Process frames
        const processFrame = async () => {
          if (videoRef.current && videoRef.current.readyState >= 2 && faceMeshRef.current) {
            await faceMeshRef.current.send({ image: videoRef.current });
          }
          animFrameRef.current = requestAnimationFrame(processFrame);
        };

        // Wait a bit for camera to stabilize
        setTimeout(() => {
          if (!cancelled) processFrame();
        }, 1000);
      } catch (err) {
        console.error('MediaPipe load failed:', err);
        setLoading(false);
      }
    };

    loadMediaPipe();

    return () => {
      cancelled = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  return (
    <div className="glass-panel p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="hud-label">Live Feed — Face Mesh</span>
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: cameraActive ? 'hsl(136, 100%, 50%)' : 'hsl(346, 100%, 50%)' }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="font-mono text-xs text-muted-foreground">
            {loading ? 'LOADING...' : cameraActive ? 'ACTIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover opacity-0" playsInline muted />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="font-orbitron text-sm neon-text tracking-widest"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              INITIALIZING VISION...
            </motion.div>
          </div>
        )}
        {/* Scan overlay */}
        <div className="absolute inset-0 pointer-events-none border border-primary/20 rounded-md" />
        <div className="absolute bottom-2 left-2 right-2 flex justify-between">
          <span className="font-mono text-[10px] text-primary/50">MEDIAPIPE v0.4</span>
          <span className="font-mono text-[10px] text-primary/50">640×480</span>
        </div>
      </div>
    </div>
  );
}
