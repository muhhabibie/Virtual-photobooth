import { useEffect, useRef, useState, useCallback } from 'react';

const VERSION = '0.4.1633559619';

/**
 * Pre-warm MediaPipe FaceMesh script in the background
 * Call this when entering StepFrames or on app start so the first camera load is instant!
 */
export function preloadFaceMesh() {
  if (typeof window === 'undefined') return;
  if (!window.FaceMesh && !document.querySelector(`script[src*="face_mesh@${VERSION}"]`)) {
    const script = document.createElement('script');
    script.src = `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@${VERSION}/face_mesh.js`;
    script.crossOrigin = 'anonymous';
    script.async = true;
    document.head.appendChild(script);
  }
}

/**
 * Custom Hook to track facial landmarks in real-time using MediaPipe FaceMesh
 * Supports multi-person detection (e.g. bride + groom + friends)
 * Optimized for high performance: no React state re-renders on video frames!
 */
export function useFaceMesh(videoRef, isEnabled = true) {
  const [isReady, setIsReady] = useState(false);
  const faceMeshRef = useRef(null);
  const animRef = useRef(null);
  const facesRef = useRef([]);

  // Load MediaPipe FaceMesh from window or CDN
  const initFaceMesh = useCallback(async () => {
    if (!isEnabled) return;

    try {
      // Check if FaceMesh is already available globally or load script
      if (!window.FaceMesh) {
        await new Promise((resolve, reject) => {
          const existingScript = document.querySelector(`script[src*="face_mesh@${VERSION}"]`);
          if (existingScript) {
            if (window.FaceMesh) {
              resolve();
              return;
            }
            existingScript.addEventListener('load', () => resolve(), { once: true });
            existingScript.addEventListener('error', (e) => reject(e), { once: true });
            return;
          }
          const script = document.createElement('script');
          script.src = `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@${VERSION}/face_mesh.js`;
          script.crossOrigin = 'anonymous';
          script.onload = () => resolve();
          script.onerror = (e) => reject(e);
          document.head.appendChild(script);
        });
      }

      if (!window.FaceMesh) return;

      const faceMesh = new window.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@${VERSION}/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 3, // Support multiple faces in photobooth
        refineLandmarks: false, // 🚀 HUGE SPEEDUP: Iris neural net not needed for accessories! 2x faster load & init
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((results) => {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          facesRef.current = results.multiFaceLandmarks;
        } else {
          facesRef.current = [];
        }
      });

      faceMeshRef.current = faceMesh;
      setIsReady(true);
    } catch (err) {
      console.warn('FaceMesh initialization failed or offline, falling back to viewport center tracking:', err);
    }
  }, [isEnabled]);

  useEffect(() => {
    initFaceMesh();
    return () => {
      if (faceMeshRef.current) {
        try {
          faceMeshRef.current.close();
        } catch (e) {}
        faceMeshRef.current = null;
      }
    };
  }, [initFaceMesh]);

  // Throttled frame processing loop (~22 FPS instead of unthrottled 60 FPS)
  useEffect(() => {
    if (!isReady || !isEnabled) return;

    let isProcessing = false;
    let isMounted = true;
    let lastProcessTime = 0;
    const FRAME_INTERVAL = 45; // ~22 FPS - plenty smooth for AR, frees up 65% CPU for instant UI responsiveness!

    const processVideo = async () => {
      if (!isMounted) return;

      const video = videoRef.current;
      const now = performance.now();

      if (
        video &&
        video.readyState >= 2 &&
        !video.paused &&
        faceMeshRef.current &&
        !isProcessing &&
        now - lastProcessTime >= FRAME_INTERVAL
      ) {
        isProcessing = true;
        lastProcessTime = now;
        try {
          await faceMeshRef.current.send({ image: video });
        } catch (e) {
          // Frame drop or busy
        }
        isProcessing = false;
      }

      animRef.current = requestAnimationFrame(processVideo);
    };

    animRef.current = requestAnimationFrame(processVideo);

    return () => {
      isMounted = false;
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [isReady, isEnabled, videoRef]);

  return { facesRef, isReady };
}
