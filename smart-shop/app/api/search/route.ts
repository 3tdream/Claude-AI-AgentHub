import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/content'
import { getLLM } from '@/lib/ai/llm'

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // Get all products
    const products = await getProducts()

    // Create product context for AI
    const productContext = products
      .map(
        (p) =>
          `ID: ${p.id}, Title: ${p.title}, Description: ${p.description}, Price: $${p.price.amount}, Category: ${p.category}, Tags: ${p.tags.join(', ')}`
      )
      .join('\n')

    // Use AI to understand user intent and find relevant products
    const llm = getLLM()

    const systemPrompt = `You are a helpful shopping assistant. The user is searching for products. Based on the user's query, identify the most relevant products from the catalog.

Available Products:
${productContext}

Your task:
1. Understand what the user is looking for
2. Return the IDs of the most relevant products (up to 5)
3. Respond ONLY with a JSON array of product IDs like: ["prod-001", "prod-002"]
4. If no products match, return an empty array: []

Be intelligent about matching:
- Consider synonyms (e.g., "headphones" matches "earbuds", "audio")
- Consider use cases (e.g., "work from home" matches "desk", "chair", "laptop")
- Consider price ranges if mentioned
- Consider categories and features`

    const response = await llm.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query },
    ])

    // Parse AI response
    let productIds: string[] = []
    try {
      // Extract JSON array from response
      const jsonMatch = response.match(/\[.*?\]/)
      if (jsonMatch) {
        productIds = JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error)
    }

    // Filter products based on AI recommendations
    const results = products.filter((p) => productIds.includes(p.id))

    // If AI didn't find anything, fall back to basic text search
    if (results.length === 0) {
      const searchLower = query.toLowerCase()
      const fallbackResults = products.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      )

      return NextResponse.json({
        results: fallbackResults.slice(0, 5),
        aiPowered: false,
        query,
      })
    }

    return NextResponse.json({
      results,
      aiPowered: true,
      query,
    })
  } catch (error) {
    console.error('Search error:', error)

    // Fallback to basic search if AI fails
    try {
      const { query } = await request.json()
      const products = await getProducts()
      const searchLower = query.toLowerCase()

      const results = products.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      )

      return NextResponse.json({
        results: results.slice(0, 5),
        aiPowered: false,
        query,
      })
    } catch (fallbackError) {
      return NextResponse.json(
        { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }
  }
}
