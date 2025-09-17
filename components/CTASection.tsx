import React from "react";
import { Button } from "@/components/ui/button";

interface CTASectionProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick?: () => void;
  className?: string;
}

export default function CTASection({
  title,
  description,
  buttonText,
  onButtonClick,
  className = "",
}: CTASectionProps) {
  return (
    <section
      className={`bg-black flex flex-col gap-20 h-[323px] items-start justify-center padding-global padding-section-large w-full ${className}`}
    >
      <div className="flex items-center justify-start w-full">
        <div className="flex flex-col gap-6 grow items-start justify-start text-white">
          <h2 className="heading-3 w-full">{title}</h2>
          <p className="body-text-lg w-full">{description}</p>
        </div>
        <div className="flex flex-row items-stretch">
          <div className="flex h-full items-center justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={onButtonClick}
              className="paragraph-small-medium"
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
