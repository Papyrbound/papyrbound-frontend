export const defaultProfileBanner = "/covers/whale-paper-boat.png";
export const maxStoredBannerLength = 1_500_000;

export function isStoredProfileBanner(value: unknown): value is string {
  return typeof value === "string" && (
    value === defaultProfileBanner ||
    (value.startsWith("data:image/jpeg;base64,") && value.length <= maxStoredBannerLength)
  );
}

export async function prepareProfileBanner(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPG, PNG, or WebP image.");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Choose an image smaller than 10 MB.");
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This image could not be opened. Choose another image.");
  }
  try {
    const scale = Math.min(1, 1600 / bitmap.width, 600 / bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image processing is unavailable. Try again.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const result = canvas.toDataURL("image/jpeg", 0.85);
    if (!isStoredProfileBanner(result)) {
      throw new Error("This image is too large to save. Choose a simpler image.");
    }
    return result;
  } finally {
    bitmap.close();
  }
}
