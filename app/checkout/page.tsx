import { Metadata } from "next";
import { CheckoutForm } from "@/components/commerce/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout | Opac Shop",
  description: "Complete your purchase",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return (
    <section className="bg-black text-white min-h-[calc(100vh-6rem)]">
      <CheckoutForm />
    </section>
  );
}

