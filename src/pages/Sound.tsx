import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFrequencySound } from '../hooks/useFrequencySound';
import type { FrequencyHz } from '../hooks/useFrequencySound';

const FREQUENCIES: { hz: FrequencyHz; note: string; label: string }[] = [
  { hz: 396, note: 'UT', label: 'Liberation' },
  { hz: 417, note: 'RE', label: 'Transformation' },
  { hz: 528, note: 'MI', label: 'Miracles' },
  { hz: 639, note: 'FA', label: 'Connection' },
  { hz: 741, note: 'SOL', label: 'Intuition' },
  { hz: 852, note: 'LA', label: 'Awakening' },
];

function formatTime(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function playBell(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(528, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(264, ctx.currentTime + 2);
  gain.gain.setValueAtTime(0.45, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 2.5);
}

function SplitText({ text, className }: { text: string; className?: string }) {
  return (
    <div className={`flex overflow-hidden ${className ?? ''}`}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ y: '110%' }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          {char}
        </motion.span>
      ))}
    </div>
  );
}

function WaveformBars() {
  return (
    <div className="flex items-end gap-0.5 h-5">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-0.5 bg-white rounded-full"
          animate={{ height: ['4px', `${8 + Math.random() * 10}px`, '4px'] }}
          transition={{
            duration: 0.6 + i * 0.1,
            repeat: Infinity,
            delay: i * 0.12,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export default function Sound() {
  const [minutes, setMinutes] = useState(10);
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [finished, setFinished] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const { activeFreq, toggle } = useFrequencySound();

  const getCtx = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    return audioCtxRef.current;
  };

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = () => {
    setFinished(false);
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          setFinished(true);
          const ctx = getCtx();
          if (ctx.state === 'suspended') ctx.resume().then(() => playBell(ctx));
          else playBell(ctx);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pause = () => {
    clearTimer();
    setIsRunning(false);
  };

  const reset = () => {
    clearTimer();
    setIsRunning(false);
    setFinished(false);
    setTimeLeft(minutes * 60);
  };

  const changeMinutes = (val: number) => {
    const clamped = Math.min(60, Math.max(1, val));
    setMinutes(clamped);
    if (!isRunning) {
      setTimeLeft(clamped * 60);
      setFinished(false);
    }
  };

  useEffect(() => () => clearTimer(), [clearTimer]);

  const progress = 1 - timeLeft / (minutes * 60);
  const r = 72;
  const circ = 2 * Math.PI * r;

  return (
    <div className="min-h-screen bg-white flex flex-col pt-14">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <motion.div
          className="absolute rounded-full border border-black/[0.03]"
          style={{ width: 800, height: 800 }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full border border-black/[0.03]"
          style={{ width: 500, height: 500 }}
          animate={{ scale: [1.06, 1, 1.06] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto w-full px-6 py-16">
        {/* Title */}
        <div className="mb-16 text-center">
          <SplitText
            text="SOUND"
            className="text-7xl font-black tracking-tighter text-black justify-center"
          />
          <motion.p
            className="mt-3 text-xs tracking-[0.3em] text-black/30 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            SOLFEGGIO FREQUENCIES
          </motion.p>
        </div>

        {/* Frequency grid */}
        <motion.div
          className="grid grid-cols-3 border-l border-t border-black mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {FREQUENCIES.map((f, i) => {
            const isActive = activeFreq === f.hz;
            return (
              <motion.button
                key={f.hz}
                onClick={() => toggle(f.hz)}
                className={`relative border-r border-b border-black p-6 flex flex-col gap-2 cursor-pointer transition-colors duration-300 ${
                  isActive ? 'bg-black text-white' : 'bg-white text-black hover:bg-black/5'
                }`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.5 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className={`text-xs font-black tracking-[0.3em] ${isActive ? 'text-white/40' : 'text-black/25'}`}>
                  {f.note}
                </span>
                <span className="text-3xl font-black leading-none tabular-nums">
                  {f.hz}
                  <span className={`text-base font-bold ml-1 ${isActive ? 'text-white/60' : 'text-black/40'}`}>Hz</span>
                </span>
                <span className={`text-[10px] font-bold tracking-[0.2em] ${isActive ? 'text-white/50' : 'text-black/30'}`}>
                  {f.label.toUpperCase()}
                </span>
                {isActive && (
                  <div className="mt-1">
                    <WaveformBars />
                  </div>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Active frequency label */}
        <AnimatePresence>
          {activeFreq && (
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <span className="text-xs tracking-[0.3em] text-black/30 font-medium">
                PLAYING {activeFreq} Hz
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timer */}
        <motion.div
          className="border border-black p-10 flex flex-col items-center gap-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <span className="text-xs font-black tracking-[0.4em] text-black/30">TIMER</span>

          {/* Circular progress */}
          <div className="relative" style={{ width: 180, height: 180 }}>
            <svg width="180" height="180" className="-rotate-90">
              <circle cx="90" cy="90" r={r} fill="none" stroke="#e5e5e5" strokeWidth="1" />
              <motion.circle
                cx="90"
                cy="90"
                r={r}
                fill="none"
                stroke="black"
                strokeWidth="1"
                strokeLinecap="square"
                strokeDasharray={circ}
                animate={{ strokeDashoffset: circ * (1 - progress) }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                {finished ? (
                  <motion.span
                    key="done"
                    className="text-xs font-black tracking-[0.3em]"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    DONE
                  </motion.span>
                ) : (
                  <motion.span
                    key="time"
                    className="text-3xl font-black tabular-nums"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {formatTime(timeLeft)}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Duration picker */}
          {!isRunning && (
            <motion.div
              className="flex items-center gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <button
                onClick={() => changeMinutes(minutes - 1)}
                className="w-8 h-8 border border-black flex items-center justify-center text-lg font-black hover:bg-black hover:text-white transition-colors cursor-pointer"
              >
                −
              </button>
              <span className="text-sm font-black tracking-widest w-20 text-center tabular-nums">
                {minutes} MIN
              </span>
              <button
                onClick={() => changeMinutes(minutes + 1)}
                className="w-8 h-8 border border-black flex items-center justify-center text-lg font-black hover:bg-black hover:text-white transition-colors cursor-pointer"
              >
                +
              </button>
            </motion.div>
          )}

          {/* Controls */}
          <div className="flex gap-4">
            <AnimatePresence mode="wait">
              {!isRunning ? (
                <motion.button
                  key="start"
                  onClick={start}
                  disabled={timeLeft === 0}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-3 bg-black text-white text-xs font-black tracking-[0.3em] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/80 transition-colors cursor-pointer"
                >
                  {finished ? 'RESTART' : 'START'}
                </motion.button>
              ) : (
                <motion.button
                  key="pause"
                  onClick={pause}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-3 bg-black text-white text-xs font-black tracking-[0.3em] hover:bg-black/80 transition-colors cursor-pointer"
                >
                  PAUSE
                </motion.button>
              )}
            </AnimatePresence>
            <motion.button
              onClick={reset}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 border border-black text-xs font-black tracking-[0.3em] hover:bg-black hover:text-white transition-colors cursor-pointer"
            >
              RESET
            </motion.button>
          </div>
        </motion.div>

        <motion.p
          className="text-center text-[10px] tracking-[0.2em] text-black/20 mt-8 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          TONES GENERATED IN REAL-TIME VIA WEB AUDIO API
        </motion.p>
      </div>
    </div>
  );
}
