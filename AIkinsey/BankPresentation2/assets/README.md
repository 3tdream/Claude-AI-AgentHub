# Assets Folder

## Structure

- `images/` - Store slide images here
- `icons/` - Store icon files here

## Usage

Images are referenced in the JSON by their key. The key maps to the filename.

### Example:
```json
"image": "app-logo"
```

This will load `assets/images/app-logo.png` or `assets/images/app-logo.jpg`

## Supported Formats

- PNG
- JPG/JPEG
- SVG
- WebP
- GIF

## Image Keys

Add your images with meaningful names:
- `app-logo.png` - Application logo
- `hero-banner.jpg` - Hero section banner
- `team-photo.jpg` - Team photo
- `product-demo.png` - Product demonstration
- etc.
