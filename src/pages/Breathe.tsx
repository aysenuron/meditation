import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingOrbs from '../components/FloatingOrbs';

interface BreathTechnique {
  id: string;
  name: string;
  description: string;
  emoji: string;
  phases: BreathPhase[];
}

interface BreathPhase {
  label: string;
  duration: number; // seconds
  color: string;
  scale: number;
}

const techniques: BreathTechnique[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Equal counts of 4. Used by Navy SEALs to calm the mind.',
    emoji: '📦',
    phases: [
      { label: 'Inhale', duration: 4, color: '#3B82F6', scale: 1.6 },
      { label: 'Hold', duration: 4, color: '#8B5CF6', scale: 1.6 },
      { label: 'Exhale', duration: 4, color: '#06B6D4', scale: 1 },
      { label: 'Hold', duration: 4, color: '#8B5CF6', scale: 1 },
    ],
  },
  {
    id: '478',
    name: '4-7-8 Breathing',
    description: 'A natural tranquilizer for the nervous system.',
    emoji: '💤',
    phases: [
      { label: 'Inhale', duration: 4, color: '#3B82F6', scale: 1.6 },
      { label: 'Hold', duration: 7, color: '#8B5CF6', scale: 1.6 },
      { label: 'Exhale', duration: 8, color: '#06B6D4', scale: 1 },
    ],
  },
  {
    id: 'simple',
    name: 'Simple Breathe',
    description: 'Slow, gentle breathing for everyday calm.',
    emoji: '🌿',
    phases: [
      { label: 'Inhale', duration: 4, color: '#10B981', scale: 1.6 },
      { label: 'Exhale', duration: 6, color: '#06B6D4', scale: 1 },
    ],
  },
];

export default function Breathe() {
  const [selectedTechnique, setSelectedTechnique] = useState<BreathTechnique | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseIndexRef = useRef(0);
  const phaseTimeLeftRef = useRef(0);
  const cycleCountRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startSession = useCallback(
    (technique: BreathTechnique) => {
      clearTimer();
      phaseIndexRef.current = 0;
      phaseTimeLeftRef.current = technique.phases[0].duration;
      cycleCountRef.current = 0;
      setPhaseIndex(0);
      setPhaseTimeLeft(technique.phases[0].duration);
      setCycleCount(0);
      setIsRunning(true);

      intervalRef.current = setInterval(() => {
        phaseTimeLeftRef.current -= 1;

        if (phaseTimeLeftRef.current <= 0) {
          const nextPhaseIndex = (phaseIndexRef.current + 1) % technique.phases.length;
          if (nextPhaseIndex === 0) {
            cycleCountRef.current += 1;
            setCycleCount(cycleCountRef.current);
          }
          phaseIndexRef.current = nextPhaseIndex;
          phaseTimeLeftRef.current = technique.phases[nextPhaseIndex].duration;
          setPhaseIndex(nextPhaseIndex);
        }

        setPhaseTimeLeft(phaseTimeLeftRef.current);
      }, 1000);
    },
    [clearTimer],
  );

  const stopSession = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setPhaseIndex(0);
    setPhaseTimeLeft(0);
  }, [clearTimer]);

  const handleSelectTechnique = (technique: BreathTechnique) => {
    stopSession();
    setSelectedTechnique(technique);
  };

  const handleToggle = () => {
    if (!selectedTechnique) return;
    if (isRunning) {
      stopSession();
    } else {
      startSession(selectedTechnique);
    }
  };

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const currentPhase = selectedTechnique?.phases[phaseIndex];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 overflow-hidden">
      <FloatingOrbs />

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-28 pb-20">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-3">Breathe</h1>
          <p className="text-lg text-gray-500">Choose a technique and follow the circle.</p>
        </motion.div>

        {/* Technique selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {techniques.map((technique, i) => (
            <motion.button
              key={technique.id}
              onClick={() => handleSelectTechnique(technique)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
              className={`p-5 rounded-2xl text-left border-2 transition-all duration-200 cursor-pointer ${
                selectedTechnique?.id === technique.id
                  ? 'border-blue-400 bg-blue-50 shadow-md shadow-blue-100'
                  : 'border-gray-100 bg-white hover:border-blue-200 shadow-sm'
              }`}
            >
              <span className="text-3xl mb-2 block">{technique.emoji}</span>
              <div className="font-bold text-gray-800 text-base mb-1">{technique.name}</div>
              <div className="text-xs text-gray-500 leading-relaxed">{technique.description}</div>
              <div className="mt-2 flex gap-1 flex-wrap">
                {technique.phases.map((p, pi) => (
                  <span key={pi} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                    {p.label} {p.duration}s
                  </span>
                ))}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Breathing animation */}
        <AnimatePresence mode="wait">
          {selectedTechnique && (
            <motion.div
              key={selectedTechnique.id}
              className="flex flex-col items-center gap-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
            >
              {/* Breathing circle */}
              <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
                {/* Outer glow ring */}
                <motion.div
                  className="absolute rounded-full"
                  style={{ backgroundColor: currentPhase?.color ?? '#3B82F6' }}
                  animate={
                    isRunning
                      ? {
                          width: `${(currentPhase?.scale ?? 1) * 200}px`,
                          height: `${(currentPhase?.scale ?? 1) * 200}px`,
                          opacity: [0.08, 0.15, 0.08],
                        }
                      : { width: '240px', height: '240px', opacity: 0.07 }
                  }
                  transition={
                    isRunning
                      ? {
                          width: { duration: currentPhase?.duration ?? 4, ease: 'easeInOut' },
                          height: { duration: currentPhase?.duration ?? 4, ease: 'easeInOut' },
                          opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                        }
                      : { duration: 0.5 }
                  }
                />

                {/* Main circle */}
                <motion.div
                  className="absolute rounded-full flex items-center justify-center shadow-2xl"
                  style={{
                    background: `radial-gradient(circle, ${currentPhase?.color ?? '#3B82F6'}cc, ${currentPhase?.color ?? '#3B82F6'})`,
                  }}
                  animate={
                    isRunning
                      ? {
                          width: `${(currentPhase?.scale ?? 1) * 150}px`,
                          height: `${(currentPhase?.scale ?? 1) * 150}px`,
                        }
                      : { width: '150px', height: '150px' }
                  }
                  transition={
                    isRunning
                      ? {
                          duration: currentPhase?.duration ?? 4,
                          ease: 'easeInOut',
                        }
                      : { duration: 0.5 }
                  }
                >
                  <div className="text-center text-white select-none">
                    <div className="text-xl font-bold">
                      {isRunning ? (currentPhase?.label ?? '') : 'Ready'}
                    </div>
                    {isRunning && phaseTimeLeft > 0 && (
                      <div className="text-3xl font-light mt-1">{phaseTimeLeft}</div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Cycle counter */}
              <div className="text-center">
                {isRunning && (
                  <motion.p
                    className="text-gray-500 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {cycleCount > 0 ? `${cycleCount} cycle${cycleCount !== 1 ? 's' : ''} complete` : 'Starting...'}
                  </motion.p>
                )}
              </div>

              {/* Start / Stop button */}
              <motion.button
                onClick={handleToggle}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                className={`px-10 py-4 rounded-2xl font-bold text-lg text-white shadow-lg transition-all duration-200 ${
                  isRunning
                    ? 'bg-gradient-to-r from-rose-400 to-pink-500 shadow-rose-200'
                    : 'bg-gradient-to-r from-blue-400 to-sky-500 shadow-blue-200'
                }`}
              >
                {isRunning ? '⏹ Stop' : '▶ Start'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {!selectedTechnique && (
          <motion.p
            className="text-center text-gray-400 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Select a technique above to begin.
          </motion.p>
        )}
      </div>
    </div>
  );
}
