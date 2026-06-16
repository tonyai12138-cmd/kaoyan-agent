import {
  clearCustomPetImages,
  getCustomPetImages,
  saveCustomPetImage,
} from "./petStorage";

export const DEFAULT_FRONT_IMAGE = "/pet/kaoyan-pet-front.png";
export const DEFAULT_SIDE_IMAGE = "/pet/kaoyan-pet-side.png";
export const DEFAULT_BACK_IMAGE = "/pet/kaoyan-pet-back.png";

export function getInitialPetAssets() {
  const custom = getCustomPetImages();
  const hasCustomFrontOnly = custom.frontImage && !custom.backImage;

  return {
    frontImage: custom.frontImage ?? DEFAULT_FRONT_IMAGE,
    sideImage: DEFAULT_SIDE_IMAGE,
    backImage: custom.backImage ?? (hasCustomFrontOnly ? null : DEFAULT_BACK_IMAGE),
    customFrontImage: custom.frontImage,
    customBackImage: custom.backImage,
    backFallback: Boolean(hasCustomFrontOnly),
  };
}

export function resolveSideImage({ sideImage, frontImage }) {
  return sideImage || frontImage || DEFAULT_FRONT_IMAGE;
}

export function resolveBackImage({ frontImage, backImage }) {
  return backImage || frontImage || DEFAULT_FRONT_IMAGE;
}

export function savePetAsset(kind, dataUrl) {
  return saveCustomPetImage(kind, dataUrl);
}

export function clearPetAssets() {
  clearCustomPetImages();
}
