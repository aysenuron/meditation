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

const SESSION_OPTIONS = [5, 10, 15] as const;

function formatTime(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function playPhaseTone(ctx: AudioContext, phase: string, duration: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  const now = ctx.currentTime;
  const d = duration;

  if (phase === 'INHALE') {
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(290, now + d * 0.9);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + Math.min(0.5, d * 0.12));
    gain.gain.setValueAtTime(0.15, now + d - Math.min(0.4, d * 0.1));
    gain.gain.linearRampToValueAtTime(0, now + d);
  } else if (phase === 'EXHALE') {
    osc.frequency.setValueAtTime(290, now);
    osc.frequency.linearRampToValueAtTime(190, now + d * 0.9);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0, now + d);
  } else {
    // HOLD — very faint sustained hum
    osc.frequency.setValueAtTime(245, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.4);
    gain.gain.setValueAtTime(0.05, now + d - 0.4);
    gain.gain.linearRampToValueAtTime(0, now + d);
  }

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + d);
}

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
  const [sessionMinutes, setSessionMinutes] = useState<number>(5);
  const [sessionLeft, setSessionLeft] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseIdxRef = useRef(0);
  const timeLeftRef = useRef(0);
  const cyclesRef = useRef(0);
  const sessionLeftRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startSession = useCallback(
    (t: Technique, minutes: number) => {
      clearTimer();
      phaseIdxRef.current = 0;
      timeLeftRef.current = t.phases[0].duration;
      cyclesRef.current = 0;
      sessionLeftRef.current = minutes * 60;
      setPhaseIdx(0);
      setTimeLeft(t.phases[0].duration);
      setCycles(0);
      setSessionLeft(minutes * 60);
      setIsRunning(true);

      // Play first phase tone
      const ctx = getCtx();
      playPhaseTone(ctx, t.phases[0].label, t.phases[0].duration);

      intervalRef.current = setInterval(() => {
        // Session countdown
        sessionLeftRef.current -= 1;
        setSessionLeft(sessionLeftRef.current);

        if (sessionLeftRef.current <= 0) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setIsRunning(false);
          setPhaseIdx(0);
          setTimeLeft(0);
          setCycles(0);
          setSessionLeft(0);
          return;
        }

        // Phase countdown
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
          // Play tone for new phase
          const ctx2 = audioCtxRef.current;
          if (ctx2) playPhaseTone(ctx2, t.phases[next].label, t.phases[next].duration);
        }
        setTimeLeft(timeLeftRef.current);
      }, 1000);
    },
    [clearTimer, getCtx],
  );

  const stop = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setPhaseIdx(0);
    setTimeLeft(0);
    setCycles(0);
    setSessionLeft(0);
  }, [clearTimer]);

  const handleSelect = (t: Technique) => {
    stop();
    setSelected(t);
  };

  const handleToggle = () => {
    if (!selected) return;
    if (isRunning) stop();
    else startSession(selected, sessionMinutes);
  };

  useEffect(() => () => clearTimer(), [clearTimer]);

  const currentPhase = selected?.phases[phaseIdx];
  const RING_BASE = typeof window !== 'undefined' && window.innerWidth < 640 ? 130 : 180;
  const ringSize = isRunning ? RING_BASE * (currentPhase?.scale ?? 1) : RING_BASE;
  const outerSize = ringSize * 1.45;
  const phaseDuration = currentPhase?.duration ?? 4;
  const circleContainer = RING_BASE * 2;
  const sessionProgress = sessionLeft > 0 ? sessionLeft / (sessionMinutes * 60) : 1;

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

      <div className="relative z-10 max-w-3xl mx-auto w-full px-4 md:px-6 py-8 md:py-16 flex flex-col items-center">
        {/* Title */}
        <div className="mb-8 md:mb-12 text-center">
          <SplitText
            text="BREATHE"
            className="text-5xl md:text-7xl font-black tracking-tighter text-black justify-center"
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
          className="flex gap-0 border border-black w-full max-w-sm mb-6"
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

        {/* Duration picker + Start/Stop */}
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              className="flex flex-col items-center gap-4 mb-8 md:mb-12 w-full max-w-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {/* Duration options */}
              {!isRunning && (
                <div className="flex border border-black w-full">
                  {SESSION_OPTIONS.map((m, i) => (
                    <button
                      key={m}
                      onClick={() => setSessionMinutes(m)}
                      className={`flex-1 py-3 text-xs font-black tracking-[0.25em] transition-colors duration-200 cursor-pointer ${
                        i < SESSION_OPTIONS.length - 1 ? 'border-r border-black' : ''
                      } ${sessionMinutes === m ? 'bg-black text-white' : 'bg-white text-black hover:bg-black/5'}`}
                    >
                      {m} MIN
                    </button>
                  ))}
                </div>
              )}

              {/* Session time remaining when running */}
              {isRunning && (
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-1 h-px bg-black/10 relative overflow-hidden">
                    <motion.div
                      className="absolute left-0 top-0 h-full bg-black"
                      animate={{ width: `${(1 - sessionProgress) * 100}%` }}
                      transition={{ duration: 1, ease: 'linear' }}
                    />
                  </div>
                  <span className="text-xs font-black tabular-nums text-black/40 tracking-widest shrink-0">
                    {formatTime(sessionLeft)}
                  </span>
                  <div className="flex-1 h-px bg-black/10" />
                </div>
              )}

              {/* Start / Stop button */}
              <motion.button
                key={isRunning ? 'stop' : 'start'}
                onClick={handleToggle}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className={`w-full py-4 text-xs font-black tracking-[0.3em] border transition-all duration-200 cursor-pointer ${
                  isRunning
                    ? 'border-black bg-black text-white hover:bg-white hover:text-black'
                    : 'border-black bg-white text-black hover:bg-black hover:text-white'
                }`}
              >
                {isRunning ? 'STOP' : 'START'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Breathing circle */}
        <div className="relative flex items-center justify-center mb-6" style={{ width: circleContainer + 80, height: circleContainer + 80 }}>
          {/* Slowly rotating dashed outer ring */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: circleContainer + 60,
              height: circleContainer + 60,
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
          <div className="relative z-10 flex flex-col items-center justify-center select-none" style={{ width: RING_BASE * 0.88, height: RING_BASE * 0.88 }}>
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
                    className="text-4xl md:text-5xl font-black tabular-nums text-black leading-none"
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
              className="text-xs tracking-[0.3em] text-black/30 font-medium"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {cycles} {cycles === 1 ? 'CYCLE' : 'CYCLES'} COMPLETE
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
