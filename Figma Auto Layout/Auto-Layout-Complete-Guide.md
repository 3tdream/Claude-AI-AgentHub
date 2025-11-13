# Figma Auto Layout: Complete Guide

## What is Auto Layout?

Auto Layout is a powerful Figma feature that allows frames to automatically resize and reposition their contents based on predefined rules. Think of it as a smart container that adapts to its content, similar to flexbox in CSS.

---

## How to Activate Auto Layout

### Method 1: Using the Keyboard Shortcut
1. Select any frame, group, or multiple objects
2. Press **Shift + A** (Windows/Mac)
3. The frame will instantly convert to an Auto Layout frame

### Method 2: Using the Right Sidebar
1. Select your frame or objects
2. Look at the right sidebar (Design panel)
3. Find the "Auto Layout" section
4. Click the **+ button** next to "Auto Layout"

### Method 3: Using the Top Toolbar
1. Select your objects
2. Click the **"+"** icon in the top toolbar
3. Select **"Add Auto Layout"** from the dropdown

### Visual Indicator
Once activated, you'll see a **purple outline** around your frame and purple resize handles, indicating Auto Layout is active.

---

## Key Auto Layout Properties

Once activated, you can configure these properties in the right sidebar:

| Property | Description |
|----------|-------------|
| **Direction** | Horizontal or Vertical stacking |
| **Spacing** | Gap between child elements |
| **Padding** | Space inside the frame around content |
| **Alignment** | How items align within the container |
| **Resizing** | How the frame responds to content changes |

---

## Demo Case 1: Responsive Button

### Use Case
Creating a button that automatically adjusts its width based on text length.

### Steps:
1. Create a text layer with "Click Me"
2. Select the text and press **Shift + A**
3. Set the following properties:
   - **Padding**: 16px horizontal, 12px vertical
   - **Alignment**: Center
   - **Fill**: Your button color
4. Add corner radius (e.g., 8px)

### Result:
When you change the text from "Click Me" to "Submit Application", the button automatically expands to fit the new text while maintaining consistent padding.

### Why It's Useful:
- Maintains design consistency
- Speeds up button creation
- Easy to create button variations (Primary, Secondary, etc.)

---

## Demo Case 2: Navigation Bar

### Use Case
Building a horizontal navigation menu that spaces items evenly.

### Steps:
1. Create multiple text layers (Home, About, Services, Contact)
2. Select all text layers
3. Press **Shift + A** to create Auto Layout
4. Configure:
   - **Direction**: Horizontal
   - **Spacing**: 32px between items
   - **Padding**: 20px all around
   - **Alignment**: Center

### Result:
A perfectly spaced navigation bar. Add or remove menu items, and spacing adjusts automatically.

### Why It's Useful:
- Consistent spacing without manual adjustment
- Easy to add/remove navigation items
- Quick to create responsive variations

---

## Demo Case 3: Card Component

### Use Case
Designing a card with image, title, description, and button that maintains structure regardless of content length.

### Steps:
1. Create these elements:
   - Image placeholder (rectangle)
   - Title text
   - Description text
   - Button (already with Auto Layout from Demo 1)

2. Select all elements and press **Shift + A**
3. Configure:
   - **Direction**: Vertical
   - **Spacing**: 16px between elements
   - **Padding**: 24px all around
   - **Width**: Fixed (e.g., 320px)

### Result:
The card height automatically adjusts when:
- Description text is longer or shorter
- You add more elements
- You change image height

### Why It's Useful:
- Perfect for design systems
- Cards automatically adapt to different content
- Maintains vertical rhythm

---

## Demo Case 4: Form with Labels and Inputs

### Use Case
Creating a form where each field (label + input) is consistently spaced.

### Steps:
1. Create a label text and input field rectangle
2. Select both, press **Shift + A**
3. Configure this pair:
   - **Direction**: Vertical
   - **Spacing**: 8px
   - **Alignment**: Left

4. Create multiple field pairs (Name, Email, Password)
5. Select all field groups and press **Shift + A** again
6. Configure the container:
   - **Direction**: Vertical
   - **Spacing**: 24px between fields
   - **Padding**: 32px

### Result:
A perfectly structured form. Add or remove fields, and everything stays aligned and properly spaced.

### Why It's Useful:
- Rapid form prototyping
- Consistent field spacing
- Easy to maintain and update

---

## Demo Case 5: List with Dynamic Items

### Use Case
Creating a list (like a task list or message thread) where items can be added or removed.

### Steps:
1. Create one list item with:
   - Icon/checkbox
   - Text content
   - Delete button
2. Select all parts and press **Shift + A**
3. Configure:
   - **Direction**: Horizontal
   - **Spacing**: 12px
   - **Padding**: 16px
   - **Alignment**: Center vertically

4. Duplicate this item 3-4 times
5. Select all items and press **Shift + A**
6. Configure the list container:
   - **Direction**: Vertical
   - **Spacing**: 8px

### Result:
Add items by duplicating—everything automatically stacks. Delete items, and the list adjusts perfectly.

### Why It's Useful:
- Perfect for to-do lists, chat interfaces, menu items
- Instant updates when content changes
- Professional, consistent appearance

---

## Pro Tips

**Nested Auto Layouts**: You can nest Auto Layout frames inside each other for complex, responsive designs.

**Hug Contents**: Set frame resizing to "Hug contents" to make the frame size automatically match its content.

**Fill Container**: Set child elements to "Fill container" to make them expand to available space.

**Absolute Position**: Hold **Alt** (Windows) or **Option** (Mac) while placing an element to keep it in absolute position (won't follow Auto Layout rules).

**Keyboard Shortcuts**:
- `Shift + A` - Add Auto Layout
- `Alt + Arrow Keys` - Adjust spacing between items
- `Shift + Arrow Keys` - Adjust padding

---

## Common Use Cases Summary

✓ Buttons and form elements
✓ Navigation menus and toolbars
✓ Cards and content containers
✓ Lists and repeating elements
✓ Responsive layouts
✓ Design system components
✓ Mobile and web interfaces

---

## Practice Exercise

Try creating a mobile app screen with:
1. A header (logo + menu icon) using horizontal Auto Layout
2. A scrollable content area with cards using vertical Auto Layout
3. Each card with nested Auto Layout for its internal structure
4. A bottom navigation bar with icons using horizontal Auto Layout

This will help you understand how Auto Layout creates flexible, maintainable designs!

---

## Troubleshooting

**Problem**: Elements overlapping or not spacing correctly
**Solution**: Check that parent frame has Auto Layout enabled and spacing is set correctly

**Problem**: Frame not resizing with content
**Solution**: Ensure frame resizing is set to "Hug contents" instead of "Fixed"

**Problem**: One element taking up too much space
**Solution**: Check individual element resizing settings—change from "Fill container" to "Hug contents" or "Fixed"

---

## Additional Resources

- [Figma Auto Layout Documentation](https://help.figma.com/hc/en-us/articles/360040451373)
- Practice with Figma's community files
- Watch Figma's official Auto Layout tutorials on YouTube

---

**Created for UX/UI Design Students**
*Master Auto Layout to speed up your design workflow and create more maintainable, responsive designs!*
