import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Custom Hook to track facial landmarks in real-time using MediaPipe FaceMesh
 * Supports multi-person detection (e.g. bride + groom + friends)
 */
export function useFaceMesh(videoRef, isEnabled = true) {
  const [faces, setFaces] = useState([]);
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
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
          script.crossOrigin = 'anonymous';
          script.onload = () => resolve();
          script.onerror = (e) => reject(e);
          document.head.appendChild(script);
        });
      }

      if (!window.FaceMesh) return;

      const faceMesh = new window.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 4, // Support up to 4 faces in photobooth!
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((results) => {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          facesRef.current = results.multiFaceLandmarks;
          setFaces(results.multiFaceLandmarks);
        } else {
          facesRef.current = [];
          setFaces([]);
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
        faceMeshRef.current.close();
        faceMeshRef.current = null;
      }
    };
  }, [initFaceMesh]);

  // Continuous frame processing loop
  useEffect(() => {
    if (!isReady || !isEnabled) return;

    let isProcessing = false;
    let isMounted = true;

    const processVideo = async () => {
      if (!isMounted) return;

      const video = videoRef.current;
      if (
        video &&
        video.readyState >= 2 &&
        !video.paused &&
        faceMeshRef.current &&
        !isProcessing
      ) {
        isProcessing = true;
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

  return { faces, facesRef, isReady };
}
