import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import FloatingOrbs from '../components/FloatingOrbs';
import { useAmbientSound } from '../hooks/useAmbientSound';

type SoundType = 'rain' | 'forest' | 'ocean' | 'whitenoise';

const soundOptions: { type: SoundType; label: string; emoji: string; description: string }[] = [
  { type: 'rain', label: 'Rain', emoji: '🌧️', description: 'Soft rainfall' },
  { type: 'forest', label: 'Forest', emoji: '🌲', description: 'Birds & breeze' },
  { type: 'ocean', label: 'Ocean', emoji: '🌊', description: 'Gentle waves' },
  { type: 'whitenoise', label: 'White Noise', emoji: '📻', description: 'Steady hum' },
];

function playBell(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1.5);
  gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 2);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Relax() {
  const [inputMinutes, setInputMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const { toggle, currentSound } = useAmbientSound();

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  };

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleStart = () => {
    setIsFinished(false);
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          setIsFinished(true);
          const ctx = getAudioCtx();
          if (ctx.state === 'suspended') ctx.resume().then(() => playBell(ctx));
          else playBell(ctx);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePause = () => {
    clearTimer();
    setIsRunning(false);
  };

  const handleReset = () => {
    clearTimer();
    setIsRunning(false);
    setIsFinished(false);
    setTimeLeft(inputMinutes * 60);
  };

  const handleMinutesChange = (value: number) => {
    const clamped = Math.min(60, Math.max(1, value));
    setInputMinutes(clamped);
    if (!isRunning) {
      setTimeLeft(clamped * 60);
      setIsFinished(false);
    }
  };

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const progress = 1 - timeLeft / (inputMinutes * 60);
  const circumference = 2 * Math.PI * 80;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 overflow-hidden">
      <FloatingOrbs />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-28 pb-20">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-3">Relax</h1>
          <p className="text-lg text-gray-500">Set a timer and drift into calm with ambient sounds.</p>
        </motion.div>

        {/* Timer section */}
        <motion.div
          className="bg-white rounded-3xl p-8 shadow-sm border border-amber-50 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {/* Circular progress + time display */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative" style={{ width: 200, height: 200 }}>
              <svg width="200" height="200" className="rotate-[-90deg]">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#FEF3C7"
                  strokeWidth="10"
                />
                <motion.circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="url(#timerGrad)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset: circumference * (1 - progress) }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#FCD34D" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {isFinished ? (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-4xl"
                  >
                    🔔
                  </motion.div>
                ) : (
                  <span className="text-4xl font-bold text-gray-800 tabular-nums">
                    {formatTime(timeLeft)}
                  </span>
                )}
                {isFinished && (
                  <span className="text-sm text-amber-600 font-semibold mt-1">Done!</span>
                )}
              </div>
            </div>
          </div>

          {/* Minute input */}
          {!isRunning && (
            <motion.div
              className="flex items-center justify-center gap-4 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-gray-500 text-sm font-medium">Duration:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMinutesChange(inputMinutes - 1)}
                  className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold text-lg hover:bg-amber-200 transition-colors flex items-center justify-center"
                >
                  −
                </button>
                <span className="text-xl font-bold text-gray-800 w-16 text-center tabular-nums">
                  {inputMinutes} min
                </span>
                <button
                  onClick={() => handleMinutesChange(inputMinutes + 1)}
                  className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold text-lg hover:bg-amber-200 transition-colors flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </motion.div>
          )}

          {/* Timer controls */}
          <div className="flex gap-3 justify-center">
            {!isRunning ? (
              <motion.button
                onClick={handleStart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                disabled={timeLeft === 0}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-white font-bold text-lg shadow-md shadow-amber-200 hover:from-amber-500 hover:to-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {isFinished ? '▶ Restart' : '▶ Start'}
              </motion.button>
            ) : (
              <motion.button
                onClick={handlePause}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 text-white font-bold text-lg shadow-md shadow-orange-200 hover:from-orange-500 hover:to-amber-500 transition-all"
              >
                ⏸ Pause
              </motion.button>
            )}
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-2xl border-2 border-amber-200 text-amber-600 font-semibold hover:bg-amber-50 transition-all"
            >
              ↺ Reset
            </button>
          </div>
        </motion.div>

        {/* Ambient sounds */}
        <motion.div
          className="bg-white rounded-3xl p-8 shadow-sm border border-amber-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
        >
          <h2 className="text-xl font-bold text-gray-700 mb-5">Ambient Sounds</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {soundOptions.map((sound) => (
              <motion.button
                key={sound.type}
                onClick={() => toggle(sound.type)}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                  currentSound === sound.type
                    ? 'border-amber-400 bg-amber-50 shadow-md shadow-amber-100'
                    : 'border-gray-100 bg-gray-50 hover:border-amber-200 hover:bg-amber-50/50'
                }`}
              >
                <span className="text-3xl">{sound.emoji}</span>
                <span
                  className={`text-sm font-semibold ${
                    currentSound === sound.type ? 'text-amber-700' : 'text-gray-600'
                  }`}
                >
                  {sound.label}
                </span>
                <span className="text-xs text-gray-400">{sound.description}</span>
                {currentSound === sound.type && (
                  <motion.div
                    className="flex gap-0.5"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {[1, 2, 3].map((b) => (
                      <motion.div
                        key={b}
                        className="w-1 bg-amber-400 rounded-full"
                        animate={{ height: ['6px', '14px', '6px'] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: b * 0.15,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center">
            All sounds generated in real-time via Web Audio API. No downloads needed.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
