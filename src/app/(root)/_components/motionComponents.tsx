"use client";
import { motion } from "framer-motion";

interface Props {
  children: React.ReactNode;
  translateX: string | number;
}

export function SlideFrom({ children, translateX }: Props) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        translateX,
      }}
      transition={{
        type: "spring",
        delay: 0.3,
        duration: 1.5,
        damping: 25,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        translateX: 0,
      }}
    >
      {children}
    </motion.div>
  );
}
