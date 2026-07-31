import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LeadForm from "@/components/LeadForm";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import { getProducts, getSite } from "@/lib/catalog";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/merch">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: dict.merch.title,
    description: dict.merch.body,
    alternates: alternates("/merch"),
  };
}

export default async function MerchPage({
  params,
}: PageProps<"/[locale]/merch">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typed = locale as Locale;
  const dict = await getDictionary(typed);
  const site = getSite();
  const merch = getProducts("merch");

  return (
    <>
      <section className="bg-nc-resin text-nc-court-deep">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <p className="kicker">{dict.merch.kicker}</p>
          <h1 className="display-title mt-4 text-4xl sm:text-6xl">
            {site.merch.brand}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed">
            {dict.merch.body}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16">
        {merch.length > 0 ? (
          <>
            <SectionHeading
              title={dict.merch.title}
              body={dict.merch.fundBadge}
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {merch.map((product) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  dict={dict}
                  locale={typed}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-xl border border-nc-line bg-white p-8 text-center">
            <p className="text-base leading-relaxed text-nc-slate">
              {dict.catalog.empty}
            </p>
            <div className="mt-6 text-left">
              <LeadForm
                compact
                formId={site.forms.newsletter}
                subject="Merch launch list"
                fields={[
                  {
                    name: "email",
                    label: dict.status.notifyPlaceholder,
                    type: "email",
                    required: true,
                  },
                ]}
                submitLabel={dict.status.notifyCta}
                sentLabel={dict.clubs.formSent}
                errorLabel={dict.clubs.formError}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
