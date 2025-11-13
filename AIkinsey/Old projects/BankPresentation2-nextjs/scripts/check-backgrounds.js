const fs = require("fs");
const path = require("path");

// Read slides data
const slidesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "slides.json"), "utf8")
);

console.log("📊 BACKGROUND ANALYSIS\n");
console.log("Total slides:", slidesData.slides.length);
console.log("=" .repeat(60));

const imageSlides = [];
const gradientSlides = [];

slidesData.slides.forEach((slide) => {
  if (slide.background.type === "image") {
    imageSlides.push(slide.id);
  } else if (slide.background.type === "gradient") {
    gradientSlides.push(slide.id);
  }
});

console.log("\n✅ Slides WITH background images:", imageSlides.length);
imageSlides.forEach((id) => console.log(`   - Slide ${id}`));

console.log("\n❌ Slides WITHOUT background images (using gradients):", gradientSlides.length);
gradientSlides.forEach((id) => console.log(`   - Slide ${id}`));

console.log("\n" + "=".repeat(60));
console.log("\n💡 Slides needing background images:", gradientSlides.join(", "));
