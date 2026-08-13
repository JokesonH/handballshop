import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProsePage from "@/components/ProsePage";
import { getPage } from "@/lib/catalog";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/seo";

const SLUG = "faq";
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/faq">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const page = getPage(SLUG);
  return {
    title: page.title[locale],
    description: page.intro[locale],
    alternates: alternates(`/${SLUG}`),
  };
}

export default async function Page({ params }: PageProps<"/[locale]/faq">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typed = locale as Locale;
  return (
    <ProsePage
      page={getPage(SLUG)}
      dict={await getDictionary(typed)}
      locale={typed}
    />
  );
}
