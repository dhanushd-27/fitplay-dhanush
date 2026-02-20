"use client";
import React, { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll, motion } from "motion/react";
import { cn } from "@/lib/utils";

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string;
    description: string;
    content?: React.ReactNode;
  }[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  // ✅ USE PAGE SCROLL INSTEAD OF CONTAINER SCROLL
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });

  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const index = Math.min(
      cardLength - 1,
      Math.floor(latest * cardLength)
    );
    setActiveCard(index);
  });

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen justify-center gap-16 bg-white px-8 py-24"
    >
      {/* LEFT TEXT */}
      <div className="max-w-2xl">
        {content.map((item, index) => (
          <div key={index} className="mb-32">
            <motion.h2
              animate={{ opacity: activeCard === index ? 1 : 0.4 }}
              className="text-2xl font-bold text-gray-900"
            >
              {item.title}
            </motion.h2>

            <motion.p
              animate={{ opacity: activeCard === index ? 1 : 0.4 }}
              className="mt-4 max-w-sm text-gray-600"
            >
              {item.description}
            </motion.p>
          </div>
        ))}
      </div>

      {/* RIGHT STICKY CARD */}
      <div
        className={cn(
          "sticky top-32 hidden lg:flex h-72 w-96 rounded-2xl bg-white shadow-xl items-center justify-center",
          contentClassName
        )}
      >
        {content[activeCard]?.content}
      </div>
    </section>
  );
};
