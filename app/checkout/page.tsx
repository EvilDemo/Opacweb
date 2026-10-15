import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCartAction } from "@/lib/shopify/actions";

// Checkout depends on the visitor's cart cookie and must be resolved per request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout | Opac Shop",
  description: "Complete your purchase",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CheckoutPage() {
  const { cart, error } = await getCartAction();
  if (error) redirect("/cart");
  if (!cart || cart.lines.length === 0 || !cart.checkoutUrl) redirect("/shop");
  redirect(cart.checkoutUrl);
}

