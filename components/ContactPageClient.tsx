"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Form from "@/components/Form";
import { ContactCard } from "@/components/ContactCard";
import { Button } from "@/components/ui/button";

export default function ContactPageClient() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [formType, setFormType] = useState("");

  const handleButtonClick = (type: string) => {
    setFormType(type);
    setIsOverlayOpen(true);
  };

  const handleCloseOverlay = () => {
    setIsOverlayOpen(false);
    setFormType("");
  };

  return (
    <main>
      {/* Main Contact Section */}
      <motion.section
        className="min-h-[calc(100vh-6rem)]  mx-auto padding-global flex items-center"
        aria-labelledby="contact-heading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column - Contact Info */}
          <motion.div
            className="lg:col-span-1 flex flex-col gap-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <div className="flex flex-col gap-4 justify-center h-full">
              <motion.h1
                id="contact-heading"
                className="heading-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              >
                Feel free to reach us using any of the following methods:
              </motion.h1>
              <motion.address
                className="flex flex-col gap-2 not-italic"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
              >
                <div className="body-text-sm">
                  Tel:
                  <a
                    href="tel:+351915006659"
                    className="text-accent hover:text-primary underline underline-offset-4 hover:underline-offset-2 pl-1"
                    aria-label="Call Opac at +351 915 006 659"
                  >
                    +351 915 006 659
                  </a>
                </div>
                <div className="body-text-sm">
                  Email:
                  <a
                    href="mailto:weareopac@gmail.com"
                    className="text-accent hover:text-primary underline underline-offset-4 hover:underline-offset-2 pl-1"
                    aria-label="Email Opac at weareopac@gmail.com"
                  >
                    weareopac@gmail.com
                  </a>
                </div>
              </motion.address>
            </div>
          </motion.div>

          {/* Right Column - Contact Categories */}
          <motion.div
            className="lg:col-span-2 flex flex-col gap-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            <h2 className="sr-only">Contact Categories</h2>
            {/* Artists Section */}
            <ContactCard
              icon={<div className="w-3 h-3 bg-white rounded-full"></div>}
              title="Artists"
              description="Submit your work for consideration. We're always looking for unique voices that resonate with our philosophy."
              pills={["Music Submissions", "Visual Art", "Collaborations"]}
              buttonText="Submit Work"
              onButtonClick={() => handleButtonClick("Submit Work")}
              ariaLabel="Artist submission categories"
              delay={0.5}
            />

            {/* Partners Section */}
            <ContactCard
              icon={<div className="w-4 h-1 bg-white rounded"></div>}
              title="Partners"
              description="Brands, sponsors, and collaborators interested in working with OPAC on creative projects and initiatives."
              pills={[
                "Brand Partnerships",
                "Event Collaborations",
                "Sponsorship",
              ]}
              buttonText="Partner With Us"
              onButtonClick={() => handleButtonClick("Partner With Us")}
              ariaLabel="Partnership categories"
              delay={0.7}
            />

            {/* Press Section */}
            <ContactCard
              icon={<div className="w-4 h-0.5 bg-white"></div>}
              title="Press"
              description="Media inquiries, interview requests, and press kit access for journalists and content creators."
              pills={[
                "Media Inquiries",
                "Interview Requests",
                "Press Materials",
              ]}
              buttonText="Media Inquiry"
              onButtonClick={() => handleButtonClick("Media Inquiry")}
              ariaLabel="Press inquiry categories"
              delay={0.9}
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Form Overlay */}
      <AnimatePresence mode="wait">
        {isOverlayOpen && (
          <>
            {/* Backdrop - covers entire screen immediately */}
            <motion.div
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={handleCloseOverlay}
              aria-label="Close form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />

            {/* Form Panel - slides in from right */}
            <motion.div
              className="fixed top-0 right-0 h-full w-full lg:w-1/2 xl:w-2/5 bg-black border-l border-neutral-800 p-8 overflow-y-auto z-50"
              role="dialog"
              aria-modal="true"
              aria-labelledby="form-title"
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <motion.div
                className="flex justify-between items-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
              >
                <h2 id="form-title" className="heading-3 text-white">
                  {formType}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseOverlay}
                  className="text-white hover:bg-neutral-800 p-2"
                  aria-label="Close form"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
              >
                <Form />
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
