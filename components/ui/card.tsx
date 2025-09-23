import * as React from "react";
import { motion, HTMLMotionProps } from "motion/react";

import { cn } from "@/lib/utils";

function Card({
  className,
  children,
  ...props
}: HTMLMotionProps<"div"> & { children?: React.ReactNode }) {
  return (
    <motion.div
      data-slot="card"
      className={cn(
        "bg-gradient-to-br from-neutral-900 to-black text-white flex flex-col rounded-2xl border border-neutral-800 py-4 px-4 shadow-sm overflow-hidden group relative",
        className
      )}
      whileHover={{
        scale: 1.02,
        rotateY: 2,
        rotateX: 1,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.15,
      }}
      style={{ transformStyle: "preserve-3d" }}
      {...props}
    >
      {/* Animated Background Pattern */}
      <motion.div
        className="absolute inset-0 opacity-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl" />
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10 blur-xl"></div>
      <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/5 blur-2xl"></div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

function CardHeader({
  className,
  children,
  ...props
}: HTMLMotionProps<"div"> & { children?: React.ReactNode }) {
  return (
    <motion.div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function CardTitle({
  className,
  children,
  ...props
}: HTMLMotionProps<"div"> & { children?: React.ReactNode }) {
  return (
    <motion.div
      data-slot="card-title"
      className={cn(" leading-none font-semibold text-white", className)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.15 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function CardDescription({
  className,
  children,
  ...props
}: HTMLMotionProps<"div"> & { children?: React.ReactNode }) {
  return (
    <motion.div
      data-slot="card-description"
      className={cn("text-neutral-400 text-sm leading-relaxed", className)}
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 0.7 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function CardAction({
  className,
  children,
  ...props
}: HTMLMotionProps<"div"> & { children?: React.ReactNode }) {
  return (
    <motion.div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay: 0.7,
        duration: 0.5,
        type: "spring",
        stiffness: 200,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function CardContent({
  className,
  children,
  ...props
}: HTMLMotionProps<"div"> & { children?: React.ReactNode }) {
  return (
    <motion.div
      data-slot="card-content"
      className={cn("", className)}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function CardFooter({
  className,
  children,
  ...props
}: HTMLMotionProps<"div"> & { children?: React.ReactNode }) {
  return (
    <motion.div
      data-slot="card-footer"
      className={cn("flex items-center [.border-t]:pt-6", className)}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
