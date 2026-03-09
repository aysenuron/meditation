import { motion } from 'framer-motion';

interface OrbConfig {
  color: string;
  size: string;
  top: string;
  left: string;
  delay: number;
  duration: number;
}

const orbs: OrbConfig[] = [
  {
    color: 'bg-purple-300',
    size: 'w-96 h-96',
    top: '-10%',
    left: '-5%',
    delay: 0,
    duration: 8,
  },
  {
    color: 'bg-violet-200',
    size: 'w-72 h-72',
    top: '60%',
    left: '80%',
    delay: 1.5,
    duration: 10,
  },
  {
    color: 'bg-teal-200',
    size: 'w-80 h-80',
    top: '40%',
    left: '-8%',
    delay: 3,
    duration: 9,
  },
  {
    color: 'bg-blue-200',
    size: 'w-64 h-64',
    top: '10%',
    left: '70%',
    delay: 0.5,
    duration: 11,
  },
  {
    color: 'bg-pink-200',
    size: 'w-56 h-56',
    top: '75%',
    left: '30%',
    delay: 2,
    duration: 7,
  },
  {
    color: 'bg-amber-200',
    size: 'w-48 h-48',
    top: '20%',
    left: '45%',
    delay: 4,
    duration: 12,
  },
];

export default function FloatingOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${orb.color} ${orb.size} opacity-20 blur-3xl`}
          style={{ top: orb.top, left: orb.left }}
          animate={{
            y: [0, -30, 10, -20, 0],
            x: [0, 15, -10, 5, 0],
            scale: [1, 1.08, 0.96, 1.05, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
