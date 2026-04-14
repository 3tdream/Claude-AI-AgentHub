#!/usr/bin/env node
/**
 * Generate course illustrations via FAL.ai Flux
 * Usage: node scripts/generate-images.mjs
 */

import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'images');

const FAL_KEY = '8bccbbfb-ac16-45f7-9495-9e2e19161446:3773ff80d2b0e3f50eeeddcb9b0eafea';

const IMAGES = [
  {
    filename: 'meeting-01-user-devices.webp',
    prompt: 'Clean modern flat illustration of a person interacting with multiple digital devices: smartphone, laptop, tablet, smartwatch. Soft pastel colors, minimalist UX/UI design style, educational course illustration. White background, no text.',
  },
  {
    filename: 'meeting-01-ux-ui-venn.webp',
    prompt: 'Clean Venn diagram showing the overlap between UX Design and UI Design. Two overlapping circles — left circle labeled UX (blue), right circle labeled UI (pink), overlap area in purple. Minimalist flat design, educational illustration, white background. Labels: UX Design, UI Design, overlap area shows shared skills.',
  },
  {
    filename: 'meeting-01-ux-roi-graph.webp',
    prompt: 'Clean business graph showing ROI from UX design investment. Upward trending line chart with dollar signs, showing every $1 invested in UX returns $100. Modern flat infographic style, blue and green colors, white background, educational illustration. No complex text.',
  },
  {
    filename: 'meeting-02-cli-vs-gui.webp',
    prompt: 'Split-screen comparison illustration: left side shows a dark terminal/CLI interface with green text on black (1970s Unix style), right side shows colorful Macintosh 1984 GUI desktop with windows, icons, mouse pointer. Retro computing aesthetic, educational illustration, clean design.',
  },
  {
    filename: 'meeting-06-color-emotions.webp',
    prompt: 'Color psychology spectrum illustration for UX design education. Horizontal gradient of colors from red to violet, each color connected to an emotion icon: red=passion, orange=energy, yellow=happiness, green=calm, blue=trust, purple=luxury. Clean flat design, white background, educational infographic style.',
  },
  {
    filename: 'meeting-06-itten-color-wheel.webp',
    prompt: 'Johannes Itten color wheel diagram with 12 colors arranged in a circle. Three concentric levels: primary colors (red, yellow, blue) in center triangle, secondary colors in middle ring, tertiary colors in outer ring. Clean educational illustration, flat design, white background, labeled color wheel.',
  },
  {
    filename: 'meeting-06-color-harmonies.webp',
    prompt: 'Six types of color harmonies shown on small color wheels: complementary, analogous, triadic, split-complementary, tetradic, monochromatic. Each shown as a mini color wheel with lines/shapes indicating the harmony pattern. Clean flat design grid layout, educational illustration, white background.',
  },
  {
    filename: 'meeting-07-font-anatomy.webp',
    prompt: 'Typography anatomy diagram showing a large letter "Hxgp" with labeled parts: baseline, x-height, cap height, ascender line, descender line, serif, stem, counter, bowl. Clean educational illustration with red guide lines and labels, white background, professional typography reference.',
  },
  {
    filename: 'meeting-07-12col-grid.webp',
    prompt: 'Web design 12-column grid system visualization on a desktop browser mockup. Shows 12 vertical columns with gutters between them and margins on sides. Columns in light blue, gutters labeled, margins labeled. Clean flat design, educational illustration, responsive web design concept.',
  },
  {
    filename: 'meeting-08-visual-hierarchy.webp',
    prompt: 'Split-screen comparison of a web page: left side shows chaotic layout with no visual hierarchy (all text same size, no contrast, cluttered), right side shows the same content with clear visual hierarchy (headline large, subheads medium, body small, proper spacing, CTA button prominent). Clean flat UI design illustration, educational.',
  },
  {
    filename: 'meeting-09-wireframe-evolution.webp',
    prompt: 'Three-stage evolution of a mobile app design: left shows rough pencil sketch on paper (lo-fi), center shows clean digital wireframe in gray boxes (mid-fi), right shows polished high-fidelity mockup with colors and images (hi-fi). Arrow progression left to right. Clean educational illustration, UX design process.',
  },
  {
    filename: 'meeting-10-prototype-fidelity.webp',
    prompt: 'Horizontal spectrum of prototype fidelity levels from left to right: paper sketch, post-it notes, simple wireframe, clickable wireframe, visual mockup, interactive prototype, near-final app. Gradient from rough/gray on left to polished/colorful on right. Clean flat educational illustration, UX design course.',
  },
  {
    filename: 'meeting-12-dashboards-comparison.webp',
    prompt: 'Three dashboard tool interfaces side by side: Tableau (enterprise, colorful charts), Metabase (clean open-source, simple graphs), Grafana (dark DevOps theme, monitoring panels). Each shown as a small screen mockup. Clean flat illustration, data visualization comparison, educational.',
  },
];

async function generateImage(item) {
  console.log(`\n🎨 Generating: ${item.filename}`);
  console.log(`   Prompt: ${item.prompt.substring(0, 80)}...`);

  const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: item.prompt,
      image_size: 'landscape_16_9',
      num_inference_steps: 4,
      num_images: 1,
      enable_safety_checker: true,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`   ❌ FAL API error ${response.status}: ${err}`);
    return false;
  }

  const result = await response.json();

  if (!result.images || result.images.length === 0) {
    console.error(`   ❌ No image returned`);
    return false;
  }

  const imageUrl = result.images[0].url;
  console.log(`   📥 Downloading from: ${imageUrl.substring(0, 60)}...`);

  // Download the image
  const imgResponse = await fetch(imageUrl);
  if (!imgResponse.ok) {
    console.error(`   ❌ Download failed: ${imgResponse.status}`);
    return false;
  }

  const buffer = Buffer.from(await imgResponse.arrayBuffer());
  const outPath = join(OUT_DIR, item.filename);
  await writeFile(outPath, buffer);

  console.log(`   ✅ Saved: ${outPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
  return true;
}

async function main() {
  console.log(`🚀 Generating ${IMAGES.length} course illustrations via FAL.ai Flux`);
  console.log(`📁 Output: ${OUT_DIR}\n`);

  let success = 0;
  let fail = 0;

  for (const item of IMAGES) {
    try {
      const ok = await generateImage(item);
      if (ok) success++;
      else fail++;
    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
      fail++;
    }
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\n📊 Done: ${success} success, ${fail} failed out of ${IMAGES.length}`);
}

main().catch(console.error);
