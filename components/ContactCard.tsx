"use client";

import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ContactCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  pills: string[];
  buttonText: string;
  onButtonClick: () => void;
  ariaLabel: string;
  delay?: number;
}

export function ContactCard({
  icon,
  title,
  description,
  pills,
  buttonText,
  onButtonClick,
  ariaLabel,
  delay = 0,
}: ContactCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
    >
      {/* we can add a background color here of bg-neutral-900 */}
      <Card className=" border-neutral-800 hover:bg-neutral-800 hover:-translate-y-1 transition-all duration-300 ease-in-out">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div
              className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center"
              aria-hidden="true"
            >
              {icon}
            </div>
            <h3 className="text-white heading-5">{title}</h3>
          </div>
          <CardDescription className="text-neutral-300 paragraph-small-regular">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-1">
          <div
            className="flex flex-wrap gap-2"
            role="list"
            aria-label={ariaLabel}
          >
            {pills.map((pill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                role="listitem"
              >
                {pill}
              </span>
            ))}
          </div>
          <Button
            className="w-full hover:scale-101"
            onClick={onButtonClick}
            aria-describedby={`${title.toLowerCase()}-description`}
            variant="secondary"
          >
            {buttonText}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
