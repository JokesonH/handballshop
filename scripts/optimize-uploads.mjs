/**
 * Downscale anything oversized in public/uploads.
 *
 * next/image handles *serving* — it re-encodes to AVIF/WebP at request time,
 * so upload format genuinely doesn't matter. What it does not do is shrink
 * the master sitting in the repo, and the CMS commits whatever the editor
 * dragged in. A handful of 6000px mockup exports will bloat the git history
 * permanently, and history is the one thing you can't clean up cheaply later.
 *
 * This caps the long edge at MAX_EDGE. Nothing above the largest width in
 * next.config.ts deviceSizes (1920) is ever requested, so 2000 keeps a little
 * headroom for re-cropping and throws the rest away.
 *
 *   npm run optimize:uploads          # rewrite oversized files in place
 *   npm run optimize:uploads -- --dry # report only
 */
import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const DIR = "public/uploads";
const MAX_EDGE = 2000;
const EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);
const dry = process.argv.includes("--dry");

const mb = (n) => `${(n / 1048576).toFixed(2)} MB`;

let saved = 0;
for (const name of await readdir(DIR)) {
  if (!EXT.has(path.extname(name).toLowerCase())) continue;
  const file = path.join(DIR, name);
  const before = (await stat(file)).size;
  const image = sharp(file, { limitInputPixels: false });
  const { width = 0, height = 0, hasAlpha } = await image.metadata();

  /* An alpha *channel* is not the same as alpha being *used*. Mockup
     exporters routinely emit RGBA where every pixel is opaque, or nearly so
     (min 250 is compression noise on a hard edge, not a cutout). Keeping a
     dead channel blocks palette quantisation and roughly doubles the file,
     so decide from the actual data. */
  let keepAlpha = false;
  if (hasAlpha) {
    const { channels } = await image.stats();
    const alpha = channels[channels.length - 1];
    keepAlpha = alpha.min < 250;
  }

  const oversized = Math.max(width, height) > MAX_EDGE;
  const wastefulAlpha = hasAlpha && !keepAlpha;
  if (!oversized && !wastefulAlpha) {
    console.log(`  keep    ${name}  ${width}x${height}  ${mb(before)}`);
    continue;
  }

  let pipeline = image;
  if (oversized) {
    pipeline = pipeline.resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    });
  }
  if (!keepAlpha) pipeline = pipeline.flatten({ background: "#ffffff" });
  const out = await pipeline
    .png({ compressionLevel: 9, palette: !keepAlpha })
    .toBuffer();
  const why = [oversized && "oversized", wastefulAlpha && "dead alpha"]
    .filter(Boolean)
    .join(" + ");
  console.log(
    `  ${dry ? "would " : ""}fix    ${name}  ${width}x${height} ${mb(before)} -> ${mb(out.length)}  (${why})`
  );
  saved += before - out.length;
  if (!dry) await writeFile(file, out);
}
console.log(`\n${dry ? "would save" : "saved"} ${mb(saved)}`);
