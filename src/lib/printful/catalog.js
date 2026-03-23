import { products as referenceProducts } from "@/data/products";
import { printfulRequest, isPrintfulEnabled } from "@/lib/printful/client";
import { slugify } from "@/lib/slug";

function fallbackFromReference() {
  return referenceProducts.map((p) => ({
    id: p.id,
    printfulProductId: null,
    variantId: p.printfulVariantId ?? null,
    externalId: null,
    slug: p.slug,
    title: p.title,
    artist: p.artist,
    year: p.year,
    medium: p.medium,
    dimensions: p.dimensions,
    description: p.description,
    edition: p.edition ?? "Open edition",
    priceUsd: p.priceUsd,
    image: p.image,
    originalImage: p.originalImage ?? p.image,
    sku: null,
  }));
}

function enrichWithReference(item) {
  const byVariant = referenceProducts.find(
    (p) => p.printfulVariantId && p.printfulVariantId === item.variantId,
  );
  const bySlug = referenceProducts.find((p) => p.slug === item.slug);
  const byTitle = referenceProducts.find(
    (p) => p.title?.toLowerCase() === item.title?.toLowerCase(),
  );
  const ref = byVariant ?? bySlug ?? byTitle;
  if (!ref) return item;
  return {
    ...item,
    slug: ref.slug || item.slug,
    artist: ref.artist || item.artist,
    year: ref.year || item.year,
    medium: ref.medium || item.medium,
    dimensions: ref.dimensions || item.dimensions,
    description: ref.description || item.description,
    edition: ref.edition || item.edition,
    originalImage: ref.originalImage || item.originalImage,
    image: ref.image || item.image,
  };
}

function parsePrice(retailPrice) {
  const num = Number.parseFloat(String(retailPrice ?? ""));
  if (Number.isFinite(num)) return num;
  return 0;
}

function splitArtistAndYear(name) {
  // Expected common format: "Title - Artist - Year"
  const parts = String(name || "")
    .split(" - ")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 3) {
    return {
      title: parts[0],
      artist: parts[1],
      year: parts.slice(2).join(" - "),
    };
  }
  return { title: name, artist: "Studio", year: "" };
}

function toCatalogItem(detail) {
  const sync = detail?.sync_product ?? {};
  const variants = Array.isArray(detail?.sync_variants) ? detail.sync_variants : [];
  const variant = variants[0] ?? {};
  const parsed = splitArtistAndYear(sync.name);
  const title = parsed.title || sync.name || "Untitled";
  const slug = slugify(sync.external_id || title);
  const image = sync.thumbnail_url || sync.image || "";
  return {
    id: `pf-${sync.id}`,
    printfulProductId: sync.id,
    variantId: variant.id ?? null,
    externalId: sync.external_id ?? null,
    slug,
    title,
    artist: parsed.artist || "Studio",
    year: parsed.year || "",
    medium: "Print on demand",
    dimensions: variant.name || "Selected variant",
    description:
      "This piece is fulfilled on demand through Printful and ships directly after order processing.",
    edition: "Open edition",
    priceUsd: parsePrice(variant.retail_price),
    image,
    originalImage: image,
    sku: variant.sku ?? null,
  };
}

export async function getCatalogProducts() {
  if (!isPrintfulEnabled()) {
    return fallbackFromReference();
  }

  try {
    const list = await printfulRequest("/store/products?limit=100");
    const products = Array.isArray(list?.result) ? list.result : [];
    const details = await Promise.all(
      products.map((p) => printfulRequest(`/store/products/${p.id}`)),
    );
    const mapped = details
      .map((d) => d?.result)
      .filter(Boolean)
      .map(toCatalogItem)
      .filter((p) => p.variantId && p.priceUsd > 0 && p.image);
    return mapped.map(enrichWithReference);
  } catch {
    return fallbackFromReference();
  }
}

export async function getCatalogProductBySlug(slug) {
  const products = await getCatalogProducts();
  return products.find((p) => p.slug === slug) ?? null;
}
