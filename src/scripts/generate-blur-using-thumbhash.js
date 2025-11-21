import fs from "fs";
import path from "path";
import sharp from "sharp";
import { rgbaToThumbHash } from "thumbhash";
import { fileURLToPath } from "url";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, "../../public/product-images"); // Directory where your high-res images are

// Helper function to encode Thumbhash and convert to Base64
async function getThumbhash(filePath) {
  const { data, info } = await sharp(filePath)
    .raw()
    .ensureAlpha() // Ensure the image has an alpha channel
    .resize(50, 50, {
      // Resize to a manageable size for Thumbhash
      fit: "inside",
    })
    .toBuffer({ resolveWithObject: true });

  // Encode the image data using Thumbhash
  const thumbhash = rgbaToThumbHash(
    info.width,
    info.height,
    new Uint8ClampedArray(data) // Image data as Uint8ClampedArray
  );

  // Convert the Thumbhash to a Base64 string
  return Buffer.from(thumbhash).toString("base64");
}

// Process each image in the source directory
fs.readdirSync(sourceDir).forEach((file) => {
  const inputFilePath = path.join(sourceDir, file);

  getThumbhash(inputFilePath)
    .then((base64Hash) => {
      // console.log(`Thumbhash for ${file}:`, base64Hash);
    })
    .catch((err) => console.error("Error processing image:", err));
});
