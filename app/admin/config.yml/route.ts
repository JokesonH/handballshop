import { NextRequest, NextResponse } from "next/server";
import { dump } from "js-yaml";
import { getCategories } from "@/lib/catalog";

/**
 * Decap CMS reads its config from here instead of a static YAML file so two
 * things stay correct automatically instead of needing hand-maintenance:
 *
 *  - `base_url` matches whatever origin the admin panel is actually loaded
 *    from (production domain, or a Vercel preview URL) — no placeholder to
 *    remember to swap in content/site.json's style.
 *  - Each category's subcategory <select> options are pulled straight from
 *    content/categories.json, the same source of truth lib/catalog.ts reads.
 *    Add a subcategory there and it shows up in the CMS with no edit here,
 *    matching the promise the README makes for the site itself.
 *
 * See docs/cms-setup.md for the GitHub OAuth App this backend needs.
 */

const LOCALIZED_STRING = [
  { label: "English", name: "en", widget: "string" },
  { label: "Français", name: "fr", widget: "string" },
];

const LOCALIZED_TEXT_LIST = [
  { label: "English", name: "en", widget: "list", field: { label: "Paragraph", name: "paragraph", widget: "text" } },
  { label: "Français", name: "fr", widget: "list", field: { label: "Paragraph", name: "paragraph", widget: "text" } },
];

function productFields(categorySlug: string, subcategoryOptions: { label: string; value: string }[]) {
  return [
    { label: "Slug", name: "slug", widget: "string", hint: "Unique, kebab-case. Becomes part of the product URL and cannot be changed later without breaking links." },
    { label: "Category", name: "category", widget: "hidden", default: categorySlug },
    { label: "Subcategory", name: "subcategory", widget: "select", options: subcategoryOptions },
    { label: "Brand", name: "brand", widget: "string", required: false, hint: "Leave blank until a supplier deal exists." },
    { label: "Status", name: "status", widget: "select", options: ["available", "coming-soon", "enquire"] },
    { label: "Fulfillment", name: "fulfillment", widget: "select", options: ["stock", "pod", "freight"] },
    { label: "Price (cents CAD)", name: "price", widget: "number", required: false, hint: "Leave blank while status is coming-soon or enquire." },
    { label: "Compare-at price (cents CAD)", name: "compareAt", widget: "number", required: false },
    { label: "Gender", name: "gender", widget: "select", required: false, options: ["men", "women", "unisex", "youth"] },
    { label: "Sizes", name: "sizes", widget: "list", required: false, field: { label: "Size", name: "size", widget: "string" } },
    {
      label: "Colors", name: "colors", widget: "list", required: false,
      fields: [
        { label: "Name", name: "name", widget: "object", fields: LOCALIZED_STRING },
        { label: "Hex", name: "hex", widget: "string" },
      ],
    },
    { label: "Images", name: "images", widget: "list", required: false, field: { label: "Image", name: "image", widget: "image" } },
    { label: "Featured", name: "featured", widget: "boolean", default: false, required: false },
    { label: "Name", name: "name", widget: "object", fields: LOCALIZED_STRING },
    { label: "Summary", name: "summary", widget: "object", fields: LOCALIZED_STRING },
    { label: "Description", name: "description", widget: "object", fields: LOCALIZED_TEXT_LIST },
    {
      label: "Specs", name: "specs", widget: "list", required: false,
      fields: [
        { label: "Label", name: "label", widget: "object", fields: LOCALIZED_STRING },
        { label: "Value", name: "value", widget: "object", fields: LOCALIZED_STRING },
      ],
    },
    { label: "Internal TODO", name: "todo", widget: "text", required: false, hint: "Not shown on the site. Note what's blocking this listing (supplier deal, pricing, photography), and remove once resolved." },
  ];
}

export async function GET(request: NextRequest) {
  const categories = getCategories();

  const categoryCollections = categories.map((category) => ({
    name: `products_${category.slug}`,
    label: `Products — ${category.name.en}`,
    folder: `content/products/${category.slug}`,
    create: true,
    slug: "{{fields.slug}}",
    identifier_field: "slug",
    fields: productFields(
      category.slug,
      category.children.map((child) => ({ label: child.name.en, value: child.slug }))
    ),
  }));

  const settingsCollection = {
    name: "settings",
    label: "Site settings",
    editor: { preview: false },
    files: [
      {
        name: "site",
        label: "Site settings",
        file: "content/site.json",
        fields: [
          { label: "Brand name", name: "brandName", widget: "string" },
          { label: "Domain", name: "domain", widget: "string" },
          {
            label: "Merch", name: "merch", widget: "object",
            fields: [
              { label: "Brand", name: "brand", widget: "string" },
              { label: "Source", name: "source", widget: "select", options: ["pod", "stock"] },
              { label: "Shopify domain", name: "shopifyDomain", widget: "string", required: false },
              { label: "Storefront token", name: "storefrontToken", widget: "string", required: false },
            ],
          },
          {
            label: "Fund", name: "fund", widget: "object",
            fields: [
              { label: "Public", name: "public", widget: "boolean", hint: "Off hides every Fund surface (nav, footer, home section, /fund route) — see content/site.json's note on why it starts false." },
              { label: "Basis", name: "basis", widget: "select", options: ["merch-sales", "all-sales", "profit"] },
              { label: "Percent", name: "percent", widget: "number" },
              { label: "Name", name: "name", widget: "object", fields: LOCALIZED_STRING },
              { label: "Commitment", name: "commitment", widget: "object", fields: LOCALIZED_STRING },
              { label: "Partner", name: "partner", widget: "string", required: false },
              { label: "Partner note", name: "partnerNote", widget: "object", fields: LOCALIZED_STRING },
            ],
          },
          {
            label: "Contact", name: "contact", widget: "object",
            fields: [
              { label: "Email", name: "email", widget: "string", required: false },
              { label: "Phone", name: "phone", widget: "string", required: false },
              { label: "Address", name: "address", widget: "text", required: false },
            ],
          },
          {
            label: "Forms (Formspree IDs)", name: "forms", widget: "object",
            fields: [
              { label: "Club enquiry", name: "clubEnquiry", widget: "string", required: false },
              { label: "Freight quote", name: "freightQuote", widget: "string", required: false },
              { label: "Notify me", name: "notifyMe", widget: "string", required: false },
              { label: "Newsletter", name: "newsletter", widget: "string", required: false },
            ],
          },
          {
            label: "Social", name: "social", widget: "object",
            fields: [
              { label: "Instagram", name: "instagram", widget: "string", required: false },
              { label: "TikTok", name: "tiktok", widget: "string", required: false },
            ],
          },
        ],
      },
    ],
  };

  const config = {
    backend: {
      name: "github",
      repo: process.env.GITHUB_REPO ?? "JokesonH/handballshop",
      branch: process.env.GITHUB_BRANCH ?? "main",
      base_url: request.nextUrl.origin,
      auth_endpoint: "api/auth",
    },
    media_folder: "public/uploads",
    public_folder: "/uploads",
    collections: [settingsCollection, ...categoryCollections],
  };

  return new NextResponse(dump(config, { noRefs: true }), {
    headers: { "content-type": "text/yaml; charset=utf-8" },
  });
}
