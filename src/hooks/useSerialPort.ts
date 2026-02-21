import { useState, useCallback, useRef } from 'react';

export function useSerialPort() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastReceived, setLastReceived] = useState<string>('');
  const portRef = useRef<any>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter | null>(null);
  const onResetRef = useRef<(() => void) | null>(null);

  const setOnReset = useCallback((cb: () => void) => {
    onResetRef.current = cb;
  }, []);

  const connect = useCallback(async () => {
    if (!('serial' in navigator)) {
      alert('Web Serial API not supported in this browser. Use Chrome or Edge.');
      return;
    }

    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });
      portRef.current = port;

      const writer = port.writable?.getWriter();
      writerRef.current = writer;

      // Start reading
      const reader = port.readable?.getReader();
      readerRef.current = reader;
      setIsConnected(true);

      // Read loop
      const readLoop = async () => {
        try {
          while (true) {
            const { value, done } = await reader!.read();
            if (done) break;
            const text = new TextDecoder().decode(value);
            setLastReceived(text.trim());
            if (text.trim().includes('R')) {
              onResetRef.current?.();
            }
          }
        } catch {
          // Port disconnected
        }
      };
      readLoop();
    } catch (err) {
      console.error('Serial connection failed:', err);
    }
  }, []);

  const send = useCallback(async (data: string) => {
    if (writerRef.current) {
      const encoder = new TextEncoder();
      await writerRef.current.write(encoder.encode(data));
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      readerRef.current?.cancel();
      writerRef.current?.close();
      await portRef.current?.close();
    } catch { /* ignore */ }
    setIsConnected(false);
    portRef.current = null;
  }, []);

  return { isConnected, connect, disconnect, send, lastReceived, setOnReset };
}
