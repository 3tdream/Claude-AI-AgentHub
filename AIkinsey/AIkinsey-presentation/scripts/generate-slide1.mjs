#!/usr/bin/env node

/**
 * Generate background image for slide 1 and update JSON
 * Usage: FAL_KEY=your_api_key node scripts/generate-slide1.mjs
 */

import * as fal from '@fal-ai/client';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FAL_KEY = process.env.FAL_KEY;

if (!FAL_KEY) {
  console.error('❌ Error: FAL_KEY environment variable is required');
  console.log('\n💡 How to get your API key:');
  console.log('   1. Go to https://fal.ai/dashboard');
  console.log('   2. Sign in or create account');
  console.log('   3. Go to API Keys section');
  console.log('   4. Copy your API key\n');
  console.log('Usage:');
  console.log('   PowerShell: $env:FAL_KEY="your_key"; npm run generate-slide1');
  console.log('   Bash: FAL_KEY=your_key npm run generate-slide1');
  process.exit(1);
}

// Configure fal-ai client
fal.config({
  credentials: FAL_KEY,
});

// Slide 1 prompt - Professional AI/Tech themed background
const slide1Prompt = {
  prompt: 'Professional futuristic tech background with AI neural network visualization, dark blue and purple gradient, modern corporate style, abstract technology patterns, digital transformation concept, clean and minimalist, high quality, 8k resolution, cinematic lighting, no people, business presentation style',
  image_size: 'landscape_16_9',
  num_inference_steps: 28,
  guidance_scale: 3.5,
};

// Function to download image from URL
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        file.close();
        fs.unlinkSync(filepath);
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
      } else {
        file.close();
        fs.unlinkSync(filepath);
        reject(new Error(`Failed to download image: ${response.statusCode}`));
      }
    }).on('error', (error) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(error);
    });
  });
}

// Function to update slides.json
function updateSlidesJson(imagePath) {
  const slidesJsonPath = path.join(__dirname, '..', 'data', 'slides.json');

  console.log('\n📝 Updating slides.json...');

  try {
    const slidesData = JSON.parse(fs.readFileSync(slidesJsonPath, 'utf8'));

    // Update slide 1 background
    if (slidesData.slides && slidesData.slides[0]) {
      slidesData.slides[0].background = {
        type: 'image',
        source: '/assets/slide-1.jpg',
        fallback: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920'
      };

      // Update overlay to true for better text visibility
      slidesData.slides[0].overlay = true;

      fs.writeFileSync(slidesJsonPath, JSON.stringify(slidesData, null, 2));
      console.log('✅ Updated slides.json with new background');
    }
  } catch (error) {
    console.error('❌ Failed to update slides.json:', error.message);
  }
}

// Main function
async function main() {
  console.log('🚀 Starting slide 1 background generation...\n');
  console.log('📊 Model: fal-ai/flux/srpo (high quality)');
  console.log('🎨 Theme: AI Neural Network Visualization\n');

  const assetsDir = path.join(__dirname, '..', 'public', 'assets');

  // Create assets directory if it doesn't exist
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
    console.log(`📁 Created directory: ${assetsDir}\n`);
  }

  try {
    console.log('🎨 Generating image...');
    console.log(`📝 Prompt: ${slide1Prompt.prompt.substring(0, 80)}...`);

    // Generate image using fal-ai
    const result = await fal.subscribe('fal-ai/flux/srpo', {
      input: {
        prompt: slide1Prompt.prompt,
        image_size: slide1Prompt.image_size,
        num_inference_steps: slide1Prompt.num_inference_steps,
        guidance_scale: slide1Prompt.guidance_scale,
        num_images: 1,
        enable_safety_checker: true,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          const logs = update.logs?.map(log => log.message).join(' ');
          if (logs) console.log(`⏳ ${logs}`);
        }
      },
    });

    console.log('✅ Image generated successfully!');

    // Get image URL from response
    const imageUrl = result.images?.[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL in response');
    }

    console.log(`🔗 Image URL: ${imageUrl}`);

    // Download and save image
    const filepath = path.join(assetsDir, 'slide-1.jpg');
    console.log('\n💾 Downloading image...');
    await downloadImage(imageUrl, filepath);

    console.log(`✅ Saved to: ${filepath}`);

    // Update slides.json
    updateSlidesJson(filepath);

    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 Slide 1 background generated successfully!\n');
    console.log('💡 Next steps:');
    console.log('   1. Check the image at: public/assets/slide-1.jpg');
    console.log('   2. Refresh your browser at http://localhost:3002');
    console.log('   3. See the new background on slide 1');
    console.log('   4. Commit and push to update live site\n');
    console.log('📦 To generate all slides, run: npm run generate-fal');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.body) {
      console.error('Details:', error.body);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
