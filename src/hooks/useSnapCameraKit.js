import { useState, useRef, useEffect, useCallback } from 'react';
import { SNAP_CONFIG } from '../config/snapchat';

export function useSnapCameraKit() {
  const [isReady, setIsReady] = useState(false);
  const [activeLensId, setActiveLensId] = useState('none');
  const [isLoadingLens, setIsLoadingLens] = useState(false);
  const [snapError, setSnapError] = useState(null);

  const cameraKitRef = useRef(null);
  const sessionRef = useRef(null);
  const lensMapRef = useRef(new Map());

  // Initialize Snap Camera Kit
  const initSnap = useCallback(async (canvasElement, videoStream) => {
    // Check if valid API token is configured
    if (!SNAP_CONFIG.apiToken || SNAP_CONFIG.apiToken.includes("YOUR_SNAP")) {
      console.log("Snap Camera Kit: Menggunakan demo lens mode (API token belum dimasukkan).");
      setIsReady(true);
      return;
    }

    try {
      const { bootstrapCameraKit, createMediaStreamSource } = await import('@snap/camera-kit');
      
      const cameraKit = await bootstrapCameraKit({
        apiToken: SNAP_CONFIG.apiToken,
      });
      cameraKitRef.current = cameraKit;

      const session = await cameraKit.createSession({
        liveRenderTarget: canvasElement,
      });
      sessionRef.current = session;

      if (videoStream) {
        const source = createMediaStreamSource(videoStream);
        await session.setSource(source);
        await source.setRenderSize(canvasElement.width, canvasElement.height);
      }

      await session.play();
      setIsReady(true);
    } catch (err) {
      console.warn("Snap Camera Kit Init Notice:", err);
      setSnapError(err.message);
      setIsReady(true); // fallback mode
    }
  }, []);

  // Apply a Snapchat lens
  const applyLens = useCallback(async (lensConfig) => {
    setActiveLensId(lensConfig.id);
    if (!sessionRef.current || !cameraKitRef.current || !lensConfig.lensId) {
      if (sessionRef.current) {
        await sessionRef.current.clearLens();
      }
      return;
    }

    try {
      setIsLoadingLens(true);
      let lens = lensMapRef.current.get(lensConfig.lensId);
      if (!lens) {
        lens = await cameraKitRef.current.lensRepository.loadLens(
          lensConfig.lensId,
          SNAP_CONFIG.groupId
        );
        lensMapRef.current.set(lensConfig.lensId, lens);
      }
      await sessionRef.current.applyLens(lens);
    } catch (err) {
      console.warn("Could not apply Snap Lens:", err);
    } finally {
      setIsLoadingLens(false);
    }
  }, []);

  const destroy = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.pause();
      sessionRef.current.destroy();
      sessionRef.current = null;
    }
    cameraKitRef.current = null;
    setIsReady(false);
  }, []);

  useEffect(() => {
    return () => destroy();
  }, [destroy]);

  return {
    isReady,
    activeLensId,
    isLoadingLens,
    snapError,
    initSnap,
    applyLens,
    destroy,
    lenses: SNAP_CONFIG.lenses
  };
}