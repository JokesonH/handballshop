import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LeadForm from "@/components/LeadForm";
import { getSite } from "@/lib/catalog";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/clubs">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: dict.clubs.title,
    description: dict.clubs.body,
    alternates: alternates("/clubs"),
  };
}

export default async function ClubsPage({
  params,
}: PageProps<"/[locale]/clubs">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typed = locale as Locale;
  const dict = await getDictionary(typed);
  const site = getSite();

  return (
    <>
      <section className="bg-nc-court text-nc-paper">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <p className="kicker text-nc-resin">{dict.clubs.kicker}</p>
          <h1 className="display-title mt-4 max-w-3xl text-4xl sm:text-5xl">
            {dict.clubs.title}
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-4 py-16">
        <p className="text-base leading-relaxed text-nc-slate">
          {dict.clubs.body}
        </p>

        <div className="mt-10 border border-nc-line bg-white p-6">
          <LeadForm
            formId={site.forms.clubEnquiry}
            subject="Club enquiry"
            fields={[
              { name: "name", label: dict.clubs.formName, required: true },
              { name: "organisation", label: dict.clubs.formClub, required: true },
              {
                name: "email",
                label: dict.clubs.formEmail,
                type: "email",
                required: true,
              },
              { name: "province", label: dict.clubs.formProvince, required: true },
              {
                name: "needs",
                label: dict.clubs.formNeed,
                type: "textarea",
                required: true,
              },
            ]}
            submitLabel={dict.clubs.formSubmit}
            sentLabel={dict.clubs.formSent}
            errorLabel={dict.clubs.formError}
          />
        </div>
      </div>
    </>
  );
}
