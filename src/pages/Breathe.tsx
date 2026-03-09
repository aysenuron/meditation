import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Phase {
  label: string;
  duration: number;
  scale: number;
}

interface Technique {
  id: string;
  name: string;
  description: string;
  phases: Phase[];
}

const TECHNIQUES: Technique[] = [
  {
    id: 'box',
    name: 'Box',
    description: '4 · 4 · 4 · 4',
    phases: [
      { label: 'INHALE', duration: 4, scale: 1.5 },
      { label: 'HOLD', duration: 4, scale: 1.5 },
      { label: 'EXHALE', duration: 4, scale: 1 },
      { label: 'HOLD', duration: 4, scale: 1 },
    ],
  },
  {
    id: '478',
    name: '4·7·8',
    description: '4 · 7 · 8',
    phases: [
      { label: 'INHALE', duration: 4, scale: 1.5 },
      { label: 'HOLD', duration: 7, scale: 1.5 },
      { label: 'EXHALE', duration: 8, scale: 1 },
    ],
  },
  {
    id: 'simple',
    name: 'Simple',
    description: '4 · 6',
    phases: [
      { label: 'INHALE', duration: 4, scale: 1.5 },
      { label: 'EXHALE', duration: 6, scale: 1 },
    ],
  },
];

function SplitText({ text, className }: { text: string; className?: string }) {
  return (
    <div className={`flex overflow-hidden ${className ?? ''}`}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ y: '110%' }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: char === ' ' ? 'inline-block' : undefined, minWidth: char === ' ' ? '0.4em' : undefined }}
        >
          {char}
        </motion.span>
      ))}
    </div>
  );
}

export default function Breathe() {
  const [selected, setSelected] = useState<Technique | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [cycles, setCycles] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseIdxRef = useRef(0);
  const timeLeftRef = useRef(0);
  const cyclesRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startSession = useCallback(
    (t: Technique) => {
      clearTimer();
      phaseIdxRef.current = 0;
      timeLeftRef.current = t.phases[0].duration;
      cyclesRef.current = 0;
      setPhaseIdx(0);
      setTimeLeft(t.phases[0].duration);
      setCycles(0);
      setIsRunning(true);

      intervalRef.current = setInterval(() => {
        timeLeftRef.current -= 1;
        if (timeLeftRef.current <= 0) {
          const next = (phaseIdxRef.current + 1) % t.phases.length;
          if (next === 0) {
            cyclesRef.current += 1;
            setCycles(cyclesRef.current);
          }
          phaseIdxRef.current = next;
          timeLeftRef.current = t.phases[next].duration;
          setPhaseIdx(next);
        }
        setTimeLeft(timeLeftRef.current);
      }, 1000);
    },
    [clearTimer],
  );

  const stop = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setPhaseIdx(0);
    setTimeLeft(0);
    setCycles(0);
  }, [clearTimer]);

  const handleSelect = (t: Technique) => {
    stop();
    setSelected(t);
  };

  const handleToggle = () => {
    if (!selected) return;
    if (isRunning) stop();
    else startSession(selected);
  };

  useEffect(() => () => clearTimer(), [clearTimer]);

  const currentPhase = selected?.phases[phaseIdx];
  const RING_BASE = 180;
  const ringSize = isRunning ? RING_BASE * (currentPhase?.scale ?? 1) : RING_BASE;
  const outerSize = ringSize * 1.45;
  const phaseDuration = currentPhase?.duration ?? 4;

  return (
    <div className="min-h-screen bg-white flex flex-col pt-14">
      {/* Background decorative rings */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        {[500, 700, 900].map((size, i) => (
          <motion.div
            key={size}
            className="absolute rounded-full border border-black/[0.04]"
            style={{ width: size, height: size }}
            animate={{ scale: [1, 1.04, 1], rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{
              scale: { duration: 6 + i * 2, repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: 40 + i * 20, repeat: Infinity, ease: 'linear' },
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-3xl mx-auto w-full px-6 py-16 flex flex-col items-center">
        {/* Title */}
        <div className="mb-16 text-center">
          <SplitText
            text="BREATHE"
            className="text-7xl font-black tracking-tighter text-black justify-center"
          />
          <motion.p
            className="mt-3 text-xs tracking-[0.3em] text-black/30 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            CHOOSE A TECHNIQUE
          </motion.p>
        </div>

        {/* Technique selector */}
        <motion.div
          className="flex gap-0 border border-black w-full max-w-sm mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {TECHNIQUES.map((t, i) => (
            <button
              key={t.id}
              onClick={() => handleSelect(t)}
              className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all duration-200 cursor-pointer relative ${
                i < TECHNIQUES.length - 1 ? 'border-r border-black' : ''
              } ${selected?.id === t.id ? 'bg-black text-white' : 'bg-white text-black hover:bg-black/5'}`}
            >
              <span className="text-xs font-black tracking-widest">{t.name}</span>
              <span className={`text-[10px] tracking-wider ${selected?.id === t.id ? 'text-white/50' : 'text-black/30'}`}>
                {t.description}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Breathing circle */}
        <div className="relative flex items-center justify-center mb-16" style={{ width: 360, height: 360 }}>
          {/* Slowly rotating dashed outer ring */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 340,
              height: 340,
              border: '1px dashed rgba(0,0,0,0.12)',
              top: '50%',
              left: '50%',
              translateX: '-50%',
              translateY: '-50%',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          />

          {/* Outer breathing ring */}
          <motion.div
            className="absolute rounded-full border border-black/15"
            style={{ top: '50%', left: '50%', translateX: '-50%', translateY: '-50%' }}
            animate={{ width: outerSize, height: outerSize }}
            transition={{ duration: phaseDuration, ease: 'easeInOut' }}
          />

          {/* Main breathing ring */}
          <motion.div
            className="absolute rounded-full border border-black"
            style={{ top: '50%', left: '50%', translateX: '-50%', translateY: '-50%' }}
            animate={{ width: ringSize, height: ringSize }}
            transition={{ duration: phaseDuration, ease: 'easeInOut' }}
          />

          {/* Center content */}
          <div className="relative z-10 flex flex-col items-center justify-center select-none" style={{ width: 160, height: 160 }}>
            <AnimatePresence mode="wait">
              {isRunning && currentPhase ? (
                <motion.div
                  key={currentPhase.label + phaseIdx}
                  className="flex flex-col items-center gap-2"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-xs font-black tracking-[0.3em] text-black">{currentPhase.label}</span>
                  <motion.span
                    key={timeLeft}
                    className="text-5xl font-black tabular-nums text-black leading-none"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {timeLeft}
                  </motion.span>
                </motion.div>
              ) : selected ? (
                <motion.div
                  key="ready"
                  className="flex flex-col items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <span className="text-xs font-black tracking-[0.3em] text-black/40">{selected.name.toUpperCase()}</span>
                  <span className="text-xs tracking-widest text-black/25 font-medium">READY</span>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="w-8 h-px bg-black/20" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Cycle counter */}
        <AnimatePresence>
          {isRunning && cycles > 0 && (
            <motion.p
              className="text-xs tracking-[0.3em] text-black/30 font-medium mb-8"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {cycles} {cycles === 1 ? 'CYCLE' : 'CYCLES'} COMPLETE
            </motion.p>
          )}
        </AnimatePresence>

        {/* Start / Stop */}
        <AnimatePresence mode="wait">
          {selected && (
            <motion.button
              key={isRunning ? 'stop' : 'start'}
              onClick={handleToggle}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className={`px-14 py-4 text-xs font-black tracking-[0.3em] border transition-all duration-200 cursor-pointer ${
                isRunning
                  ? 'border-black bg-black text-white hover:bg-white hover:text-black'
                  : 'border-black bg-white text-black hover:bg-black hover:text-white'
              }`}
            >
              {isRunning ? 'STOP' : 'START'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
