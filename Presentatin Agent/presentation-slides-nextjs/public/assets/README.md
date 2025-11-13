# Assets Folder

This folder contains all the images and visual assets used in the presentation slides.

## Image Files

Place your slide background images here with the following naming convention:

- `slide-1-innovation.jpg` - Title slide (innovation/digital transformation theme)
- `slide-2-heritage.jpg` - The Beginning (old university building, historic)
- `slide-3-challenge.jpg` - Wake Up Call (urgent challenge, alarm clock theme)
- `slide-4-vision.jpg` - The Vision (bold decision, holographic AI roadmaps)
- `slide-5-infrastructure.jpg` - Digital Infrastructure (modern technology campus)
- `slide-6-curriculum.jpg` - AI-First Curriculum (education, partnerships)
- `slide-7-research.jpg` - Research Excellence (AI robotics lab)
- `slide-8-faculty.jpg` - World-Class Faculty (diverse students learning)
- `slide-9-students.jpg` - Student Success (students coding on computers)
- `slide-10-awards.jpg` - Global Recognition (awards ceremony, trophies)
- `slide-11-future.jpg` - The Future Ahead (futuristic classroom technology)
- `slide-12-cta.jpg` - Call to Action (graduation celebration/success)

## Image Specifications

- **Format**: JPG or PNG
- **Recommended Resolution**: 1920x1080 (Full HD) or higher
- **Aspect Ratio**: 16:9
- **File Size**: Optimize for web (< 500KB per image)

## Fallback Images

The `slides.json` file includes fallback URLs (Unsplash) that will be used if local assets are not found. Once you add your images to this folder, they will automatically be used instead of the fallback URLs.

## How to Add Images

1. Download or create your images
2. Rename them according to the naming convention above
3. Place them in this `/public/assets/` folder
4. The Next.js app will automatically serve them

## Optional: Download Fallback Images

If you want to download the current Unsplash images being used:

1. Visit the fallback URLs in `data/slides.json`
2. Download each image
3. Save them with the appropriate names in this folder
