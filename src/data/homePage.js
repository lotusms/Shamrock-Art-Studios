const ASPECT_PRESET_CLASS = {
  portrait: "aspect-[4/5]",
  landscape: "aspect-[16/10]",
  square: "aspect-square",
  ultrawide: "aspect-[21/9]",
};

/** @param {{ aspect?: string }} work */
export function featuredAspectClass(work) {
  const a = work.aspect;
  if (!a) return "aspect-[4/5]";
  if (a.startsWith("aspect-")) return a;
  return ASPECT_PRESET_CLASS[a] ?? "aspect-[4/5]";
}

/**
 * Image height ÷ width for masonry column balancing (same idea as the shop catalog).
 * @param {{ aspect?: string }} work
 */
export function featuredImageHeightOverWidth(work) {
  const cls = featuredAspectClass(work);
  const m = cls.match(/^aspect-\[(\d+)\/(\d+)\]$/);
  if (m) {
    const aw = Number(m[1]);
    const ah = Number(m[2]);
    if (aw > 0 && ah > 0) return ah / aw;
  }
  if (cls === "aspect-square") return 1;
  return 5 / 4;
}

/** @param {{ artist: string; size?: string; year?: string }} work */
export function featuredWorkSubtitle(work) {
  const tail = work.size ?? work.year;
  return tail ? `${work.artist} • ${tail}` : work.artist;
}

export const featuredWorks = [
  {
    title: "Lady in the Field",
    artist: "Jaslene Perez",
    medium: "Canvas",
    size: '24"×36"',
    image:
      "https://firebasestorage.googleapis.com/v0/b/shamrockartstudio.firebasestorage.app/o/lady%20in%20the%20field.png?alt=media&token=1c60943e-3381-461a-844c-b6b25ea35ce8",
    aspect: "portrait",
    layout: "md:col-span-7 md:row-span-2",
  },
  {
    title: "Silent Sacrifice",
    artist: "Jaslene Perez",
    medium: "Canvas",
    size: '24"×32"',
    image:
      "https://firebasestorage.googleapis.com/v0/b/shamrockartstudio.firebasestorage.app/o/SilentSacrifice.png?alt=media&token=3d90eea9-c12c-4f68-b5ef-bb19f8ca06b9",
    aspect: "landscape",
    layout: "md:col-span-7 md:row-span-2",
  },
  {
    title: "Dawn In Wildflowers",
    artist: "Jaslene Perez",
    medium: "Canvas",
    size: '24"×32"',
    image:
      "https://firebasestorage.googleapis.com/v0/b/shamrockartstudio.firebasestorage.app/o/Dawn%20In%20Wildflowers.png?alt=media&token=6a441787-10be-4ba2-9070-239d1ad5923f",
    aspect: "landscape",
    layout: "md:col-span-7 md:row-span-2",
  },
  {
    title: "La Armada",
    artist: "Jaslene Perez",
    medium: "Canvas",
    size: '24"×32"',
    image:
      "https://firebasestorage.googleapis.com/v0/b/shamrockartstudio.firebasestorage.app/o/La%20Armada.png?alt=media&token=efa24bfa-2e74-4533-ae4a-9e4b18fe5da7",
    aspect: "landscape",
    layout: "md:col-span-7 md:row-span-2",
  },
  {
    title: "Lancaster Woods",
    artist: "Jaslene Perez",
    medium: "Canvas",
    size: '24"×32"',
    image:
      "https://firebasestorage.googleapis.com/v0/b/shamrockartstudio.firebasestorage.app/o/Lancaster%20Woods.png?alt=media&token=706bada1-c2ff-411e-a659-597ce9efed1b",
    aspect: "landscape",
    layout: "md:col-span-7 md:row-span-2",
  },
];

export const studioNotes = [
  "Digital-first exhibitions with no physical storefront.",
  "Private collector previews, commissions, and drops online.",
  "A clean, cinematic presentation built to make the work feel premium.",
];
