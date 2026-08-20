import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Gelato -> us: order status, item status, tracking codes, delivery estimates.
 *
 * The other direction from app/api/webhooks/stripe. That route is Stripe
 * telling us a payment succeeded, so we tell Gelato to print
 * (app/api/checkout, lib/gelato.ts createGelatoOrder). This route is Gelato
 * telling us what happened to something already in production.
 *
 * Gelato's webhook system has no HMAC signing — no signing secret, no
 * signature header, confirmed against their own docs. Unlike the Stripe
 * webhook, which is verified cryptographically, anyone who finds this URL
 * could POST fake events to it. The mitigation is the one thing available
 * without a signature: a long random token lives in the URL itself, checked
 * with a constant-time comparison so response-time doesn't leak how much of
 * it matched. Only Gelato's dashboard should ever be configured with the
 * full URL.
 *
 * Register the exact deployed URL (with the real token) as the webhook
 * endpoint in the Gelato dashboard — API Portal -> Webhooks. Generate
 * GELATO_WEBHOOK_TOKEN with:
 *   node -e "console.log(require('crypto').randomUUID()+require('crypto').randomUUID().replace(/-/g,''))"
 */
function validToken(candidate: string): boolean {
  const expected = process.env.GELATO_WEBHOOK_TOKEN;
  if (!expected) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false; // timingSafeEqual throws on mismatch
  return timingSafeEqual(a, b);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  if (!validToken(token)) {
    // 404, not 401/403 — don't confirm to a prober that they're close.
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  /**
   * No database yet (see docs/commerce.md), so today this is a structured
   * log line, not a state change — enough to see what's happening to an
   * order in the Vercel log stream. It's the seam to build on once there's
   * somewhere to persist delivery state: e.g. emailing the customer their
   * tracking code without risking sending it twice on a retried webhook.
   */
  switch (body.event) {
    case "order_status_updated":
      console.log(`[gelato] order ${body.orderReferenceId} -> ${body.fulfillmentStatus}`);
      break;
    case "order_item_status_updated":
      console.log(
        `[gelato] item ${body.itemReferenceId} (order ${body.orderReferenceId}) -> ${body.status}` +
          (body.comment ? ` (${body.comment})` : "")
      );
      break;
    case "order_item_tracking_code_updated":
      console.log(
        `[gelato] tracking for item ${body.itemReferenceId} (order ${body.orderReferenceId}): ` +
          `${body.trackingCode} -> ${body.trackingUrl}`
      );
      break;
    case "order_delivery_estimate_updated":
      console.log(
        `[gelato] delivery estimate for order ${body.orderReferenceId}: ` +
          `${body.minDeliveryDate} - ${body.maxDeliveryDate}`
      );
      break;
    default:
      // store_product_* fires for Gelato's own storefront/e-commerce
      // integration, which this project doesn't use — orders go straight
      // through the Order API, so storeId is always null on our orders.
      // Logged in case that assumption ever changes.
      console.log(`[gelato] unhandled event: ${body.event}`);
  }

  // Gelato ignores response content and retries 3x/5s on anything but 2xx.
  return NextResponse.json({ received: true });
}
