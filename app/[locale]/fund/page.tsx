import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSite } from "@/lib/catalog";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/fund">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: dict.fund.title,
    description: dict.fund.whyBody,
    alternates: alternates("/fund"),
  };
}

export default async function FundPage({ params }: PageProps<"/[locale]/fund">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typed = locale as Locale;
  const dict = await getDictionary(typed);
  const site = getSite();

  /*
    The stated basis is read from content/site.json, never hardcoded. Whatever
    is published here has to be what actually happens — Competition Act
    s.74.01 treats an unsubstantiated donation claim as deceptive marketing,
    and a vague "10% goes back to the sport" is exactly the claim that invites
    a complaint.
  */
  const basisCopy = {
    "merch-sales": dict.fund.basisMerch,
    "all-sales": dict.fund.basisAll,
    profit: dict.fund.basisProfit,
  }[site.fund.basis];

  const sections: { title: string; body: string }[] = [
    { title: dict.fund.whyTitle, body: dict.fund.whyBody },
    { title: dict.fund.howTitle, body: dict.fund.howBody },
    {
      title: dict.fund.transparencyTitle,
      body: dict.fund.transparencyBody,
    },
  ];

  return (
    <>
      <section className="bg-ink text-bone">
        <div className="mx-auto max-w-[1400px] px-4 py-24">
          <p className="code text-resin">{dict.fund.kicker}</p>
          <h1 className="display-title mt-4 max-w-3xl text-4xl sm:text-6xl">
            {site.fund.name[typed]}
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-bone/75">
            {site.fund.commitment[typed]}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-16">
        {/* The number, stated precisely */}
        <div className="border-l-4 border-resin bg-resin-wash p-6">
          <p className="code text-resin-deep">{dict.fund.basisLabel}</p>
          <p className="display-title mt-3 text-2xl text-ink">
            {basisCopy}
          </p>
        </div>

        {sections.map((section) => (
          <section key={section.title} className="mt-14">
            <h2 className="display-title text-2xl text-ink">
              {section.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              {section.body}
            </p>
          </section>
        ))}

        {/* Independence — the disclaimer that keeps this honest */}
        <section className="mt-14 border border-rule bg-white p-6">
          <h2 className="display-title text-xl text-ink">
            {dict.fund.independenceTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            {site.fund.partnerNote[typed]}
          </p>
        </section>
      </div>
    </>
  );
}
