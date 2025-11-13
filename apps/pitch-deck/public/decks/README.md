# Pitch Decks Directory

This directory contains all pitch deck data files in JSON format. Each deck is stored as a separate file for easy management and AI agent access.

## 📁 Structure

```
public/decks/
├── manifest.json                    # Index of all available decks
├── README.md                        # This file
├── techventure-ai.json             # TechVenture AI Platform deck
├── ecoflow-sustainability.json     # EcoFlow Sustainability deck
└── healthpro-telemedicine.json     # HealthPro Telemedicine deck
```

## 🤖 For AI Agents

### Adding a New Deck

1. **Create a new JSON file** in this directory with a descriptive filename (use kebab-case)
2. **Follow the deck schema** (see example below)
3. **Update manifest.json** with the new deck entry
4. **Increment the ID** to the next available number

### Deck Schema

```json
{
  "id": 4,
  "title": "Your Company Name",
  "description": "Brief description of your company",
  "date": "Oct 28, 2025",
  "slideCount": 7,
  "colorScheme": {
    "primary": "bg-gradient-to-br from-purple-600 to-pink-600",
    "secondary": "bg-purple-50",
    "accent": "text-purple-600",
    "button": "bg-purple-600 hover:bg-purple-700"
  },
  "slides": [
    {
      "type": "title",
      "title": "Company Name",
      "subtitle": "Tagline",
      "content": "Mission statement"
    },
    {
      "type": "problem",
      "title": "The Problem",
      "points": [
        "Pain point 1",
        "Pain point 2",
        "Pain point 3"
      ]
    },
    {
      "type": "solution",
      "title": "Our Solution",
      "description": "Description of your solution",
      "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"]
    },
    {
      "type": "market",
      "title": "Market Opportunity",
      "stat": "$25B",
      "description": "Total Addressable Market",
      "details": "Growth details"
    },
    {
      "type": "traction",
      "title": "Traction",
      "metrics": [
        { "label": "Metric 1", "value": "10K+" },
        { "label": "Metric 2", "value": "$500K ARR" },
        { "label": "Metric 3", "value": "50% MoM" },
        { "label": "Metric 4", "value": "95%" }
      ]
    },
    {
      "type": "business",
      "title": "Business Model",
      "tiers": [
        { "name": "Basic", "price": "$49/mo", "users": "Small teams" },
        { "name": "Pro", "price": "$199/mo", "users": "Growing companies" },
        { "name": "Enterprise", "price": "Custom", "users": "Large organizations" }
      ]
    },
    {
      "type": "ask",
      "title": "The Ask",
      "amount": "$2M Seed",
      "usage": "Product Development • Marketing • Hiring",
      "goal": "Achieve profitability by Q4 2026"
    }
  ]
}
```

## 📊 Slide Types

### 1. Title Slide
```json
{
  "type": "title",
  "title": "Company Name",
  "subtitle": "Tagline",
  "content": "Mission statement"
}
```

### 2. Problem Slide
```json
{
  "type": "problem",
  "title": "The Problem",
  "points": ["Pain point 1", "Pain point 2", "..."]
}
```

### 3. Solution Slide
```json
{
  "type": "solution",
  "title": "Our Solution",
  "description": "Solution description",
  "features": ["Feature 1", "Feature 2", "..."]
}
```

### 4. Market Slide
```json
{
  "type": "market",
  "title": "Market Opportunity",
  "stat": "$50B",
  "description": "TAM Description",
  "details": "Growth details"
}
```

### 5. Business Model Slide
```json
{
  "type": "business",
  "title": "Business Model",
  "tiers": [
    { "name": "Tier Name", "price": "$XX/mo", "users": "Description" }
  ]
}
```

### 6. Traction Slide
```json
{
  "type": "traction",
  "title": "Traction",
  "metrics": [
    { "label": "Label", "value": "Value" }
  ]
}
```

### 7. Team Slide
```json
{
  "type": "team",
  "title": "Team",
  "members": [
    { "name": "Name", "role": "Role", "background": "Background" }
  ]
}
```

### 8. Ask Slide
```json
{
  "type": "ask",
  "title": "The Ask",
  "amount": "$XM Series Y",
  "usage": "Usage description",
  "goal": "Goal statement"
}
```

## 🎨 Color Schemes

Choose from existing gradients or create custom ones:

```
Blue-Purple:    from-blue-600 to-purple-700
Green-Teal:     from-green-600 to-teal-600
Rose-Orange:    from-rose-600 to-orange-600
Indigo-Pink:    from-indigo-600 via-purple-600 to-pink-600
Emerald-Cyan:   from-emerald-600 to-cyan-600
Amber-Red:      from-amber-600 to-red-600
Violet-Fuchsia: from-violet-600 to-fuchsia-600
```

## 🔄 Updating Manifest

After adding a new deck file, update `manifest.json`:

```json
{
  "decks": [
    {
      "id": 4,
      "filename": "your-deck-name.json",
      "title": "Your Company Name",
      "description": "Brief description",
      "category": "Industry/Category",
      "tags": ["tag1", "tag2", "tag3"],
      "featured": false
    }
  ]
}
```

## 📝 Best Practices

1. **Use descriptive filenames** (e.g., `saas-platform.json`, not `deck1.json`)
2. **Keep descriptions concise** (1-2 sentences max)
3. **Maintain consistent formatting** (use 2-space indentation)
4. **Validate JSON** before committing (use a JSON validator)
5. **Update slideCount** to match the actual number of slides
6. **Use appropriate color schemes** that match the company/industry

## 🚀 Quick Start for AI Agents

```bash
# 1. Copy an existing deck as template
cp techventure-ai.json my-new-deck.json

# 2. Edit the new deck with your content
# (modify id, title, description, slides, etc.)

# 3. Add entry to manifest.json

# 4. Done! The app will automatically load the new deck
```

## 📞 Need Help?

- Check existing deck files for examples
- Refer to the main README.md in the project root
- Review the TypeScript types in `/types/deck.ts`
