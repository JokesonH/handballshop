"use client";

import { useEffect } from "react";
import { useCart } from "@/components/CartProvider";

/**
 * Empties the cart once the customer lands on the confirmation page.
 *
 * Deliberately client-side and fire-and-forget: the order is already paid
 * for and handed to Gelato by the webhook, so this is only tidying up the
 * browser's copy.
 */
export default function ClearCartOnMount() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
