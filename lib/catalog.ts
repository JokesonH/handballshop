import fs from "node:fs";
import path from "node:path";
import type { Locale } from "@/lib/locales";

const contentDir = path.join(process.cwd(), "content");

export type Localized<T = string> = Record<Locale, T>;

/**
 * Availability. This is what lets the catalogue go live before a single
 * supplier deal is signed — nothing has to pretend to be buyable.
 *   available   → show price, show buy/enquire action
 *   coming-soon → show "notify me" capture instead of a price
 *   enquire     → show quote request (freight items, bulk, custom)
 */
export type ProductStatus = "available" | "coming-soon" | "enquire";

/**
 * Who ships it. Drives which buy component renders, and is the seam that
 * keeps merch fulfilment swappable (pod → stock → headless) without a rebuild.
 *   stock   → we hold it, parcel ship
 *   pod     → print-on-demand, fulfilled by the merch partner
 *   freight → goals, frames, court packages; quoted per order
 */
export type Fulfillment = "stock" | "pod" | "freight";

export type Product = {
  slug: string;
  category: string;
  subcategory: string;
  brand: string | null;
  status: ProductStatus;
  fulfillment: Fulfillment;
  /** Cents CAD. null while status is coming-soon or enquire. */
  price: number | null;
  compareAt?: number | null;
  /** Facets — filtered on category pages, not separate routes. */
  gender?: "men" | "women" | "unisex" | "youth";
  sizes?: string[];
  colors?: { name: Localized; hex: string }[];
  images?: string[];
  featured?: boolean;
  name: Localized;
  summary: Localized;
  description: Localized<string[]>;
  specs?: { label: Localized; value: Localized }[];
  todo?: string;
};

export type CategoryChild = {
  slug: string;
  name: Localized;
};

export type Category = {
  slug: string;
  order: number;
  name: Localized;
  tagline: Localized;
  intro: Localized;
  /** "equipment/beach-courts" — related category promoted on the page. */
  crossLink?: string;
  children: CategoryChild[];
};

export type SiteConfig = {
  brandName: string;
  domain: string;
  merch: {
    brand: string;
    source: "pod" | "stock";
    shopifyDomain: string | null;
    storefrontToken: string | null;
  };
  fund: {
    basis: "merch-sales" | "all-sales" | "profit";
    percent: number;
    name: Localized;
    commitment: Localized;
    partner: string | null;
    partnerNote: Localized;
  };
  contact: {
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  forms: {
    clubEnquiry: string | null;
    freightQuote: string | null;
    notifyMe: string | null;
    newsletter: string | null;
  };
  social: { instagram: string | null; tiktok: string | null };
};

function readJson<T>(relativePath: string): T {
  const raw = fs.readFileSync(path.join(contentDir, relativePath), "utf8");
  return JSON.parse(raw) as T;
}

export function getSite(): SiteConfig {
  return readJson<SiteConfig>("site.json");
}

export function getCategories(): Category[] {
  return readJson<Category[]>("categories.json").sort(
    (a, b) => a.order - b.order
  );
}

export function getCategory(slug: string): Category | undefined {
  return getCategories().find((category) => category.slug === slug);
}

export function getSubcategory(
  categorySlug: string,
  subSlug: string
): CategoryChild | undefined {
  return getCategory(categorySlug)?.children.find(
    (child) => child.slug === subSlug
  );
}

/**
 * Products live at content/products/<category>/<slug>.json. A missing
 * category directory is not an error — it just means nothing is listed there
 * yet, which is the normal state for most of the catalogue right now.
 */
export function getProducts(categorySlug?: string): Product[] {
  const root = path.join(contentDir, "products");
  if (!fs.existsSync(root)) return [];

  const dirs = categorySlug
    ? [categorySlug]
    : fs
        .readdirSync(root, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);

  return dirs.flatMap((dir) => {
    const dirPath = path.join(root, dir);
    if (!fs.existsSync(dirPath)) return [];
    return fs
      .readdirSync(dirPath)
      .filter((file) => file.endsWith(".json"))
      .map((file) => readJson<Product>(path.join("products", dir, file)));
  });
}

export function getProduct(
  categorySlug: string,
  slug: string
): Product | undefined {
  return getProducts(categorySlug).find((product) => product.slug === slug);
}

export function getProductsInSubcategory(
  categorySlug: string,
  subSlug: string
): Product[] {
  return getProducts(categorySlug).filter(
    (product) => product.subcategory === subSlug
  );
}

export function getFeaturedProducts(limit = 8): Product[] {
  return getProducts()
    .filter((product) => product.featured)
    .slice(0, limit);
}

/**
 * Canonical URL for a product.
 *
 * Merch sits outside the supplier taxonomy — it is our own line, not a
 * category of gear — so it gets a flat /merch/<slug> path instead of the
 * three-level /category/subcategory/slug the catalogue uses.
 */
export function productHref(product: Product, locale: Locale): string {
  if (product.category === "merch") return `/${locale}/merch/${product.slug}`;
  return `/${locale}/${product.category}/${product.subcategory}/${product.slug}`;
}

/** Brands present in the catalogue, for brand filters and footer links. */
export function getBrands(): string[] {
  return [
    ...new Set(
      getProducts()
        .map((product) => product.brand)
        .filter((brand): brand is string => Boolean(brand))
    ),
  ].sort();
}
