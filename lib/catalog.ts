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
  /**
   * Marketing collection. Orthogonal to category: a Canada-line hoodie and a
   * City Series hoodie are both tops/hoodies, so collections cannot be
   * modelled as categories without duplicating the taxonomy.
   */
  collection?: string;
  /**
   * Which entry in content/gelato.json garments this product is printed on.
   * Defaults to "tee" when absent.
   */
  gelatoGarment?: string;
  /**
   * Public path to the print-ready raster Gelato will fetch, e.g.
   * "/print/edmonton-back.png". Must be reachable over HTTP — Gelato pulls
   * it at production time, it is not uploaded.
   */
  printFile?: string;
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

export type Collection = {
  slug: string;
  order: number;
  name: Localized;
  tagline: Localized;
  intro: Localized;
};

export type ContentPage = {
  slug: string;
  title: Localized;
  intro: Localized;
  sections: { heading: Localized; body: Localized<string[]> }[];
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
    /** false hides every Fund surface and stops /fund being generated. */
    public: boolean;
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

/** Static prose pages — about, contact, policies, guides. */
export function getPage(slug: string): ContentPage {
  return readJson<ContentPage>(`pages/${slug}.json`);
}

export function getCollections(): Collection[] {
  return readJson<Collection[]>("collections.json").sort(
    (a, b) => a.order - b.order
  );
}

export function getCollection(slug: string): Collection | undefined {
  return getCollections().find((collection) => collection.slug === slug);
}

/** Every product tagged into a collection, across all categories. */
export function getProductsInCollection(slug: string): Product[] {
  return getProducts().filter((product) => product.collection === slug);
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
 * Catalogue part code — e.g. EQ·GN·0117.
 *
 * Derived, never stored: a stable hash of the slug means codes can't drift
 * out of sync with the content, and adding a product doesn't require picking
 * a number by hand. Purely presentational — nothing resolves by code.
 */
export function partCode(product: Product): string {
  const seg = (s: string) => s.replace(/[^a-z]/gi, "").slice(0, 2).toUpperCase();
  let hash = 0;
  for (let i = 0; i < product.slug.length; i++) {
    hash = (hash * 31 + product.slug.charCodeAt(i)) % 10000;
  }
  return `${seg(product.category)}·${seg(product.subcategory)}·${String(hash).padStart(4, "0")}`;
}

/** Same idea for a category index page. */
export function categoryCode(category: Category): string {
  return `§${String(category.order).padStart(2, "0")}`;
}

/** Canonical URL for a product. */
export function productHref(product: Product, locale: Locale): string {
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
