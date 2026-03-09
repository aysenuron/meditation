import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import FloatingOrbs from '../components/FloatingOrbs';
import { meditations } from '../data/meditations';

const difficultyColors = {
  Beginner: 'bg-emerald-100 text-emerald-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Advanced: 'bg-rose-100 text-rose-700',
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Meditate() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 overflow-hidden">
      <FloatingOrbs />

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-28 pb-20">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-3">Guided Meditations</h1>
          <p className="text-lg text-gray-500">
            Choose a session and let your mind find its center.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col gap-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {meditations.map((meditation) => (
            <motion.button
              key={meditation.id}
              variants={cardVariants}
              transition={{ duration: 0.5 }}
              whileHover={{ x: 6, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/meditate/${meditation.id}`)}
              className="bg-white rounded-3xl p-7 shadow-sm hover:shadow-lg transition-all duration-300 text-left border border-teal-50 group cursor-pointer"
            >
              <div className="flex items-start gap-5">
                <span className="text-5xl shrink-0">{meditation.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h2 className="text-2xl font-bold text-gray-800">{meditation.title}</h2>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${difficultyColors[meditation.difficulty]}`}
                    >
                      {meditation.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-500 mb-3 leading-relaxed">{meditation.description}</p>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-teal-600 font-medium flex items-center gap-1">
                      ⏱ {meditation.duration}
                    </span>
                    <span className="text-sm text-gray-400">
                      {meditation.steps.length} steps
                    </span>
                    <span className="text-sm text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium ml-auto">
                      Begin →
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        <motion.p
          className="text-center text-gray-400 text-sm mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Find a quiet space, sit comfortably, and let your breath guide you.
        </motion.p>
      </div>
    </div>
  );
}
