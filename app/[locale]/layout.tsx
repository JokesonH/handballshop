import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Header, { type NavItem } from "@/components/Header";
import { categoryCode, getCategories, getSite } from "@/lib/catalog";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/seo";
import "../globals.css";

/* Northcourt brand sheet V.01: one family, Space Grotesk, everywhere —
   Bold for the wordmark/headlines, Medium for labels and body copy. */
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  weight: ["400", "500", "700"],
});

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  const site = getSite();
  return {
    metadataBase: new URL(`https://${site.domain}`),
    title: {
      default: `${site.brandName} — ${dict.meta.tagline}`,
      template: `%s | ${site.brandName}`,
    },
    description: dict.meta.description,
    // Per-page alternates are set in each route's generateMetadata via
    // lib/seo.ts — a single layout-level map would point every page at the
    // homepage. This one is correct only because the layout's own page is "/".
    alternates: alternates(""),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typed = locale as Locale;
  const dict = await getDictionary(typed);
  const site = getSite();
  const categories = getCategories();

  // Nav is derived from the taxonomy — adding a subcategory to
  // content/categories.json puts it in the menu with no component change.
  const categoryNav: NavItem[] = categories.map((category) => ({
    href: `/${locale}/${category.slug}`,
    label: category.name[typed],
    code: categoryCode(category),
    children: [
      {
        href: `/${locale}/${category.slug}`,
        label: `${dict.nav.all} ${category.name[typed].toLowerCase()}`,
      },
      ...category.children.map((child) => ({
        href: `/${locale}/${category.slug}/${child.slug}`,
        label: child.name[typed],
      })),
    ],
  }));

  return (
    <html lang={locale} className={grotesk.variable}>
      <body>
        <Header
          locale={typed}
          dict={dict}
          brandName={site.brandName}
          categoryNav={categoryNav}
        />
        <main>{children}</main>
        <Footer
          locale={typed}
          dict={dict}
          site={site}
          categories={categories}
        />
      </body>
    </html>
  );
}
