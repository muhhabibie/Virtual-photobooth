import { useRef, useCallback, useEffect } from 'react';
import { FRAMES } from '../config/frames';

export function useCamera() {
  const streamRef = useRef(null);
  const animRef = useRef(null);
  const facingModeRef = useRef('user');

  const start = useCallback(async (facingMode = 'user') => {
    facingModeRef.current = facingMode;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode, width: { ideal: 720 }, height: { ideal: 960 } },
      audio: false,
    });
    streamRef.current = stream;
    return stream;
  }, []);

  const stopOverlay = useCallback(() => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    stopOverlay();
  }, [stopOverlay]);

  const toggle = useCallback(async () => {
    const next = facingModeRef.current === 'user' ? 'environment' : 'user';
    return await start(next);
  }, [start]);

  const startOverlay = useCallback((canvasEl, containerEl, currentFrame) => {
    stopOverlay();
    if (!canvasEl || !containerEl || !currentFrame) return;
    canvasEl.width = containerEl.clientWidth;
    canvasEl.height = containerEl.clientHeight;
    const ctx = canvasEl.getContext('2d');
    const loop = () => {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      if (typeof currentFrame.draw === 'function') {
        currentFrame.draw(ctx, canvasEl.width, canvasEl.height);
      }
      animRef.current = requestAnimationFrame(loop);
    };
    loop();
  }, [stopOverlay]);

  useEffect(() => () => stop(), [stop]);

  return { start, stop, toggle, startOverlay, stopOverlay, streamRef };
}
