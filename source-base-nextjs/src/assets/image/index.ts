// ⚠️  AUTO-GENERATED — DO NOT EDIT MANUALLY
// Source: src/assets/image/*.{png,jpg,jpeg,gif,svg,webp,avif}
// Regenerate: npm run generate:images

import folderEmptyImage from "./folder-empty.svg";
import folderFillImage from "./folder-fill.svg";
import loadingSpinnerImage from "./loading-spinner.svg";
import logoVciImage from "./logo-vci.svg";

/** Map of image name (kebab-case filename stem) → bundled URL (Next import tĩnh ra StaticImageData, registry giữ .src). */
export const images = {
  "folder-empty": folderEmptyImage.src,
  "folder-fill": folderFillImage.src,
  "loading-spinner": loadingSpinnerImage.src,
  "logo-vci": logoVciImage.src,
} as const;

export type ImageName = keyof typeof images;
