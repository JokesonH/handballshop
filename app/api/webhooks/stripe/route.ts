import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { decodeCart, resolveCart } from "@/lib/cart";
import { createGelatoOrder, resolveProductUid, type GelatoOrderItem } from "@/lib/gelato";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/**
 * Stripe -> Gelato. The only place an order is actually sent to production.
 *
 * Two things this must never do:
 *   1. Trust an unsigned request. Anyone can POST here, so the signature
 *      check is what separates a real payment from a forged one.
 *   2. Print the same order twice. Stripe retries on any non-2xx and can
 *      deliver an event more than once, so we record Gelato's order id on
 *      the PaymentIntent and bail if it's already there.
 *
 * There is no database in this project, so the PaymentIntent *is* the order
 * record. That's a deliberate trade — see docs/commerce.md for what it costs.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "unsigned" }, { status: 400 });

  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, signature, secret);
  } catch (error) {
    console.error("[stripe-webhook] bad signature", error);
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  try {
    if (session.payment_status !== "paid") {
      // Async payment methods complete later; nothing to produce yet.
      return NextResponse.json({ received: true, skipped: "unpaid" });
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;
    if (!paymentIntentId) throw new Error("session has no payment_intent");

    const intent = await stripe().paymentIntents.retrieve(paymentIntentId);
    if (intent.metadata?.gelatoOrderId) {
      return NextResponse.json({
        received: true,
        skipped: "already-produced",
        gelatoOrderId: intent.metadata.gelatoOrderId,
      });
    }

    const encoded = session.metadata?.cart;
    if (!encoded) throw new Error("session metadata has no cart");

    // Re-resolve rather than trusting the line items Stripe echoes back:
    // this is the same server-side pricing path used at checkout.
    const cart = resolveCart(decodeCart(encoded));
    const origin = request.nextUrl.origin;

    const items: GelatoOrderItem[] = cart.lines.map((line, i) => {
      const printFiles = line.product.printFiles ?? {};
      const areas = Object.keys(printFiles);
      if (areas.length === 0) {
        // Belt and suspenders: checkout already refuses this case, but the
        // webhook must never send Gelato a request with zero files rather
        // than fail loudly — that would produce a blank shirt, charged.
        throw new Error(`${line.product.slug} has no print files configured`);
      }
      return {
        itemReferenceId: `${session.id}-${i}`,
        productUid: resolveProductUid(line.product.gelatoGarment ?? "tee", line.size),
        quantity: line.qty,
        // One entry per print area (front, back, ...). The "type" value
        // must match the print area name Gelato's product actually uses —
        // see content/gelato.json's _todo for where that comes from.
        files: areas.map((area) => ({
          type: area,
          url: `${origin}${printFiles[area]}`,
        })),
      };
    });

    const shipping = session.collected_information?.shipping_details;
    const address = shipping?.address;
    if (!address) throw new Error("session has no shipping address");

    const [firstName, ...rest] = (shipping?.name ?? "").trim().split(" ");

    const order = await createGelatoOrder({
      // "draft" lands in Gelato as a reviewable order that is NOT sent to
      // production or billed until someone approves it in the dashboard —
      // set GELATO_DRAFT_MODE=true while proving out the pipeline so a test
      // checkout can't accidentally print and ship a real garment. Flip it
      // back off (or unset it) once a draft has been checked and approved
      // manually, so real customer orders go straight to production again.
      orderType: process.env.GELATO_DRAFT_MODE === "true" ? "draft" : "order",
      // Stripe's session id doubles as our idempotency key on Gelato's side.
      orderReferenceId: session.id,
      customerReferenceId: session.customer_details?.email ?? session.id,
      currency: cart.currency,
      items,
      shippingAddress: {
        firstName: firstName || "Customer",
        lastName: rest.join(" ") || "-",
        addressLine1: address.line1 ?? "",
        addressLine2: address.line2 ?? undefined,
        city: address.city ?? "",
        postCode: address.postal_code ?? "",
        state: address.state ?? undefined,
        country: address.country ?? "CA",
        email: session.customer_details?.email ?? "",
        phone: session.customer_details?.phone ?? undefined,
      },
    });

    await stripe().paymentIntents.update(paymentIntentId, {
      metadata: { ...intent.metadata, gelatoOrderId: order.id },
    });

    console.log(`[stripe-webhook] gelato order ${order.id} for ${session.id}`);
    return NextResponse.json({ received: true, gelatoOrderId: order.id });
  } catch (error) {
    // Return 500 so Stripe retries. The customer has paid; a failure here is
    // recoverable and must not be silently swallowed.
    console.error(`[stripe-webhook] FAILED for session ${session.id}`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "failed" },
      { status: 500 }
    );
  }
}
