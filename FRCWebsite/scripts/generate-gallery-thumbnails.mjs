/**
 * Builds WebP thumbnails (max width 800px) for gallery grid. Full-resolution files
 * stay in src/assets/gallery; thumbs go to src/assets/gallery/thumbs (gitignored).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const galleryDir = path.join(root, "src", "assets", "gallery");
const thumbsDir = path.join(galleryDir, "thumbs");

const MAX_WIDTH = 800;
const WEBP_QUALITY = 82;

async function main() {
    if (!fs.existsSync(galleryDir)) {
        console.warn(`[gallery-thumbs] No folder at ${galleryDir}; skipping.`);
        return;
    }

    if (fs.existsSync(thumbsDir)) {
        fs.rmSync(thumbsDir, { recursive: true });
    }
    fs.mkdirSync(thumbsDir, { recursive: true });

    const files = fs
        .readdirSync(galleryDir)
        .filter((f) => f !== "thumbs" && !f.startsWith(".") && /\.(jpe?g|png)$/i.test(f))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    let wrote = 0;
    for (const file of files) {
        const inputPath = path.join(galleryDir, file);
        const base = path.parse(file).name;
        const outPath = path.join(thumbsDir, `${base}.webp`);

        await sharp(inputPath)
            .rotate()
            .resize({
                width: MAX_WIDTH,
                withoutEnlargement: true,
            })
            .webp({ quality: WEBP_QUALITY, effort: 4 })
            .toFile(outPath);

        wrote += 1;
    }

    console.log(`[gallery-thumbs] Wrote ${wrote} WebP thumbnails to src/assets/gallery/thumbs/`);
}

await main();
