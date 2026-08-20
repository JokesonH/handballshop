import { getProducts, type Product } from "@/lib/catalog";

/**
 * A cart line as the browser stores it.
 *
 * Deliberately carries no price. The client is not a source of truth about
 * money — resolveCart() recomputes every amount from content/products on the
 * server, so a tampered localStorage can only ever produce a wrong quantity
 * or an invalid line, never a wrong price.
 */
export type CartLine = {
  slug: string;
  size: string;
  qty: number;
};

export type ResolvedLine = {
  product: Product;
  size: string;
  qty: number;
  unitCents: number;
  lineCents: number;
};

export type ResolvedCart = {
  lines: ResolvedLine[];
  subtotalCents: number;
  currency: string;
};

export const MAX_QTY_PER_LINE = 10;

export class CartError extends Error {}

/** Compact wire format for Stripe session metadata, which caps values at 500 chars. */
export function encodeCart(lines: CartLine[]): string {
  return JSON.stringify(lines.map((l) => [l.slug, l.size, l.qty]));
}

export function decodeCart(encoded: string): CartLine[] {
  const parsed: unknown = JSON.parse(encoded);
  if (!Array.isArray(parsed)) throw new CartError("Malformed cart");
  return parsed.map((entry) => {
    if (!Array.isArray(entry) || entry.length !== 3) {
      throw new CartError("Malformed cart line");
    }
    const [slug, size, qty] = entry as [unknown, unknown, unknown];
    if (typeof slug !== "string" || typeof size !== "string" || typeof qty !== "number") {
      throw new CartError("Malformed cart line");
    }
    return { slug, size, qty };
  });
}

/**
 * Turn browser-supplied lines into priced lines, or refuse.
 *
 * Every rejection here is a case where charging the customer would be wrong:
 * a product that no longer exists, one that isn't for sale, a size we don't
 * print, or a quantity outside what print-on-demand should accept in one go.
 */
export function resolveCart(lines: CartLine[], currency = "CAD"): ResolvedCart {
  if (lines.length === 0) throw new CartError("Cart is empty");
  if (lines.length > 20) throw new CartError("Too many distinct items");

  const catalogue = getProducts();
  const resolved: ResolvedLine[] = lines.map((line) => {
    const product = catalogue.find((p) => p.slug === line.slug);
    if (!product) throw new CartError(`Unknown product: ${line.slug}`);
    if (product.status !== "available") {
      throw new CartError(`${product.slug} is not for sale`);
    }
    if (product.fulfillment !== "pod") {
      throw new CartError(`${product.slug} is not print-on-demand`);
    }
    if (typeof product.price !== "number" || product.price <= 0) {
      throw new CartError(`${product.slug} has no price`);
    }
    if (!product.sizes?.includes(line.size)) {
      throw new CartError(`${product.slug} has no size ${line.size}`);
    }
    const qty = Math.floor(line.qty);
    if (!Number.isFinite(qty) || qty < 1 || qty > MAX_QTY_PER_LINE) {
      throw new CartError(`Invalid quantity for ${product.slug}`);
    }
    return {
      product,
      size: line.size,
      qty,
      unitCents: product.price,
      lineCents: product.price * qty,
    };
  });

  return {
    lines: resolved,
    subtotalCents: resolved.reduce((sum, l) => sum + l.lineCents, 0),
    currency,
  };
}
