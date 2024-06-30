"use client";
import { HTMLMotionProps, motion, MotionProps } from "framer-motion";
import { ReactHTML } from "react";

interface Props {
  children: React.ReactNode;
}

type MotionElementProps<T extends keyof ReactHTML> = HTMLMotionProps<T> & Props;

export function MotionDiv({ children, ...rest }: MotionElementProps<"div">) {
  return <motion.div {...rest}>{children}</motion.div>;
}
