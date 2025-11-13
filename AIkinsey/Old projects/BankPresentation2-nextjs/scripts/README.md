# Image Generation Scripts

## generate-images.js

This script uses [fal.ai](https://fal.ai) to generate AI images for your presentation slides.

### Setup

1. **Get your fal.ai API key**
   - Visit https://fal.ai/dashboard
   - Sign up or log in
   - Copy your API key

2. **Create .env.local file**
   ```bash
   # Copy the template
   cp .env.local.template .env.local

   # Edit .env.local and add your API key
   FAL_KEY=your_actual_fal_api_key_here
   ```

### Usage

Run the image generation script:

```bash
npm run generate-images
```

Or directly with node:

```bash
node scripts/generate-images.js
```

### What it does

- Generates 12 AI images for all slides: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
- Uses the fal.ai/flux/schnell model
- Creates 1920x1080 resolution images (16:9 aspect ratio)
- Saves images to `public/assets/` folder
- Downloads images with filenames matching the slide references in `data/slides.json`

### Generated Images

- `slide-1-innovation.jpg` - Futuristic digital transformation concept
- `slide-2-heritage.jpg` - Historic university building
- `slide-3-challenge.jpg` - Dramatic alarm clock with urgent wake-up call theme
- `slide-4-vision.jpg` - Inspirational vision board with holographic AI roadmaps
- `slide-5-infrastructure.jpg` - Modern technology campus
- `slide-6-curriculum.jpg` - AI and machine learning education classroom
- `slide-7-research.jpg` - Advanced AI robotics lab
- `slide-8-faculty.jpg` - Diverse students learning
- `slide-9-students.jpg` - Students coding on computers
- `slide-10-awards.jpg` - Prestigious award ceremony with golden trophies
- `slide-11-future.jpg` - Futuristic classroom with holographic displays
- `slide-12-cta.jpg` - Graduation celebration

### After Generation

Once images are generated, they will be automatically used by the presentation since `data/slides.json` is already configured to reference them with fallback URLs.

### Cost Note

fal.ai is a paid service. Check their pricing at https://fal.ai/pricing before generating images. The flux/schnell model is relatively affordable for quick image generation.
