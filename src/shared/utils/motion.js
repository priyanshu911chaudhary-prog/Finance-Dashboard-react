export const transitionQuint = {
  ease: [0.22, 1, 0.36, 1],
  duration: 0.55,
};

export const springConfig = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 1,
};

export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

export const slideUpItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: transitionQuint },
};
