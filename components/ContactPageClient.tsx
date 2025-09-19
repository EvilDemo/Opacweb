"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Form from "@/components/Form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
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
            <div className="flex flex-col gap-4">
              <motion.h1
                id="contact-heading"
                className="heading-2"
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
                <div className="paragraph-small-regular">
                  Tel:
                  <a
                    href="tel:+351915006659"
                    className="text-accent hover:text-primary underline underline-offset-4 hover:underline-offset-2 pl-1"
                    aria-label="Call Opac at +351 915 006 659"
                  >
                    +351 915 006 659
                  </a>
                </div>
                <div className="paragraph-small-regular">
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
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            >
              <Card className="bg-neutral-900 border-neutral-800 hover:bg-neutral-800 hover:-translate-y-1 transition-all duration-300 ease-in-out">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <h3 className="text-white heading-2">Artists</h3>
                  </div>
                  <CardDescription className="text-neutral-300 paragraph-small-regular">
                    Submit your work for consideration. We&apos;re always
                    looking for unique voices that resonate with our philosophy.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="flex flex-wrap gap-2"
                    role="list"
                    aria-label="Artist submission categories"
                  >
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                      role="listitem"
                    >
                      Music Submissions
                    </span>
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                      role="listitem"
                    >
                      Visual Art
                    </span>
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                      role="listitem"
                    >
                      Collaborations
                    </span>
                  </div>
                  <Button
                    className="w-full hover:scale-101"
                    onClick={() => handleButtonClick("Submit Work")}
                    aria-describedby="artists-description"
                    variant="secondary"
                  >
                    Submit Work
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Partners Section */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
            >
              <Card className="bg-neutral-900 border-neutral-800 hover:bg-neutral-800 hover:-translate-y-1 transition-all duration-300 ease-in-out">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-8 h-8 rounded border-2 border-white flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <div className="w-4 h-1 bg-white rounded"></div>
                    </div>
                    <h3 className="text-white heading-4">Partners</h3>
                  </div>
                  <CardDescription className="text-neutral-300 paragraph-small-regular">
                    Brands, sponsors, and collaborators interested in working
                    with OPAC on creative projects and initiatives.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="flex flex-wrap gap-2"
                    role="list"
                    aria-label="Partnership categories"
                  >
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                      role="listitem"
                    >
                      Brand Partnerships
                    </span>
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                      role="listitem"
                    >
                      Event Collaborations
                    </span>
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                      role="listitem"
                    >
                      Sponsorship
                    </span>
                  </div>
                  <Button
                    className="w-full hover:scale-101"
                    onClick={() => handleButtonClick("Partner With Us")}
                    aria-describedby="partners-description"
                    variant="secondary"
                  >
                    Partner With Us
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Press Section */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
            >
              <Card className="bg-neutral-900 border-neutral-800 hover:bg-neutral-800 hover:-translate-y-1 transition-all duration-300 ease-in-out">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-8 h-8 rounded border-2 border-white flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <div className="w-4 h-0.5 bg-white"></div>
                    </div>
                    <h3 className="text-white heading-4">Press</h3>
                  </div>
                  <CardDescription className="text-neutral-300 paragraph-small-regular">
                    Media inquiries, interview requests, and press kit access
                    for journalists and content creators.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="flex flex-wrap gap-2"
                    role="list"
                    aria-label="Press inquiry categories"
                  >
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                      role="listitem"
                    >
                      Media Inquiries
                    </span>
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                      role="listitem"
                    >
                      Interview Requests
                    </span>
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                      role="listitem"
                    >
                      Press Materials
                    </span>
                  </div>
                  <Button
                    onClick={() => handleButtonClick("Media Inquiry")}
                    aria-describedby="press-description"
                    variant="secondary"
                    className="w-full hover:scale-101"
                  >
                    Media Inquiry
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Form Overlay */}
      <AnimatePresence mode="wait">
        {isOverlayOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex"
            role="dialog"
            aria-modal="true"
            aria-labelledby="form-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Backdrop */}
            <motion.div
              className="flex-1 bg-black/50 backdrop-blur-sm"
              onClick={handleCloseOverlay}
              aria-label="Close form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />

            {/* Form Panel */}
            <motion.div
              className="w-full lg:w-1/2 xl:w-2/5 bg-black border-l border-neutral-800 p-8 overflow-y-auto"
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
                <h2 id="form-title" className="heading-2 text-white">
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
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
