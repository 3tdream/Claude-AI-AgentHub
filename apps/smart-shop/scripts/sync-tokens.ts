#!/usr/bin/env tsx

import * as fs from 'fs/promises'
import * as path from 'path'
import { DesignTokensSchema } from '../lib/schemas/design-tokens'

async function syncTokens() {
  console.log('🎨 Syncing design tokens...')

  try {
    // Read design tokens
    const tokensPath = path.join(process.cwd(), 'content', 'design-tokens.json')
    const tokensContent = await fs.readFile(tokensPath, 'utf-8')
    const tokens = DesignTokensSchema.parse(JSON.parse(tokensContent))

    // Generate CSS variables
    const cssVars: string[] = [':root {']

    // Add typography tokens
    cssVars.push(`  --font-sans: ${tokens.typography.fontFamily.sans};`)
    cssVars.push(`  --font-heading: ${tokens.typography.fontFamily.heading};`)
    if (tokens.typography.fontFamily.mono) {
      cssVars.push(`  --font-mono: ${tokens.typography.fontFamily.mono};`)
    }

    // Add spacing tokens
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      cssVars.push(`  --spacing-${key}: ${value};`)
    })

    // Add radius token
    cssVars.push(`  --radius: ${tokens.radius.lg};`)

    // Add shadow tokens
    Object.entries(tokens.shadows).forEach(([key, value]) => {
      cssVars.push(`  --shadow-${key}: ${value};`)
    })

    // Add motion tokens
    Object.entries(tokens.motion.duration).forEach(([key, value]) => {
      cssVars.push(`  --duration-${key}: ${value};`)
    })
    Object.entries(tokens.motion.ease).forEach(([key, value]) => {
      cssVars.push(`  --ease-${key}: ${value};`)
    })

    cssVars.push('}')
    cssVars.push('')

    // Generate theme-specific color variables
    tokens.themes.forEach((theme) => {
      const selector = theme.name === 'light' ? ':root' : `[data-theme="${theme.name}"]`
      cssVars.push(`${selector} {`)

      Object.entries(theme.colors).forEach(([key, value]) => {
        cssVars.push(`  --${key}: ${value};`)
      })

      cssVars.push('}')
      cssVars.push('')
    })

    // Write to globals.css
    const globalsPath = path.join(process.cwd(), 'app', 'globals.css')
    const existingCss = await fs.readFile(globalsPath, 'utf-8').catch(() => '')

    // Remove old token section
    const tokenStart = '/* Design Tokens - Auto-generated */'
    const tokenEnd = '/* End Design Tokens */'
    let newCss = existingCss
    const startIndex = existingCss.indexOf(tokenStart)
    const endIndex = existingCss.indexOf(tokenEnd)

    if (startIndex !== -1 && endIndex !== -1) {
      newCss =
        existingCss.substring(0, startIndex) +
        existingCss.substring(endIndex + tokenEnd.length)
    }

    // Add new tokens
    const tokenSection = `${tokenStart}\n${cssVars.join('\n')}\n${tokenEnd}\n`
    newCss = tokenSection + newCss

    await fs.writeFile(globalsPath, newCss)

    console.log('✅ Design tokens synced successfully!')
    console.log(`   - ${tokens.themes.length} themes`)
    console.log(`   - ${Object.keys(tokens.spacing).length} spacing tokens`)
    console.log(`   - ${Object.keys(tokens.radius).length} radius tokens`)
  } catch (error) {
    console.error('❌ Error syncing tokens:', error)
    process.exit(1)
  }
}

syncTokens()
