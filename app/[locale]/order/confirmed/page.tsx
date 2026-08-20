import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ClearCartOnMount from "@/components/ClearCartOnMount";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/order/confirmed">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: "Order confirmed",
    alternates: alternates("/order/confirmed"),
    robots: { index: false, follow: false },
  };
}

export default async function ConfirmedPage({
  params,
}: PageProps<"/[locale]/order/confirmed">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typed = locale as Locale;
  const dict = await getDictionary(typed);

  const copy =
    typed === "fr"
      ? {
          title: "Merci — commande confirmée",
          body: "Votre commande est en production. Vous recevrez un courriel de confirmation, puis un suivi dès l'expédition. Comptez de 5 à 9 jours ouvrables pour l'impression, puis le délai de livraison.",
        }
      : {
          title: "Thank you — order confirmed",
          body: "Your order is going into production. You'll get a confirmation email, then tracking once it ships. Expect 5–9 business days to print, plus transit.",
        };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-16">
      <ClearCartOnMount />
      <div className="plate max-w-2xl p-8">
        <p className="code text-resin-deep">✓</p>
        <h1 className="display mt-3 text-3xl uppercase leading-none sm:text-5xl">
          {copy.title}
        </h1>
        <p className="mt-4 leading-relaxed text-ink-soft">{copy.body}</p>
        <Link
          href={`/${typed}/tops`}
          className="code mt-8 inline-block border border-ink px-4 py-2.5 hover:bg-ink hover:text-bone"
        >
          {dict.cart.continue}
        </Link>
      </div>
    </div>
  );
}
