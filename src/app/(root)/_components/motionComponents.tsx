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

export function MotionH2({ children, ...rest }: MotionElementProps<"h2">) {
  return <motion.h2 {...rest}>{children}</motion.h2>;
}
export function MotionP({ children, ...rest }: MotionElementProps<"p">) {
  return <motion.p {...rest}>{children}</motion.p>;
}
