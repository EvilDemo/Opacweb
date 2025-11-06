"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Price } from "./Price";
import type { Cart } from "@/types/commerce";

export function CheckoutForm() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    province: "",
    zip: "",
    country: "",
    phone: "",
  });

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch("/api/cart");
        const data = await response.json();
        setCart(data.cart);
        if (!data.cart) {
          router.push("/shop");
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart) return;

    setSubmitting(true);

    try {
      // Redirect to Shopify checkout
      // Shopify will handle the rest of the checkout process
      if (cart.checkoutUrl) {
        window.location.href = cart.checkoutUrl;
      } else {
        throw new Error("Checkout URL not available");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("Failed to proceed to checkout. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="body-text text-neutral-400">Loading...</p>
      </div>
    );
  }

  if (!cart || cart.lines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="body-text-lg text-neutral-400">Your cart is empty</p>
        <Button variant="secondary" asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto padding-global py-16">
      <h1 className="heading-1 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="heading-3 mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="body-text-sm-md text-white mb-2 block">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="bg-neutral-900 border-neutral-800 text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="heading-3 mb-4">Shipping Address</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="body-text-sm-md text-white mb-2 block">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="John"
                    className="bg-neutral-900 border-neutral-800 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="body-text-sm-md text-white mb-2 block">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Doe"
                    className="bg-neutral-900 border-neutral-800 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="body-text-sm-md text-white mb-2 block">
                  Address
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St"
                  className="bg-neutral-900 border-neutral-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="body-text-sm-md text-white mb-2 block">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="New York"
                    className="bg-neutral-900 border-neutral-800 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="zip" className="body-text-sm-md text-white mb-2 block">
                    ZIP Code
                  </Label>
                  <Input
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    placeholder="10001"
                    className="bg-neutral-900 border-neutral-800 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="country" className="body-text-sm-md text-white mb-2 block">
                  Country
                </Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="United States"
                  className="bg-neutral-900 border-neutral-800 text-white"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="body-text-sm-md text-white mb-2 block">
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="bg-neutral-900 border-neutral-800 text-white"
                />
              </div>
            </div>
          </div>

          <Button type="submit" variant="default" className="w-full" disabled={submitting}>
            {submitting ? "Processing..." : "Continue to Payment"}
          </Button>

          <p className="body-text-sm text-neutral-400">
            You will complete payment on Shopify&apos;s secure checkout page. We do not store payment
            information.
          </p>
        </form>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800 space-y-6">
            <h2 className="heading-3">Order Summary</h2>

            <div className="space-y-4">
              {cart.lines.map((line) => (
                <div key={line.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="body-text-sm-md text-white">{line.merchandise.title}</p>
                    <p className="body-text-sm text-neutral-400">Quantity: {line.quantity}</p>
                  </div>
                  <Price
                    price={line.cost.totalAmount.amount}
                    currencyCode={line.cost.totalAmount.currencyCode}
                    size="sm"
                  />
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-800 pt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="body-text text-neutral-400">Subtotal</span>
                <Price
                  price={cart.cost.subtotalAmount.amount}
                  currencyCode={cart.cost.subtotalAmount.currencyCode}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="body-text-lg text-white font-semibold">Total</span>
                <Price
                  price={cart.cost.totalAmount.amount}
                  currencyCode={cart.cost.totalAmount.currencyCode}
                  size="lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

