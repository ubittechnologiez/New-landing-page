/**
 * Image processing utilities for client-side compression and conversion to Data URLs.
 * Ensures fast, zero-failure uploads of camera photos, screenshots, and artwork.
 */

export async function processImageFile(
  file: File,
  maxDimension = 1920,
  quality = 0.88,
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If SVG or very small, convert directly without canvas rasterization
    if (file.type === "image/svg+xml" || file.size < 120 * 1024) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          // Smooth rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          // For transparent PNGs or PNG under 1.5MB keep PNG, otherwise use WebP/JPEG for fast load
          const isTransparentPng =
            file.type === "image/png" && file.size < 1.5 * 1024 * 1024;
          const format = isTransparentPng ? "image/png" : "image/webp";

          try {
            const dataUrl = canvas.toDataURL(format, quality);
            if (dataUrl.startsWith("data:image/webp") || isTransparentPng) {
              resolve(dataUrl);
            } else {
              resolve(canvas.toDataURL("image/jpeg", quality));
            }
          } catch {
            resolve(canvas.toDataURL("image/jpeg", quality));
          }
        } catch {
          resolve(e.target?.result as string);
        }
      };

      img.onerror = () => {
        resolve(e.target?.result as string);
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Metadata extractor helpers that work with both separate fields
 * and composite fallback descriptions.
 */
export function getDisplayCategory(item: {
  category?: string;
  description?: string;
}): string {
  if (item.category && item.category.trim()) return item.category.trim();
  if (item.description) {
    const match = item.description.match(/^\[(.*?)\]/);
    if (match && match[1]) return match[1].trim();
  }
  return "Server Solutions";
}

export function getDisplayDescription(item: {
  description?: string;
}): string {
  if (!item.description) return "";
  return item.description
    .replace(/^\[(.*?)\]\s*/, "")
    .replace(/\(Client:\s*.*?\)\s*/g, "")
    .trim();
}

export function getDisplayClient(item: {
  client?: string;
  description?: string;
}): string | undefined {
  if (item.client && item.client.trim()) return item.client.trim();
  if (item.description) {
    const match = item.description.match(/\(Client:\s*(.*?)\)/);
    if (match && match[1]) return match[1].trim();
  }
  return undefined;
}

