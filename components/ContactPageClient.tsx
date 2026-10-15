"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { motion } from "motion/react";
import Form from "@/components/Form";
import { ContactCard } from "@/components/ContactCard";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";

export default function ContactPageClient() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [formType, setFormType] = useState("");

  const handleButtonClick = (type: string) => {
    setFormType(type);
    setIsOverlayOpen(true);
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
              pills={["Brand Partnerships", "Event Collaborations", "Sponsorship"]}
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
              pills={["Media Inquiries", "Interview Requests", "Press Materials"]}
              buttonText="Media Inquiry"
              onButtonClick={() => handleButtonClick("Media Inquiry")}
              ariaLabel="Press inquiry categories"
              delay={0.9}
            />
          </motion.div>
        </div>
      </motion.section>

      <Sheet open={isOverlayOpen} onOpenChange={setIsOverlayOpen}>
        <SheetContent
          className="w-full sm:max-w-none lg:w-1/2 xl:w-2/5 border-l border-neutral-800 p-8 overflow-y-auto"
          aria-describedby={undefined}
          hideDefaultClose
        >
          <SheetHeader className="flex-row items-center justify-between p-0 mb-8">
            <SheetTitle className="heading-3">{formType}</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="sm" aria-label="Close form">
                <X aria-hidden="true" />
              </Button>
            </SheetClose>
          </SheetHeader>
          <Form />
        </SheetContent>
      </Sheet>
    </main>
  );
}
