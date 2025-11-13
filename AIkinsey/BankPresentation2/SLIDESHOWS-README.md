# Dynamic Slideshow System

Your slideshow system is now live! You can create and view multiple presentations dynamically.

## How to Access

### View All Slideshows
Open your browser to: **http://localhost:3001/**

This will show a beautiful gallery of all available slideshows.

### View a Specific Slideshow
Navigate to: **http://localhost:3001/slideshow-name**

For example:
- http://localhost:3001/light-theme
- http://localhost:3001/dark-theme

## File Structure

```
public/slideshows/
├── manifest.json          # List of all slideshows
├── light-theme.json       # Light theme example
└── dark-theme.json        # Dark theme example

assets/
└── images/                # Place your images here
    ├── app-logo.png
    ├── hero-banner.jpg
    └── product-demo.png
```

## How to Create a New Slideshow

### Step 1: Create Your JSON File

Create a new file in `public/slideshows/` with your slideshow name:
```
public/slideshows/my-presentation.json
```

Use the examples (`light-theme.json` or `dark-theme.json`) as templates.

### Step 2: Update the Manifest

Edit `public/slideshows/manifest.json` and add your slideshow:

```json
{
  "slideshows": [
    {
      "id": "my-presentation",
      "name": "My Amazing Presentation",
      "description": "Description of your presentation",
      "theme": "light",
      "slides": 10
    }
  ]
}
```

### Step 3: Access Your Slideshow

Navigate to: **http://localhost:3001/my-presentation**

## Features

### Navigation
- **Keyboard**: Use arrow keys or spacebar to navigate
- **Mouse**: Click Previous/Next buttons
- **Home**: Press ESC or click "Home" button to return to gallery

### Customization
Each slideshow JSON supports:
- ✨ Custom theme colors
- 🎨 6 different layout types
- 🎬 5 animation effects
- 🖼️ Image loading by key
- 🎯 Per-slide customization

### Layout Types
1. **centered** - Title slides and key messages
2. **split-left** - Image on left, content on right
3. **split-right** - Content on left, image on right
4. **minimal** - Clean, spacious layout
5. **image-focus** - Large image with caption
6. **grid** - Responsive grid layout

### Animation Effects
- `fade` - Simple fade transition
- `slide-right` - Slide from right
- `slide-left` - Slide from left
- `zoom` - Zoom effect
- `slide-bottom` - Slide from bottom

## Adding Images

1. Place images in `assets/images/`
2. Reference in JSON by filename (without extension):

```json
{
  "image": "my-photo"
}
```

This will load `assets/images/my-photo.png` (or .jpg, .svg, etc.)

## Example JSON Structure

```json
{
  "theme": {
    "name": "My Theme",
    "colors": {
      "primary": "#2563eb",
      "secondary": "#7c3aed",
      "background": "#ffffff",
      "text": "#1e293b"
    },
    "fonts": {
      "title": "'Inter', sans-serif",
      "body": "'Inter', sans-serif"
    }
  },
  "slides": [
    {
      "layout": "centered",
      "animation": "fade",
      "badge": "Introduction",
      "title": "Welcome",
      "subtitle": "Let's begin",
      "content": "Your content here"
    }
  ]
}
```

## Documentation

- **Complete Guide**: See `SLIDESHOW-GUIDE.md` for detailed documentation
- **Examples**: Check `public/slideshows/light-theme.json` and `dark-theme.json`
- **Assets Info**: See `assets/README.md` for image guidelines

## Quick Tips

1. **Start with a template** - Copy `light-theme.json` or `dark-theme.json`
2. **Test frequently** - The dev server auto-reloads on changes
3. **Use the manifest** - Keep it updated for the gallery to work
4. **Optimize images** - Keep images under 500KB for best performance
5. **Check colors** - Ensure good contrast for readability

## Troubleshooting

### Slideshow not appearing in gallery?
- Check that it's listed in `manifest.json`
- Verify the `id` matches the filename (without .json)

### Images not loading?
- Ensure files are in `assets/images/`
- Check filename matches the key in JSON
- Try different image formats (png, jpg, svg)

### Changes not showing?
- Save your JSON file
- Vite will auto-reload (check the terminal)
- Refresh your browser if needed

## Development Server

The server is running at: **http://localhost:3001/**

To stop the server, press `Ctrl+C` in the terminal.

## Next Steps

1. Browse the gallery at http://localhost:3001/
2. Try the example presentations
3. Create your own slideshow using the templates
4. Read `SLIDESHOW-GUIDE.md` for advanced customization

Enjoy creating beautiful presentations! 🎉
