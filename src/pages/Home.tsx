import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import FloatingOrbs from '../components/FloatingOrbs';

const features = [
  {
    emoji: '🧘',
    title: 'Meditate',
    description: 'Guided sessions for focus, calm, and clarity.',
    path: '/meditate',
    gradient: 'from-teal-400 to-emerald-400',
    bg: 'from-teal-50 to-emerald-50',
    border: 'border-teal-100',
    badge: 'bg-teal-100 text-teal-700',
  },
  {
    emoji: '🌬️',
    title: 'Breathe',
    description: 'Breathing exercises to reset your nervous system.',
    path: '/breathe',
    gradient: 'from-blue-400 to-sky-400',
    bg: 'from-blue-50 to-sky-50',
    border: 'border-blue-100',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    emoji: '🎵',
    title: 'Relax',
    description: 'Ambient sounds and timers for deep relaxation.',
    path: '/relax',
    gradient: 'from-amber-400 to-yellow-400',
    bg: 'from-amber-50 to-yellow-50',
    border: 'border-amber-100',
    badge: 'bg-amber-100 text-amber-700',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 overflow-hidden">
      <FloatingOrbs />

      <div className="relative z-10 flex flex-col items-center justify-start pt-28 pb-20 px-4">
        {/* Hero section */}
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div
            className="inline-block text-6xl mb-6"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            🌸
          </motion.div>

          <h1
            className="text-6xl sm:text-7xl font-bold mb-6 leading-tight gradient-text"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 40%, #EC4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Mindful Moments
          </h1>

          <motion.p
            className="text-xl sm:text-2xl text-gray-500 font-light mb-4 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Your personal sanctuary for peace and presence.
          </motion.p>

          <motion.p
            className="text-base text-gray-400 mb-16 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Take a breath. Slow down. You deserve a moment of stillness — and it starts right here.
          </motion.p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.15, delayChildren: 0.3 }}
        >
          {features.map((feature) => (
            <motion.button
              key={feature.path}
              onClick={() => navigate(feature.path)}
              variants={itemVariants}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`relative bg-gradient-to-br ${feature.bg} border ${feature.border} rounded-3xl p-8 text-left shadow-sm hover:shadow-xl transition-shadow duration-300 cursor-pointer overflow-hidden group`}
            >
              {/* Subtle gradient overlay on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-3xl`}
              />

              <div className="relative">
                <span className="text-5xl mb-5 block">{feature.emoji}</span>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{feature.title}</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{feature.description}</p>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${feature.badge}`}
                >
                  Get started →
                </span>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Welcome message */}
        <motion.div
          className="mt-20 text-center max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <p className="text-gray-400 text-sm leading-loose">
            ✨ No account needed. No distractions. Just you and your breath.
            <br />
            All sessions run entirely in your browser.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
