import type { MetadataRoute } from "next";
import { getCategories, getProducts, getSite, productHref } from "@/lib/catalog";
import { locales } from "@/lib/locales";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSite();
  const base = `https://${site.domain}`;
  const categories = getCategories();
  const products = getProducts();

  const staticPaths = ["", "/merch", "/fund", "/clubs"];

  return locales.flatMap((locale) => [
    ...staticPaths.map((path) => ({
      url: `${base}/${locale}${path}`,
      lastModified: new Date(),
      priority: path === "" ? 1 : 0.8,
    })),
    ...categories.flatMap((category) => [
      {
        url: `${base}/${locale}/${category.slug}`,
        lastModified: new Date(),
        priority: 0.9,
      },
      ...category.children.map((child) => ({
        url: `${base}/${locale}/${category.slug}/${child.slug}`,
        lastModified: new Date(),
        priority: 0.7,
      })),
    ]),
    ...products.map((product) => ({
      url: `${base}${productHref(product, locale)}`,
      lastModified: new Date(),
      priority: 0.6,
    })),
  ]);
}
