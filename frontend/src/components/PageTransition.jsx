import React from 'react';
import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../utils/animations';

/**
 * PageTransition — wraps any page content with a consistent
 * fade + slide-up entrance animation (~0.3s). Zero layout impact.
 */
const PageTransition = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={pageTransition}
  >
    {children}
  </motion.div>
);

export default PageTransition;
