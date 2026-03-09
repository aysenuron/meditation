import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const links = [
  { to: '/', label: 'BREATHE' },
  { to: '/sound', label: 'SOUND' },
];

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black/10">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="text-xs font-black tracking-[0.4em] text-black select-none">
          STILLNESS
        </span>
        <div className="flex items-center gap-10">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'}>
              {({ isActive }) => (
                <div className="relative py-1">
                  <span
                    className={`text-xs font-bold tracking-[0.25em] transition-colors duration-200 ${
                      isActive ? 'text-black' : 'text-black/30 hover:text-black/70'
                    }`}
                  >
                    {link.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-px bg-black"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
