"use client";

import Image from "next/image";
import ArtworkImageScrim from "@/components/ui/ArtworkImageScrim";
import { ARTWORK_MAT_INNER, ARTWORK_MAT_OUTER } from "@/components/ui/artworkMatClasses";

function aspectStyle(imageWidth, imageHeight, fallbackAspectRatio) {
  const w = Number(imageWidth);
  const h = Number(imageHeight);
  if (w > 0 && h > 0) {
    return { aspectRatio: `${w} / ${h}` };
  }
  return { aspectRatio: fallbackAspectRatio };
}

export default function CoverImageFrame({
  src,
  alt,
  imageWidth,
  imageHeight,
  sizes,
  fallbackAspectRatio = "2 / 3",
  zoomClass = "scale-[1.14]",
  hoverZoomClass = "group-hover:scale-[1.2]",
  frameClassName = "relative w-full overflow-hidden bg-site-bg",
  secondaryMat = true,
  /**
   * Scrim inside the image well only (never over mat rings).
   * `inner` — subtle well-only fade; `card` — catalog tiles; `hero` — home hero rotator.
   */
  scrim = "none",
  matOuterClassName = "",
  matInnerClassName = "",
}) {
  const core = (
    <div
      className={frameClassName}
      style={aspectStyle(imageWidth, imageHeight, fallbackAspectRatio)}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`relative h-full w-full origin-center transition duration-700 ${zoomClass} ${hoverZoomClass}`}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            className="object-cover object-center"
          />
          <ArtworkImageScrim variant={scrim} />
        </div>
      </div>
    </div>
  );

  if (!secondaryMat) return core;

  return (
    <div className={`${ARTWORK_MAT_OUTER} ${matOuterClassName}`.trim()}>
      <div className={`${ARTWORK_MAT_INNER} ${matInnerClassName}`.trim()}>
        {core}
      </div>
    </div>
  );
}
