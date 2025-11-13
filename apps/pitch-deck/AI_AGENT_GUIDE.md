# AI Agent Guide - Pitch Deck Management

This guide explains how AI agents can interact with the pitch deck system to create, modify, and manage pitch decks.

## 📂 File Organization

Each pitch deck is stored as a **separate JSON file** in the `/public/decks/` directory. This design makes it easy for AI agents to:

- ✅ Read individual decks without loading all decks
- ✅ Create new decks by adding new JSON files
- ✅ Modify existing decks by editing JSON files
- ✅ Delete decks by removing JSON files
- ✅ Discover all available decks via the manifest

## 🗂️ Directory Structure

```
public/decks/
├── manifest.json                   # Index of all decks (UPDATE THIS!)
├── README.md                       # Documentation for this folder
├── techventure-ai.json            # Individual deck files
├── ecoflow-sustainability.json
├── healthpro-telemedicine.json
└── [your-new-deck].json           # Add new decks here
```

## 🤖 Quick Start for AI Agents

### 1. Creating a New Deck

**Step 1:** Create a new JSON file in `/public/decks/`

```bash
# Use descriptive kebab-case names
touch public/decks/my-startup-name.json
```

**Step 2:** Add deck content following the schema (see below)

**Step 3:** Update `manifest.json` with the new deck entry

```json
{
  "id": 4,
  "filename": "my-startup-name.json",
  "title": "My Startup Name",
  "description": "Brief description",
  "category": "Category",
  "tags": ["tag1", "tag2"],
  "featured": false
}
```

**Step 4:** Done! The app will automatically load it

### 2. Modifying an Existing Deck

```bash
# 1. Read the existing deck
cat public/decks/techventure-ai.json

# 2. Edit the JSON file
# Modify any fields: title, slides, colors, etc.

# 3. Save the file
# The changes will be reflected immediately
```

### 3. Listing All Decks

```bash
# Read the manifest to see all available decks
cat public/decks/manifest.json
```

## 📋 Complete Deck Schema

```json
{
  "id": 1,
  "title": "Company Name",
  "description": "One-line pitch description",
  "date": "Oct 28, 2025",
  "slideCount": 8,
  "colorScheme": {
    "primary": "bg-gradient-to-br from-blue-600 to-purple-700",
    "secondary": "bg-blue-50",
    "accent": "text-blue-600",
    "button": "bg-blue-600 hover:bg-blue-700"
  },
  "slides": [
    {
      "type": "title",
      "title": "Company Name",
      "subtitle": "Tagline / Value Proposition",
      "content": "Mission Statement"
    },
    {
      "type": "problem",
      "title": "The Problem",
      "points": [
        "Pain point 1",
        "Pain point 2",
        "Pain point 3",
        "Pain point 4"
      ]
    },
    {
      "type": "solution",
      "title": "Our Solution",
      "description": "Explain how your product solves the problem",
      "features": [
        "Key Feature 1",
        "Key Feature 2",
        "Key Feature 3",
        "Key Feature 4"
      ]
    },
    {
      "type": "market",
      "title": "Market Opportunity",
      "stat": "$50B",
      "description": "Total Addressable Market",
      "details": "Market growth rate and trends"
    },
    {
      "type": "business",
      "title": "Business Model",
      "tiers": [
        {
          "name": "Basic",
          "price": "$49/mo",
          "users": "For small teams"
        },
        {
          "name": "Pro",
          "price": "$199/mo",
          "users": "For growing companies"
        },
        {
          "name": "Enterprise",
          "price": "Custom",
          "users": "For large organizations"
        }
      ]
    },
    {
      "type": "traction",
      "title": "Traction",
      "metrics": [
        { "label": "Users", "value": "10K+" },
        { "label": "Revenue", "value": "$2M ARR" },
        { "label": "Growth", "value": "40% MoM" },
        { "label": "NPS", "value": "85" }
      ]
    },
    {
      "type": "team",
      "title": "Team",
      "members": [
        {
          "name": "Founder Name",
          "role": "CEO",
          "background": "Previous experience / credentials"
        },
        {
          "name": "Co-founder Name",
          "role": "CTO",
          "background": "Technical background"
        },
        {
          "name": "Team Member",
          "role": "CPO",
          "background": "Product experience"
        }
      ]
    },
    {
      "type": "ask",
      "title": "The Ask",
      "amount": "$5M Series A",
      "usage": "Product Development • Sales & Marketing • Team Growth",
      "goal": "Achieve [specific milestone] by [date]"
    }
  ]
}
```

## 🎨 Color Scheme Options

Choose a gradient that matches your brand or industry:

```json
// Tech / AI
{
  "primary": "bg-gradient-to-br from-blue-600 to-purple-700",
  "secondary": "bg-blue-50",
  "accent": "text-blue-600",
  "button": "bg-blue-600 hover:bg-blue-700"
}

// Sustainability / Eco
{
  "primary": "bg-gradient-to-br from-green-600 to-teal-600",
  "secondary": "bg-green-50",
  "accent": "text-green-600",
  "button": "bg-green-600 hover:bg-green-700"
}

// Healthcare / Wellness
{
  "primary": "bg-gradient-to-br from-rose-600 to-orange-600",
  "secondary": "bg-rose-50",
  "accent": "text-rose-600",
  "button": "bg-rose-600 hover:bg-rose-700"
}

// Creative / Design
{
  "primary": "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600",
  "secondary": "bg-indigo-50",
  "accent": "text-indigo-600",
  "button": "bg-indigo-600 hover:bg-indigo-700"
}

// Fintech / Professional
{
  "primary": "bg-gradient-to-br from-slate-700 to-slate-900",
  "secondary": "bg-slate-50",
  "accent": "text-slate-700",
  "button": "bg-slate-700 hover:bg-slate-800"
}

// E-commerce / Retail
{
  "primary": "bg-gradient-to-br from-amber-600 to-red-600",
  "secondary": "bg-amber-50",
  "accent": "text-amber-600",
  "button": "bg-amber-600 hover:bg-amber-700"
}

// Enterprise / B2B
{
  "primary": "bg-gradient-to-br from-violet-600 to-fuchsia-600",
  "secondary": "bg-violet-50",
  "accent": "text-violet-600",
  "button": "bg-violet-600 hover:bg-violet-700"
}
```

## 📊 Slide Type Details

### 1. Title Slide (Required)
Opening slide with company name and tagline
```json
{
  "type": "title",
  "title": "Company Name",
  "subtitle": "Your Value Proposition",
  "content": "Mission or tagline"
}
```

### 2. Problem Slide (Recommended)
Describe the pain points your product addresses
```json
{
  "type": "problem",
  "title": "The Problem",
  "points": ["Pain 1", "Pain 2", "Pain 3", "Pain 4"]
}
```

### 3. Solution Slide (Required)
Explain your product/service
```json
{
  "type": "solution",
  "title": "Our Solution",
  "description": "How you solve the problem",
  "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"]
}
```

### 4. Market Slide (Recommended)
Show market size and opportunity
```json
{
  "type": "market",
  "title": "Market Opportunity",
  "stat": "$50B",
  "description": "TAM/SAM/SOM",
  "details": "Growth rate and trends"
}
```

### 5. Business Model Slide (Recommended)
Explain how you make money
```json
{
  "type": "business",
  "title": "Business Model",
  "tiers": [
    { "name": "Tier 1", "price": "$XX/mo", "users": "Description" },
    { "name": "Tier 2", "price": "$XXX/mo", "users": "Description" },
    { "name": "Tier 3", "price": "Custom", "users": "Description" }
  ]
}
```

### 6. Traction Slide (Important)
Show metrics and progress
```json
{
  "type": "traction",
  "title": "Traction",
  "metrics": [
    { "label": "Metric 1", "value": "10K+" },
    { "label": "Metric 2", "value": "$2M ARR" },
    { "label": "Metric 3", "value": "40% MoM" },
    { "label": "Metric 4", "value": "95%" }
  ]
}
```

### 7. Team Slide (Optional)
Introduce key team members
```json
{
  "type": "team",
  "title": "Team",
  "members": [
    { "name": "Name", "role": "Role", "background": "Credentials" }
  ]
}
```

### 8. Ask Slide (Required for fundraising)
State your funding ask
```json
{
  "type": "ask",
  "title": "The Ask",
  "amount": "$XM Series Y",
  "usage": "How funds will be used",
  "goal": "What you'll achieve"
}
```

## ✅ Validation Checklist

Before adding a new deck, verify:

- [ ] JSON is valid (no syntax errors)
- [ ] All required fields are present
- [ ] `id` is unique and sequential
- [ ] `slideCount` matches actual number of slides
- [ ] Color scheme uses valid Tailwind classes
- [ ] Filename uses kebab-case (no spaces)
- [ ] Entry added to `manifest.json`
- [ ] File saved in `/public/decks/` directory

## 🔧 Testing Your Deck

```bash
# 1. Validate JSON syntax
cat public/decks/your-deck.json | jq .

# 2. Check if deck loads in browser
# Open: http://localhost:3004
# The deck should appear in the home view

# 3. Test all slides
# Click on the deck and navigate through slides
```

## 🚀 Automation Tips for AI Agents

### Template Generation
```bash
# Copy a template deck
cp public/decks/techventure-ai.json public/decks/new-deck.json

# Use sed or jq to replace placeholders
jq '.title = "New Company Name"' new-deck.json > temp.json
mv temp.json new-deck.json
```

### Batch Operations
```bash
# List all decks
ls public/decks/*.json

# Count decks
ls public/decks/*.json | wc -l

# Search for specific content
grep -r "AI-powered" public/decks/
```

### Manifest Management
```bash
# Add new deck to manifest
jq '.decks += [{"id": 4, "filename": "new-deck.json", ...}]' manifest.json
```

## 📞 Need Help?

- Check `/public/decks/README.md` for detailed examples
- Review existing deck files for reference
- See `/types/deck.ts` for TypeScript type definitions
- Check the main `README.md` for app-level documentation

## 🎯 Best Practices

1. **Descriptive Filenames**: Use clear, searchable names
2. **Consistent Formatting**: Use 2-space indentation
3. **Update Manifest**: Always add entries to manifest.json
4. **Test Locally**: Verify deck loads before committing
5. **Meaningful Data**: Use realistic content, not placeholders
6. **Proper Metrics**: Use actual numbers when possible
7. **Professional Tone**: Keep language clear and professional

---

**Happy Deck Creating! 🚀**
