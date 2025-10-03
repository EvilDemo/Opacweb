"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Define the form schema for newsletter form
const newsletterSchema = z.object({
  email: z.string().email({ error: "Please enter a valid email address." }),
  // Honeypot field for spam protection
  botcheck: z.string().optional(),
});

type NewsletterData = z.infer<typeof newsletterSchema>;

export default function NewsletterForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<NewsletterData>({
    resolver: zodResolver(newsletterSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      botcheck: "",
    },
  });

  async function onSubmit(values: NewsletterData) {
    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare form data for Web3Forms
      const formData = new FormData();
      formData.append(
        "access_key",
        process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ||
          "2742f926-c113-498e-bfef-000d677b29c8"
      );
      formData.append("subject", `Newsletter: ${values.email}`);
      formData.append(
        "message",
        `Newsletter subscription request from: ${values.email}`
      );
      formData.append("botcheck", values.botcheck || "");

      // Submit to Web3Forms
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Show success message and reset form
        setIsSubmitted(true);
        form.reset();
        // Hide success message after 5 seconds
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        throw new Error(result.message || "Newsletter subscription failed");
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="w-full">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="body-text-xs text-white/70">
            Successfully subscribed to newsletter!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Error message display */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-500 text-xs">{error}</p>
              </div>
            </div>
          )}

          {/* Honeypot field for spam protection - hidden from users */}
          <div className="hidden">
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              {...form.register("botcheck")}
            />
          </div>

          <div className="content-stretch flex flex-col sm:flex-row gap-4 items-center justify-start relative shrink-0 w-full">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="basis-0 grow min-h-9 min-w-px relative shrink-0 w-full sm:w-auto">
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                      className="text-white dark:bg-black/20 dark:hover:bg-black/30 dark:focus:text-black dark:focus:bg-white dark:placeholder:text-white/50 transition-colors placeholder:text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting}
              className="hover:bg-white/90 w-full sm:w-auto"
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
