import { useRef, useState, useCallback } from 'react';

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recorderError, setRecorderError] = useState(null);

  const mrRef = useRef(null);
  const chunksRef = useRef([]);
  const intervalRef = useRef(null);
  const streamRef = useRef(null);

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
  }, []);

  const start = useCallback(async () => {
    setRecorderError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
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
    }
  }, [stop]);

  const reset = useCallback(() => {
    stop();
    setSeconds(0);
    setAudioUrl(null);
    setAudioBlob(null);
    setRecorderError(null);
    chunksRef.current = [];
  }, [stop]);

  const toggle = useCallback(async () => {
    if (isRecording) stop();
    else await start();
  }, [isRecording, start, stop]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return { isRecording, seconds, audioUrl, audioBlob, recorderError, toggle, stop, reset, formatTime };
}