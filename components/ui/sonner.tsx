"use client";

import { Toaster as Sonner } from "sonner";

const Toaster = () => {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      richColors
      closeButton
      duration={4000}
      expand={true}
      toastOptions={{
        style: {
          zIndex: 9999,
        },
      }}
    />
  );
};

export { Toaster };
