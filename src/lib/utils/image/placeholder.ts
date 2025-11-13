import fs from "fs";
import path from "path";
import sharp from "sharp";

/**
 * Create a simple placeholder image (PNG) and save it to public/uploads/projects
 * Returns the absolute file path and the public URL.
 */
export async function createPlaceholderImage(
  {
    width = 120,
    height = 80,
    color = { r: 17, g: 34, b: 64, alpha: 1 }, // #112240
    text = "",
  }: {
    width?: number;
    height?: number;
    color?: { r: number; g: number; b: number; alpha?: number };
    text?: string;
  } = {}
): Promise<{ filePath: string; publicUrl: string }> {
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "projects");
  await fs.promises.mkdir(uploadsDir, { recursive: true });

  const filename = `placeholder_${Date.now()}.png`;
  const filePath = path.join(uploadsDir, filename);
  const publicUrl = `/uploads/projects/${filename}`;

  // Create a solid color background
  const background = Buffer.from([
    color.r,
    color.g,
    color.b,
    Math.round((color.alpha ?? 1) * 255),
  ]);

  const image = sharp({
    create: {
      width,
      height,
      channels: 4,
      background,
    },
  });

  // Optionally overlay a subtle diagonal line pattern for texture
  const svgPattern = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>
    <defs>
      <pattern id='diag' patternUnits='userSpaceOnUse' width='10' height='10'>
        <path d='M0,10 l10,-10' stroke='rgba(100,255,218,0.08)' stroke-width='1'/>
      </pattern>
    </defs>
    <rect width='100%' height='100%' fill='url(#diag)'/>
  </svg>`;

  const composite: sharp.OverlayOptions[] = [
    { input: Buffer.from(svgPattern), top: 0, left: 0 }
  ];

  if (text) {
    const svgText = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>
      <style>
        text { fill: rgba(204,214,246,0.8); font-size: 14px; font-family: Arial, sans-serif; }
      </style>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'>${text}</text>
    </svg>`;
    composite.push({ input: Buffer.from(svgText), top: 0, left: 0 });
  }

  await image.composite(composite).png().toFile(filePath);

  return { filePath, publicUrl };
}