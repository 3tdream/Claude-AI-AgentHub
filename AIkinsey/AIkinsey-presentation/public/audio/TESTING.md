# Audio Testing Guide

## Quick Test

### Option 1: Download Free Test Audio

1. **Download a free audio file** from:
   - [Pixabay Music](https://pixabay.com/music/) - No attribution required
   - [Free Music Archive](https://freemusicarchive.org/)
   - [Incompetech](https://incompetech.com/)

2. **Rename the file** to `background-music.mp3`

3. **Place it in this folder**: `public/audio/background-music.mp3`

4. **Refresh the browser** and click the sound icon (Volume icon in top-right)

### Option 2: Use the Audio Manager (NEW!)

1. **Open the presentation** in your browser (http://localhost:3003)

2. **Click the Music icon** (🎵) in the top navigation bar

3. **Click "Browse Files"** and select an audio file from your computer

4. **Preview the audio** by clicking the Play button

5. **Select the file** you want to use

6. **Click "Save Settings"**

7. **Refresh the page** to apply changes

8. **Click the Volume icon** to play/pause the audio

## Testing Checklist

- [ ] Audio Manager opens when clicking Music icon
- [ ] Can browse and select audio files
- [ ] Audio preview plays when clicking Play button
- [ ] Selected file is highlighted
- [ ] Save button works without errors
- [ ] Toast notifications appear (success/error)
- [ ] Volume icon toggles between mute/unmute
- [ ] Audio plays when clicking Volume icon
- [ ] Audio loops continuously
- [ ] Audio persists across page navigation

## Common Issues

### "No audio files found"
- **Solution**: Click "Browse Files" and select an audio file, or place `background-music.mp3` in this folder

### Audio doesn't play
- **Check**: Browser autoplay policy may block audio
- **Solution**: User must interact with page first (click volume button)

### 404 errors for audio files
- **Normal**: This is expected if no audio files exist yet
- **Solution**: Add audio files using Audio Manager or manually

### File size too large
- **Limit**: Max 10MB for smooth performance
- **Solution**: Compress audio to 128kbps or lower bitrate

## Recommended Audio Specifications

- **Format**: MP3 (best compatibility)
- **Bitrate**: 128kbps (good quality, small size)
- **Sample Rate**: 44.1kHz
- **Duration**: 2-5 minutes (longer = larger file)
- **Type**: Instrumental background music (no vocals)
- **Mood**: Professional, upbeat, motivational

## Free Music Suggestions

### For Investor Pitch Presentations:
- "Corporate Success" style tracks
- "Inspirational Technology" themes
- "Upbeat Business" instrumentals
- "Minimal Ambient" backgrounds

### Recommended Tracks:
1. "Corporate Technology" by Infraction
2. "Inspiring Corporate" by Rafael Krux
3. "Successful" by AudioCoffee
4. "Technology Innovation" by Corporatus

## Browser Compatibility

✅ Chrome/Edge: Full support
✅ Firefox: Full support
✅ Safari: Full support (may require user interaction)
✅ Opera: Full support

## Next Steps

After adding audio:
1. Test on different browsers
2. Test on mobile devices
3. Adjust volume if needed
4. Consider adding multiple tracks
5. Test with presentation flow
