import { Metadata } from "next";
import { CartPageClient } from "@/components/commerce/CartPageClient";

export const metadata: Metadata = {
  title: "Cart | Opac Shop",
  description: "Review your shopping cart items",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {
  return (
    <section className="bg-black text-white min-h-[calc(100vh-6rem)]">
      <CartPageClient />
    </section>
  );
}
