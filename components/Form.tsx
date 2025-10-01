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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Web3Forms public access key
const WEB3FORMS_ACCESS_KEY = "2742f926-c113-498e-bfef-000d677b29c8";

// Define the form schema with Zod
const formSchema = z.object({
  name: z
    .string()
    .min(2, { error: "Name must be at least 2 characters." })
    .max(50, { error: "Name must be less than 50 characters." })
    .regex(/^[a-zA-Z\s\-']+$/, {
      error: "Name can only contain letters, spaces, hyphens, and apostrophes.",
    }),
  email: z.string().email({ error: "Please enter a valid email address." }),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true; // Allow empty/undefined
        if (val.length < 9) return false; // Must be at least 9 if provided
        if (val.length > 20) return false; // Must be less than 20 if provided
        return /^[+]?[\d\s\-\(\)]+$/.test(val); // Must match regex if provided
      },
      {
        message:
          "Phone number must be at least 9 digits and less than 20 characters if provided.",
      }
    ),
  message: z
    .string()
    .min(10, { error: "Message must be at least 10 characters." })
    .max(500, { error: "Message must be less than 500 characters." }),
  // Honeypot field for spam protection
  botcheck: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      botcheck: "",
    },
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare form data for Web3Forms
      const formData = new FormData();
      formData.append("access_key", WEB3FORMS_ACCESS_KEY);
      formData.append("name", values.name);
      formData.append("email", values.email);
      if (values.phone) {
        formData.append("phone", values.phone);
      }
      formData.append("message", values.message);
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
        throw new Error(result.message || "Form submission failed");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="w-full mx-auto p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-500"
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
          <h3 className="heading-4 text-white">Message Sent Successfully!</h3>
          <p className="body-text text-white/70">
            Thank you for contacting us. We&apos;ll get back to you soon.
          </p>
          <Button
            onClick={() => setIsSubmitted(false)}
            variant="secondary"
            className="mt-4"
          >
            Send Another Message
          </Button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="w-full mx-auto p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Error message display */}
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-red-500"
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
                  <p className="text-red-500 font-medium">{error}</p>
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

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">
                    Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your name"
                      {...field}
                      className="text-white dark:bg-black/20  dark:hover:bg-black/30 dark:focus:text-black dark:focus:bg-white dark:placeholder:text-white/50 transition-colors placeholder:text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">
                    Email <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                      className="text-white dark:bg-black/20  dark:hover:bg-black/30 dark:focus:text-black dark:focus:bg-white dark:placeholder:text-white/50 transition-colors placeholder:text-xs"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">
                    Phone Number{" "}
                    <span className="text-white/30 text-xs">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Enter your phone number"
                      {...field}
                      className="text-white dark:bg-black/20  dark:hover:bg-black/30 dark:focus:text-black dark:focus:bg-white dark:placeholder:text-white/50 transition-colors placeholder:text-xs"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80 ">
                    Message <span className="text-red-500 text-xs">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your message"
                      rows={4}
                      {...field}
                      className="text-white dark:bg-black/20  dark:hover:bg-black/30 dark:focus:text-black dark:focus:bg-white dark:placeholder:text-white/50 transition-colors placeholder:text-xs"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <p className="text-xs text-white/40 text-left"> * required</p>

            <Button type="submit" variant="default" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Submit"}
            </Button>
          </form>
        </Form>
      </div>
    );
  }
}
