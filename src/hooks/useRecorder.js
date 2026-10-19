import { useRef, useState, useCallback, useEffect } from 'react';

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recorderError, setRecorderError] = useState(null);

  const mrRef = useRef(null);
  const chunksRef = useRef([]);
  const intervalRef = useRef(null);
  const streamRef = useRef(null);
  const audioUrlRef = useRef(null);

  useEffect(() => {
    audioUrlRef.current = audioUrl;
  }, [audioUrl]);

  const stop = useCallback(() => {
    if (mrRef.current && mrRef.current.state !== 'inactive') {
      try {
        mrRef.current.stop();
      } catch (e) {
        console.warn("MediaRecorder stop error:", e);
      }
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRecording(false);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    if (mrRef.current) {
      try {
        if (mrRef.current.state === 'recording' && typeof mrRef.current.pause === 'function') {
          mrRef.current.pause();
        }
      } catch (e) {
        console.warn("MediaRecorder pause error:", e);
      }
    }
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resume = useCallback(() => {
    if (mrRef.current) {
      try {
        if (mrRef.current.state === 'paused' && typeof mrRef.current.resume === 'function') {
          mrRef.current.resume();
        }
      } catch (e) {
        console.warn("MediaRecorder resume error:", e);
      }
    }
    setIsPaused(false);
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s >= 14) { 
            stop(); 
            return 15; 
          }
          return s + 1;
        });
      }, 1000);
    }
  }, [stop]);

  const togglePause = useCallback(() => {
    if (isPaused) {
      resume();
    } else if (isRecording) {
      pause();
    }
  }, [isPaused, isRecording, pause, resume]);

  const start = useCallback(async () => {
    setRecorderError(null);
    setIsPaused(false);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioUrlRef.current) {
        try { URL.revokeObjectURL(audioUrlRef.current); } catch (e) {}
        setAudioUrl(null);
        setAudioBlob(null);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      // Determine best supported MIME type for current browser (iOS Safari vs Android vs Desktop)
      let options = undefined;
      let mimeType = 'audio/webm';

      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
          options = { mimeType: 'audio/webm' };
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
          options = { mimeType: 'audio/mp4' };
        } else if (MediaRecorder.isTypeSupported('audio/aac')) {
          mimeType = 'audio/aac';
          options = { mimeType: 'audio/aac' };
        }
      }

      const mr = new MediaRecorder(stream, options);
      mrRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mr.onstop = () => {
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const url = URL.createObjectURL(blob);
          setAudioBlob(blob);
          setAudioUrl(url);
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }
      };

      // Request audio data every 250ms so chunks are constantly captured
      mr.start(250);
      setIsRecording(true);
      setIsPaused(false);
      setSeconds(0);

      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s >= 14) { 
            stop(); 
            return 15; 
          }
          return s + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      setRecorderError("Izin mikrofon tidak diberikan atau tidak didukung di browser ini. Mohon izinkan akses mikrofon di pengaturan HP/browser.");
      setIsRecording(false);
      setIsPaused(false);
    }
  }, [stop]);

  const reset = useCallback(() => {
    stop();
    if (audioUrlRef.current) {
      try { URL.revokeObjectURL(audioUrlRef.current); } catch (e) {}
    }
    setSeconds(0);
    setAudioUrl(null);
    setAudioBlob(null);
    setRecorderError(null);
    setIsPaused(false);
    chunksRef.current = [];
  }, [stop]);

  const toggle = useCallback(async () => {
    if (isRecording) stop();
    else await start();
  }, [isRecording, start, stop]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return { 
    isRecording, 
    isPaused, 
    seconds, 
    audioUrl, 
    audioBlob, 
    recorderError, 
    toggle, 
    start, 
    stop, 
    pause, 
    resume, 
    togglePause, 
    reset, 
    formatTime 
  };
}