import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FloatingPlanetProps {
  className?: string;
  size?: number;
  color?: string;
  delay?: number;
  duration?: number;
}

export const FloatingPlanet: React.FC<FloatingPlanetProps> = ({
  className,
  size = 100,
  color = '#7439ff',
  delay = 0,
  duration = 8,
}) => {
  return (
    <motion.div
      animate={{
        y: [0, -20, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      }}
      className={cn("absolute z-0", className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <circle cx="50" cy="50" r="48" fill={color} fillOpacity="0.8" />
        <path
          d="M10 50C10 27.9086 27.9086 10 50 10C72.0914 10 90 27.9086 90 50"
          stroke="white"
          strokeOpacity="0.2"
          strokeWidth="4"
          fill="none"
        />
        <circle cx="30" cy="30" r="8" fill="white" fillOpacity="0.3" />
        <circle cx="70" cy="60" r="5" fill="white" fillOpacity="0.2" />
        {/* Ring */}
        <ellipse
          cx="50"
          cy="50"
          rx="55"
          ry="15"
          stroke="white"
          strokeOpacity="0.4"
          strokeWidth="2"
          transform="rotate(-15 50 50)"
        />
      </svg>
    </motion.div>
  );
};
