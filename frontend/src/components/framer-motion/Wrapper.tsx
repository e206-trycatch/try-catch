import { motion } from 'framer-motion';
import React from 'react';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      className="w-full"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 1.5,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};

export default Wrapper;
