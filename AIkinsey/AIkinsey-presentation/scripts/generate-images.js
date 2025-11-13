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

// Image prompts for each slide - AIkinsey Pitch Deck
const imagePrompts = [
  {
    slide: 2,
    filename: "slide-2-problem.jpg",
    prompt: "Overwhelmed small business owner surrounded by scattered papers, cluttered desk with multiple screens showing spreadsheets and analytics, stressed expression, chaotic office environment, dramatic lighting highlighting frustration, corporate photography, professional quality, 16:9 aspect ratio",
  },
  {
    slide: 3,
    filename: "slide-3-market.jpg",
    prompt: "Abstract global market visualization with glowing financial charts and growth graphs, upward trending data, world map with connecting network nodes, green and blue color scheme representing growth and technology, modern corporate financial concept, professional photography, 16:9 aspect ratio",
  },
  {
    slide: 5,
    filename: "slide-5-how-it-works.jpg",
    prompt: "Modern collaborative workspace with diverse team members working together, AI technology interfaces floating holographically, phase-by-phase workflow visualization, bright and innovative atmosphere, blue and purple tech aesthetic, professional photography, 16:9 aspect ratio",
  },
  {
    slide: 6,
    filename: "slide-6-product-demo.jpg",
    prompt: "Futuristic AI dashboard with multiple screens showing analytics, automated workflows, and intelligent insights, sleek modern interface design, data visualization charts, professional corporate technology environment, cyan and blue lighting, 16:9 aspect ratio",
  },
  {
    slide: 7,
    filename: "slide-7-competition.jpg",
    prompt: "Professional business strategy meeting room with competitive analysis charts on large screens, strategic planning session, modern corporate boardroom, orange accent lighting, leadership and decision-making theme, professional photography, 16:9 aspect ratio",
  },
  {
    slide: 8,
    filename: "slide-8-traction.jpg",
    prompt: "Success celebration in modern startup office, team members looking at impressive growth metrics on screens, upward trending graphs, excited atmosphere, green theme representing growth and achievement, professional corporate photography, 16:9 aspect ratio",
  },
  {
    slide: 10,
    filename: "slide-10-gtm.jpg",
    prompt: "Global expansion concept with world map showing network connections, strategic market entry points highlighted, partnership handshake, international business growth visualization, professional blue corporate theme, 16:9 aspect ratio",
  },
  {
    slide: 11,
    filename: "slide-11-financials.jpg",
    prompt: "Professional financial presentation with golden charts showing revenue growth, calculator and financial documents, investment banking aesthetic, warm golden lighting, prosperity and success theme, sophisticated corporate photography, 16:9 aspect ratio",
  },
  {
    slide: 12,
    filename: "slide-12-risk.jpg",
    prompt: "Secure vault door or digital security shield concept, cybersecurity and data protection visualization, padlock and encryption symbols, trust and safety theme, red accent lighting for security emphasis, professional photography, 16:9 aspect ratio",
  },
  {
    slide: 14,
    filename: "slide-14-team.jpg",
    prompt: "Professional diverse startup team portrait, confident founders and advisors, modern office background, collaborative and innovative atmosphere, indigo and blue corporate color scheme, team leadership theme, professional headshot quality photography, 16:9 aspect ratio",
  },
  {
    slide: 15,
    filename: "slide-15-vision.jpg",
    prompt: "Futuristic cityscape with holographic AI interfaces, vision of technology-enhanced future, human and AI collaboration visualization, blue and purple neon lighting, aspirational and forward-thinking atmosphere, sci-fi corporate concept, professional photography, 16:9 aspect ratio",
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
