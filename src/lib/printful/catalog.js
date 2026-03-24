import { products as referenceProducts } from "@/data/products";
import { roundUsd2 } from "@/lib/money";
import { printfulRequest, isPrintfulEnabled } from "@/lib/printful/client";
import { slugify } from "@/lib/slug";

const SHIPPING_INCLUDED_BY_DEFAULT =
  process.env.NEXT_PUBLIC_PRICES_INCLUDE_SHIPPING === "true";

function normalizeMedium(value) {
  const text = String(value || "").toLowerCase();
  if (text.includes("canvas")) return "Canvas";
  return "Print";
}

async function getVariantCatalogDetails(variantId) {
  if (!variantId) return null;
  try {
    const data = await printfulRequest(`/products/variant/${variantId}`);
    return data?.result ?? null;
  } catch {
    return null;
  }
}

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
    medium: normalizeMedium(p.medium),
    dimensions: p.dimensions,
    description: p.description,
    edition: p.edition ?? "Open edition",
    priceUsd: p.priceUsd,
    image: p.image,
    originalImage: p.originalImage ?? p.image,
    imageWidth: 1200,
    imageHeight: 1500,
    shippingIncluded: SHIPPING_INCLUDED_BY_DEFAULT,
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
    edition: ref.edition || item.edition,
    originalImage: ref.originalImage || item.originalImage,
    image: ref.image || item.image,
    imageWidth: item.imageWidth || 1200,
    imageHeight: item.imageHeight || 1500,
    shippingIncluded:
      typeof item.shippingIncluded === "boolean"
        ? item.shippingIncluded
        : SHIPPING_INCLUDED_BY_DEFAULT,
  };
}

function parsePrice(retailPrice) {
  const num = Number.parseFloat(String(retailPrice ?? ""));
  if (Number.isFinite(num)) return roundUsd2(num);
  return 0;
}

function pickPrimaryVariant(variants) {
  if (!Array.isArray(variants) || variants.length === 0) return null;
  const withPrice = variants.find((v) => parsePrice(v?.retail_price) > 0);
  return withPrice ?? variants[0];
}

function pickImage(sync, variant) {
  const files = Array.isArray(variant?.files) ? variant.files : [];
  const preferredFile =
    files.find((f) => f?.type === "default" && f?.preview_url) ||
    files.find((f) => f?.preview_url) ||
    null;
  const preview = preferredFile?.preview_url;
  if (preview) return preview;

  const thumb =
    files.find((f) => f?.type === "default" && f?.thumbnail_url)?.thumbnail_url ||
    files.find((f) => f?.thumbnail_url)?.thumbnail_url;
  if (thumb) return thumb;

  const fromSync = sync?.thumbnail_url || sync?.image;
  if (fromSync) return fromSync;

  if (variant?.image) return variant.image;

  return "";
}

function pickImageSize(variant) {
  const files = Array.isArray(variant?.files) ? variant.files : [];
  const withDims = files.find((f) => Number(f?.width) > 0 && Number(f?.height) > 0);
  if (withDims) {
    return {
      width: Number(withDims.width),
      height: Number(withDims.height),
    };
  }
  return { width: 1200, height: 1500 };
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

function toCatalogItem(detail, catalogDetails) {
  const sync = detail?.sync_product ?? {};
  const variants = Array.isArray(detail?.sync_variants) ? detail.sync_variants : [];
  const variant = pickPrimaryVariant(variants) ?? {};
  const parsed = splitArtistAndYear(sync.name);
  const title = parsed.title || sync.name || "Untitled";
  const slug = slugify(sync.external_id || title);
  const providerProduct = catalogDetails?.product ?? {};
  const providerVariant = catalogDetails?.variant ?? {};
  const imageSize = pickImageSize(variant);
  const providerMedium =
    providerProduct.type_name || providerProduct.title || variant.product?.name || sync.name;
  const normalizedMedium = normalizeMedium(providerMedium);
  const image = pickImage(sync, variant) || providerVariant.image || "";
  const providerDescription = providerProduct.description || "";
  const providerSize = providerVariant.size || variant.size || variant.name || "Selected variant";
  return {
    id: `pf-${sync.id}`,
    printfulProductId: sync.id,
    variantId: variant.id ?? null,
    catalogVariantId: variant.variant_id ?? null,
    externalId: sync.external_id ?? null,
    slug,
    title,
    artist: parsed.artist || "Studio",
    year: parsed.year || "",
    medium: normalizedMedium,
    dimensions: providerSize,
    description:
      providerDescription ||
      "This piece is fulfilled on demand and ships directly after order processing.",
    edition: "Open edition",
    priceUsd: parsePrice(variant.retail_price),
    image,
    originalImage: image,
    imageWidth: imageSize.width,
    imageHeight: imageSize.height,
    shippingIncluded: SHIPPING_INCLUDED_BY_DEFAULT,
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
    const catalogDetails = await Promise.all(
      details.map((d) => {
        const variants = Array.isArray(d?.result?.sync_variants)
          ? d.result.sync_variants
          : [];
        const primary = pickPrimaryVariant(variants);
        return getVariantCatalogDetails(primary?.variant_id);
      }),
    );
    const mapped = details
      .map((d, i) => ({ detail: d?.result, catalog: catalogDetails[i] }))
      .filter((x) => x.detail)
      .map(({ detail, catalog }) => toCatalogItem(detail, catalog))
      .filter(Boolean)
      .filter((p) => p.variantId && p.priceUsd > 0);
    return mapped;
  } catch {
    return fallbackFromReference();
  }
}

export async function getCatalogProductBySlug(slug) {
  const products = await getCatalogProducts();
  return products.find((p) => p.slug === slug) ?? null;
}
