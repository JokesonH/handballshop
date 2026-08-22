import fs from "node:fs";
import path from "node:path";

/**
 * Gelato print-and-fulfil client.
 *
 * Gelato prints and ships; it never touches money. Payment is Stripe's job,
 * and an order only reaches Gelato after Stripe confirms the charge — see
 * app/api/webhooks/stripe/route.ts.
 */

const API = "https://order.gelatoapis.com/v4/orders";

export type GelatoConfig = {
  garments: Record<string, { label: string; uidBySize: Record<string, string | null> }>;
  shipping: Record<string, { amountCents: number; label: string }>;
};

export function getGelatoConfig(): GelatoConfig {
  const raw = fs.readFileSync(
    path.join(process.cwd(), "content", "gelato.json"),
    "utf8"
  );
  return JSON.parse(raw) as GelatoConfig;
}

/**
 * Resolve one (garment, size) to a Gelato product UID.
 *
 * Throws when the UID hasn't been filled in yet. That is deliberate: a
 * placeholder UID would be accepted by our own code and then rejected — or
 * worse, misinterpreted — at Gelato's end, after the customer has already
 * been charged. Failing here surfaces it while the money is still refundable.
 */
export function resolveProductUid(garmentId: string, size: string): string {
  const config = getGelatoConfig();
  const garment = config.garments[garmentId];
  if (!garment) {
    throw new Error(`Unknown garment "${garmentId}" — add it to content/gelato.json`);
  }
  const uid = garment.uidBySize[size];
  if (!uid) {
    throw new Error(
      `No Gelato product UID for ${garmentId}/${size}. Fill uidBySize in ` +
        `content/gelato.json from Gelato's catalog before taking orders.`
    );
  }
  return uid;
}

export type GelatoOrderItem = {
  itemReferenceId: string;
  productUid: string;
  quantity: number;
  // "type" is the Gelato print-area name for this garment (e.g. "Front",
  // "Back", "Left sleeve") — whatever the product's own placements are called.
  files: { type: string; url: string }[];
};

export type GelatoAddress = {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postCode: string;
  state?: string;
  country: string;
  email: string;
  phone?: string;
};

export type GelatoOrder = {
  orderType: "order" | "draft";
  orderReferenceId: string;
  customerReferenceId: string;
  currency: string;
  items: GelatoOrderItem[];
  shippingAddress: GelatoAddress;
};

export async function createGelatoOrder(
  order: GelatoOrder
): Promise<{ id: string; fulfillmentStatus?: string }> {
  const key = process.env.GELATO_API_KEY;
  if (!key) throw new Error("GELATO_API_KEY is not set");

  const response = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-KEY": key },
    body: JSON.stringify(order),
  });

  const text = await response.text();
  if (!response.ok) {
    // Surface Gelato's own message — its validation errors name the offending
    // field, which is most of the debugging.
    throw new Error(`Gelato ${response.status}: ${text.slice(0, 800)}`);
  }
  return JSON.parse(text);
}
