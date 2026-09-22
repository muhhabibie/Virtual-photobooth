import { useRef, useState, useCallback } from 'react';

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);

  const mrRef = useRef(null);
  const chunksRef = useRef([]);
  const intervalRef = useRef(null);
  const streamRef = useRef(null);

  const stop = useCallback(() => {
    if (mrRef.current && mrRef.current.state !== 'inactive') {
      mrRef.current.stop();
    }
    clearInterval(intervalRef.current);
    setIsRecording(false);
  }, []);

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    chunksRef.current = [];
    const mr = new MediaRecorder(stream);
    mrRef.current = mr;

    mr.ondataavailable = (e) => chunksRef.current.push(e.data);
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      setAudioBlob(blob);
      setAudioUrl(url);
      stream.getTracks().forEach(t => t.stop());
    };

    mr.start();
    setIsRecording(true);
    setSeconds(0);
    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s >= 14) { stop(); return 15; }
        return s + 1;
      });
    }, 1000);
  }, [stop]);

  const reset = useCallback(() => {
    stop();
    setSeconds(0);
    setAudioUrl(null);
    setAudioBlob(null);
    chunksRef.current = [];
  }, [stop]);

  const toggle = useCallback(async () => {
    if (isRecording) stop();
    else await start();
  }, [isRecording, start, stop]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return { isRecording, seconds, audioUrl, audioBlob, toggle, stop, reset, formatTime };
}