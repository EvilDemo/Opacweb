"use client";

import { Badge } from "@/components/ui/badge";
import { Server, X } from "lucide-react";
import { useState } from "react";

export default function Staging() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge
        variant="secondary"
        className="bg-green-500 text-white dark:bg-green-600 body-text-sm capitalize"
      >
        <Server className="!w-4 !h-4 mr-1" />
        Staging environment
        <button
          onClick={() => setIsVisible(false)}
          className="ml-2 hover:bg-blue-600 rounded-full p-0.5 transition-colors"
          aria-label="Close staging badge"
        >
          <X className="w-5 h-5" />
        </button>
      </Badge>
    </div>
  );
}
