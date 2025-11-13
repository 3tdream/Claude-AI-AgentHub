/**
 * Image Generation Script for Presentation Slides
 * Uses fal.ai to generate images based on slide descriptions
 */

require("dotenv").config({ path: ".env.local" });

const { fal } = require("@fal-ai/client");
const fs = require("fs");
const path = require("path");
const https = require("https");

// Configure fal.ai with your API key
const FAL_KEY = process.env.FAL_KEY;

if (!FAL_KEY) {
  console.error("❌ Error: FAL_KEY environment variable is not set!");
  console.error("Please create a .env.local file with your fal.ai API key:");
  console.error("FAL_KEY=your_api_key_here");
  process.exit(1);
}

fal.config({
  credentials: FAL_KEY,
});

// Image prompts for each slide
const imagePrompts = [
  {
    slide: 1,
    filename: "slide-1-innovation.jpg",
    prompt: "Futuristic digital transformation concept, innovation in technology, abstract modern design with glowing blue and purple lights, high-tech corporate environment, professional photography, 16:9 aspect ratio",
  },
  {
    slide: 2,
    filename: "slide-2-heritage.jpg",
    prompt: "Historic old university building with classic architecture, ivy covered walls, traditional education setting, warm golden hour lighting, prestigious academic institution, professional photography, 16:9 aspect ratio",
  },
  {
    slide: 3,
    filename: "slide-3-challenge.jpg",
    prompt: "Dramatic alarm clock ringing urgently with glowing red warning lights, crisis and urgency concept, dark moody background with bright attention-grabbing elements, wake up call metaphor, intense dramatic lighting, professional photography, 16:9 aspect ratio",
  },
  {
    slide: 4,
    filename: "slide-4-vision.jpg",
    prompt: "Inspirational vision board with purple and blue lighting, futuristic strategic planning concept, glowing holographic displays showing AI and technology roadmaps, ambitious goals and transformation, leadership and bold decisions theme, professional photography, 16:9 aspect ratio",
  },
  {
    slide: 5,
    filename: "slide-5-infrastructure.jpg",
    prompt: "Modern technology campus with sleek glass buildings, digital infrastructure, smart classrooms, contemporary architectural design, bright daylight, professional photography, 16:9 aspect ratio",
  },
  {
    slide: 6,
    filename: "slide-6-curriculum.jpg",
    prompt: "Modern university classroom with AI and machine learning education, diverse students collaborating on computer screens showing code and neural networks, high-tech learning environment with green ambient lighting, partnership and innovation theme, professional photography, 16:9 aspect ratio",
  },
  {
    slide: 7,
    filename: "slide-7-research.jpg",
    prompt: "Advanced AI robotics laboratory, cutting-edge research equipment, robotic arms and AI systems, scientists working with technology, futuristic lab environment, professional photography, 16:9 aspect ratio",
  },
  {
    slide: 8,
    filename: "slide-8-faculty.jpg",
    prompt: "Diverse group of students learning together in a modern classroom, collaborative learning environment, people of different backgrounds, engaged in discussion, bright and welcoming atmosphere, professional photography, 16:9 aspect ratio",
  },
  {
    slide: 9,
    filename: "slide-9-students.jpg",
    prompt: "Students coding on modern computers in a tech lab, focused on programming, multiple monitors showing code, collaborative coding environment, modern workspace, professional photography, 16:9 aspect ratio",
  },
  {
    slide: 10,
    filename: "slide-10-awards.jpg",
    prompt: "Prestigious award ceremony with golden trophies and medals on elegant display, international recognition and excellence theme, spotlights and warm golden lighting, celebration of academic achievement, professional photography, 16:9 aspect ratio",
  },
  {
    slide: 11,
    filename: "slide-11-future.jpg",
    prompt: "Futuristic classroom with holographic displays and advanced technology, virtual reality learning, innovative educational technology, sci-fi inspired design, professional photography, 16:9 aspect ratio",
  },
  {
    slide: 12,
    filename: "slide-12-cta.jpg",
    prompt: "Graduation celebration with students throwing caps in the air, success and achievement, joyful celebration, diverse graduates, bright sunny day, professional photography, 16:9 aspect ratio",
  },
];

// Download image from URL
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
  });
}

// Generate a single image
async function generateImage(slideInfo) {
  console.log(`\n🎨 Generating image for Slide ${slideInfo.slide}...`);
  console.log(`📝 Prompt: ${slideInfo.prompt}`);

  try {
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: slideInfo.prompt,
        image_size: {
          width: 1920,
          height: 1080,
        },
        num_images: 1,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log(`⏳ ${update.status}`);
        }
      },
    });

    if (result.data && result.data.images && result.data.images.length > 0) {
      const imageUrl = result.data.images[0].url;
      const outputPath = path.join(
        __dirname,
        "..",
        "public",
        "assets",
        slideInfo.filename
      );

      console.log(`💾 Downloading image to ${slideInfo.filename}...`);
      await downloadImage(imageUrl, outputPath);
      console.log(`✅ Successfully generated ${slideInfo.filename}`);

      return {
        success: true,
        slide: slideInfo.slide,
        filename: slideInfo.filename,
        path: outputPath,
      };
    } else {
      throw new Error("No image returned from API");
    }
  } catch (error) {
    console.error(`❌ Error generating image for slide ${slideInfo.slide}:`, error.message);
    return {
      success: false,
      slide: slideInfo.slide,
      error: error.message,
    };
  }
}

// Main function
async function main() {
  console.log("🚀 Starting image generation for presentation slides...\n");
  console.log(`📊 Total images to generate: ${imagePrompts.length}\n`);

  // Ensure assets directory exists
  const assetsDir = path.join(__dirname, "..", "public", "assets");
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const results = [];

  // Generate images one by one (to avoid rate limits)
  for (const prompt of imagePrompts) {
    const result = await generateImage(prompt);
    results.push(result);

    // Add a small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 GENERATION SUMMARY");
  console.log("=".repeat(50));

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);

  if (successful.length > 0) {
    console.log("\n✅ Successfully generated images:");
    successful.forEach((r) => {
      console.log(`   - Slide ${r.slide}: ${r.filename}`);
    });
  }

  if (failed.length > 0) {
    console.log("\n❌ Failed to generate:");
    failed.forEach((r) => {
      console.log(`   - Slide ${r.slide}: ${r.error}`);
    });
  }

  console.log("\n🎉 Image generation complete!");
  console.log("\n💡 Next steps:");
  console.log("   1. Check the public/assets/ folder for generated images");
  console.log("   2. Update data/slides.json to use local paths if needed");
  console.log("   3. Test your presentation locally");
}

// Run the script
main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
