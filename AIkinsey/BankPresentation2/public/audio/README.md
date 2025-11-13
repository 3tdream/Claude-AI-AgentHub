# Audio Files

This folder contains audio/sound files for the presentation.

## Background Music

To add background music to your presentation:

1. **Add your audio file here** with one of these names:
   - `background-music.mp3` (recommended - best browser compatibility)
   - `background-music.ogg` (fallback format)

2. **The audio will automatically:**
   - Loop continuously during the presentation
   - Play in the background across all slides
   - Have a mute/unmute button in the top-left corner

## Current Setup

- **Fallback:** If no local file is found, the presentation uses an online royalty-free track
- **Location:** `public/audio/`
- **Access:** Files in this folder are served at `/audio/[filename]`

## Supported Formats

- **MP3** - Best compatibility across all browsers
- **OGG** - Good compression, supported by most modern browsers
- **WAV** - Uncompressed, larger file size

## Example

```
public/audio/
├── background-music.mp3    ← Your audio file goes here
└── README.md               ← This file
```

## Notes

- Due to browser autoplay policies, users may need to click the volume button to start playback
- Recommended: Use background music that is 2-3 minutes long (will loop automatically)
- Keep file size reasonable (< 5MB recommended) for faster loading
