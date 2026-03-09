import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingOrbs from '../components/FloatingOrbs';
import { meditations } from '../data/meditations';
import { useSpeech } from '../hooks/useSpeech';

export default function MeditationSession() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const meditation = meditations.find((m) => m.id === id);

  const [currentStep, setCurrentStep] = useState(0);
  const { speak, stop, isSpeaking } = useSpeech();

  const totalSteps = meditation?.steps.length ?? 0;
  const step = meditation?.steps[currentStep];

  const goToStep = useCallback(
    (index: number) => {
      stop();
      setCurrentStep(index);
    },
    [stop],
  );

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      goToStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  const handlePlayPause = () => {
    if (isSpeaking) {
      stop();
    } else if (step) {
      speak(step.text);
    }
  };

  // Stop speech when leaving
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  if (!meditation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white">
        <div className="text-center">
          <p className="text-2xl text-gray-400 mb-6">Session not found.</p>
          <button
            onClick={() => navigate('/meditate')}
            className="px-6 py-3 bg-teal-500 text-white rounded-2xl font-semibold hover:bg-teal-600 transition-colors"
          >
            Back to Meditations
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = ((currentStep + 1) / totalSteps) * 100;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 overflow-hidden">
      <FloatingOrbs />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-24 pb-16 flex flex-col min-h-screen">
        {/* Header */}
        <motion.div
          className="flex items-center gap-4 mb-10"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => {
              stop();
              navigate('/meditate');
            }}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-white transition-all"
            aria-label="Back"
          >
            ← Back
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{meditation.emoji}</span>
              <h1 className="text-xl font-bold text-gray-800 truncate">{meditation.title}</h1>
            </div>
          </div>
          <span className="text-sm text-gray-400 shrink-0">
            {currentStep + 1} / {totalSteps}
          </span>
        </motion.div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-teal-100 rounded-full mb-12 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full"
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Step text */}
        <div className="flex-1 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              className="text-center px-4"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -15 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <p className="text-3xl sm:text-4xl text-gray-700 leading-relaxed font-light">
                {step?.text}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <motion.div
          className="mt-12 flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {/* Play / Pause button */}
          <motion.button
            onClick={handlePlayPause}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.93 }}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg shadow-md transition-all duration-200 ${
              isSpeaking
                ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-rose-200'
                : 'bg-gradient-to-r from-teal-400 to-emerald-400 text-white shadow-teal-200'
            }`}
          >
            {isSpeaking ? (
              <>
                <span className="text-xl">⏸</span> Pause
              </>
            ) : (
              <>
                <span className="text-xl">▶</span> Read Aloud
              </>
            )}
          </motion.button>

          {/* Navigation buttons */}
          <div className="flex items-center gap-4 w-full max-w-xs">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:border-teal-300 hover:text-teal-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              ← Back
            </button>

            {isLastStep ? (
              <button
                onClick={() => {
                  stop();
                  navigate('/meditate');
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-400 to-purple-400 text-white font-semibold hover:from-violet-500 hover:to-purple-500 transition-all shadow-md"
              >
                Finish ✓
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 text-white font-semibold hover:from-teal-500 hover:to-emerald-500 transition-all shadow-md"
              >
                Next →
              </button>
            )}
          </div>
        </motion.div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mt-8">
          {meditation.steps.map((_, i) => (
            <button
              key={i}
              onClick={() => goToStep(i)}
              className={`rounded-full transition-all duration-300 ${
                i === currentStep
                  ? 'w-6 h-2 bg-teal-500'
                  : i < currentStep
                    ? 'w-2 h-2 bg-teal-300'
                    : 'w-2 h-2 bg-gray-200'
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
