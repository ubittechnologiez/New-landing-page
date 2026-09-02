/**
 * Image processing utilities for client-side compression and conversion to Data URLs.
 * Ensures fast, zero-failure uploads of camera photos, screenshots, and artwork.
 */

/**
 * Image processing utilities for client-side compression, autocropping/trimming excess transparent/white margins,
 * and conversion to Data URLs. Ensures uniform sizing and fast, zero-failure uploads.
 */

/**
 * Automatically trims excess transparent or pure white/solid empty border pixels from an image.
 * This ensures logos with excess empty padding expand to fill their container at equal visual weight.
 */
export function trimImageCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  let top = height;
  let bottom = 0;
  let left = width;
  let right = 0;
  let hasVisiblePixels = false;

  // Sample corner to detect solid background if not transparent (e.g. white background)
  const isCornerWhiteOrTransparent = (r: number, g: number, b: number, a: number) => {
    if (a < 15) return true; // Transparent
    if (r > 240 && g > 240 && b > 240) return true; // Near white
    return false;
  };

  const cornerR = data[0];
  const cornerG = data[1];
  const cornerB = data[2];
  const cornerA = data[3];
  const isSolidWhiteBg = cornerA > 200 && cornerR > 245 && cornerG > 245 && cornerB > 245;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      let isContent = false;
      if (isSolidWhiteBg) {
        // Pixel differs from white background
        if (a > 20 && (r < 240 || g < 240 || b < 240)) {
          isContent = true;
        }
      } else {
        // Pixel has visible alpha or is not background
        if (a > 15 && !(r > 250 && g > 250 && b > 250 && a < 50)) {
          isContent = true;
        }
      }

      if (isContent) {
        hasVisiblePixels = true;
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }

  // If no content found or already tightly cropped, return original
  if (!hasVisiblePixels || left >= right || top >= bottom) {
    return canvas;
  }

  // Add a tiny 2% safety margin so edges are not clipped
  const cropWidth = right - left + 1;
  const cropHeight = bottom - top + 1;
  const padX = Math.round(cropWidth * 0.02);
  const padY = Math.round(cropHeight * 0.02);

  const safeLeft = Math.max(0, left - padX);
  const safeTop = Math.max(0, top - padY);
  const safeWidth = Math.min(width - safeLeft, cropWidth + padX * 2);
  const safeHeight = Math.min(height - safeTop, cropHeight + padY * 2);

  const trimmedCanvas = document.createElement("canvas");
  trimmedCanvas.width = safeWidth;
  trimmedCanvas.height = safeHeight;
  const trimmedCtx = trimmedCanvas.getContext("2d");
  if (!trimmedCtx) return canvas;

  trimmedCtx.drawImage(
    canvas,
    safeLeft,
    safeTop,
    safeWidth,
    safeHeight,
    0,
    0,
    safeWidth,
    safeHeight
  );

  return trimmedCanvas;
}

export async function processImageFile(
  file: File,
  maxDimension = 1920,
  quality = 0.88,
  autoTrim = true,
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If SVG, convert directly without rasterization
    if (file.type === "image/svg+xml") {
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

          let canvas = document.createElement("canvas");
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

          // Auto-trim excess transparent borders if requested
          if (autoTrim) {
            try {
              canvas = trimImageCanvas(canvas);
            } catch (trimErr) {
              console.warn("Auto-trim canvas note:", trimErr);
            }
          }

          // For transparent PNGs or PNG under 2MB keep PNG, otherwise use WebP/JPEG for fast load
          const isPng = file.type === "image/png";
          const format = isPng ? "image/png" : "image/webp";

          try {
            const dataUrl = canvas.toDataURL(format, quality);
            if (dataUrl.startsWith("data:image/webp") || isPng) {
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

