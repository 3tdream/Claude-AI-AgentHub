#!/usr/bin/env node

/**
 * Generate background images using fal-ai flux model
 * Usage: FAL_KEY=your_api_key node scripts/generate-fal-image.js
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
  console.log('Usage: FAL_KEY=your_api_key node scripts/generate-fal-image.js');
  process.exit(1);
}

// Configure fal-ai client
fal.config({
  credentials: FAL_KEY,
});

// Image prompts for each slide
const slidePrompts = {
  'slide-1': {
    prompt: 'Professional futuristic tech background with AI neural network visualization, dark blue and purple gradient, modern corporate style, abstract technology patterns, digital transformation concept, clean and minimalist, high quality, 8k resolution, cinematic lighting, no people',
    image_size: 'landscape_16_9',
    num_inference_steps: 28,
    guidance_scale: 3.5,
  },
  'slide-2': {
    prompt: 'Modern business office environment showing organizational complexity, multiple computer screens with data dashboards, professional corporate setting, blue and gray tones, clean modern aesthetic, no people, high quality photography',
    image_size: 'landscape_16_9',
    num_inference_steps: 28,
    guidance_scale: 3.5,
  },
  'slide-3': {
    prompt: 'Financial market data visualization background, stock market graphs and charts, business growth concept, professional blue and green colors, high-tech aesthetic, abstract data patterns, no people, ultra realistic, 8k',
    image_size: 'landscape_16_9',
    num_inference_steps: 28,
    guidance_scale: 3.5,
  },
  'slide-5': {
    prompt: 'Modern collaborative workspace with technology, innovation hub atmosphere, clean and organized office space, natural lighting, professional tech company aesthetic, blue and white tones, no people, high quality',
    image_size: 'landscape_16_9',
    num_inference_steps: 28,
    guidance_scale: 3.5,
  },
  'slide-6': {
    prompt: 'Futuristic digital dashboard interface, AI product demo screen, clean user interface design, modern software application, professional color scheme, high-tech visualization, no people, sharp and clear',
    image_size: 'landscape_16_9',
    num_inference_steps: 28,
    guidance_scale: 3.5,
  },
  'slide-7': {
    prompt: 'Professional business strategy background, competitive analysis visualization, modern corporate meeting room with presentation screens, blue and gray color scheme, no people, high quality commercial photography',
    image_size: 'landscape_16_9',
    num_inference_steps: 28,
    guidance_scale: 3.5,
  },
  'slide-8': {
    prompt: 'Success metrics and growth charts background, business analytics dashboard, professional data visualization, green and blue color tones indicating growth, modern corporate aesthetic, no people, ultra sharp',
    image_size: 'landscape_16_9',
    num_inference_steps: 28,
    guidance_scale: 3.5,
  },
  'slide-10': {
    prompt: 'Global business expansion map visualization, international market strategy, modern corporate background, professional blue tones, world map with connection lines, high-tech aesthetic, no people',
    image_size: 'landscape_16_9',
    num_inference_steps: 28,
    guidance_scale: 3.5,
  },
  'slide-11': {
    prompt: 'Financial projections and revenue charts, professional business analytics background, calculator and financial documents aesthetic, clean corporate style, blue and green color scheme, no people, high quality',
    image_size: 'landscape_16_9',
    num_inference_steps: 28,
    guidance_scale: 3.5,
  },
  'slide-12': {
    prompt: 'Cybersecurity and data protection concept, digital security shields, encrypted data visualization, professional blue and green tones, modern tech security aesthetic, no people, high quality 8k',
    image_size: 'landscape_16_9',
    num_inference_steps: 28,
    guidance_scale: 3.5,
  },
  'slide-14': {
    prompt: 'Professional corporate team environment, modern office space with collaboration areas, clean and organized workspace, natural lighting, professional business atmosphere, blue and white tones, no people, high quality',
    image_size: 'landscape_16_9',
    num_inference_steps: 28,
    guidance_scale: 3.5,
  },
  'slide-15': {
    prompt: 'Futuristic vision of technology and innovation, digital transformation concept, next-generation tech visualization, inspiring and forward-thinking atmosphere, blue and purple gradient, no people, cinematic 8k',
    image_size: 'landscape_16_9',
    num_inference_steps: 28,
    guidance_scale: 3.5,
  },
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
        // Handle redirect
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
      fs.unlinkSync(filepath);
      reject(error);
    });
  });
}

// Function to generate image using fal-ai
async function generateImage(slideId, promptData) {
  console.log(`\n🎨 Generating image for ${slideId}...`);
  console.log(`📝 Prompt: ${promptData.prompt.substring(0, 80)}...`);

  const result = await fal.subscribe('fal-ai/flux/srpo', {
    input: {
      prompt: promptData.prompt,
      image_size: promptData.image_size,
      num_inference_steps: promptData.num_inference_steps,
      guidance_scale: promptData.guidance_scale,
      num_images: 1,
      enable_safety_checker: true,
    },
    logs: false,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        console.log(`⏳ Progress: ${update.logs?.map(log => log.message).join(' ') || 'Processing...'}`);
      }
    },
  });

  console.log(`✅ Image generated successfully for ${slideId}`);
  return result;
}

// Main function
async function main() {
  console.log('🚀 Starting image generation with fal-ai...\n');
  console.log('📊 Model: fal-ai/flux/srpo');
  console.log(`🖼️  Will generate ${Object.keys(slidePrompts).length} images\n`);

  const assetsDir = path.join(__dirname, '..', 'public', 'assets');

  // Create assets directory if it doesn't exist
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
    console.log(`📁 Created directory: ${assetsDir}\n`);
  }

  let successCount = 0;
  let failCount = 0;

  // Generate images for all slides
  for (const [slideId, promptData] of Object.entries(slidePrompts)) {
    try {
      // Generate image
      const result = await generateImage(slideId, promptData);

      // Get image URL from response
      const imageUrl = result.images?.[0]?.url;
      if (!imageUrl) {
        throw new Error('No image URL in response');
      }

      console.log(`🔗 Image URL: ${imageUrl}`);

      // Download and save image
      const filename = `${slideId}.jpg`;
      const filepath = path.join(assetsDir, filename);
      await downloadImage(imageUrl, filepath);

      console.log(`💾 Saved to: ${filepath}`);
      console.log(`✨ ${slideId} complete!`);

      successCount++;

      // Wait between requests to avoid rate limiting
      if (Object.keys(slidePrompts).indexOf(slideId) < Object.keys(slidePrompts).length - 1) {
        console.log('⏸️  Waiting 3 seconds before next generation...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

    } catch (error) {
      console.error(`❌ Error generating ${slideId}:`, error.message);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📈 Generation Summary:`);
  console.log(`   ✅ Success: ${successCount} images`);
  console.log(`   ❌ Failed: ${failCount} images`);
  console.log(`   📁 Location: ${assetsDir}`);

  if (successCount > 0) {
    console.log('\n🎉 Images generated successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Check the images in public/assets/');
    console.log('   2. They are already configured in slides.json');
    console.log('   3. Refresh your browser to see the new backgrounds');
    console.log('   4. Commit and push to GitHub to update the live site');
  }
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
