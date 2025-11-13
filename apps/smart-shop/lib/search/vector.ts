import { getProducts, type Product } from '../content'

// Simple text tokenizer
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2)
}

// Create a simple TF-IDF-like vector
function createVector(text: string, vocabulary: Set<string>): number[] {
  const tokens = tokenize(text)
  const termFreq = new Map<string, number>()

  tokens.forEach((token) => {
    termFreq.set(token, (termFreq.get(token) || 0) + 1)
  })

  return Array.from(vocabulary).map((term) => termFreq.get(term) || 0)
}

// Cosine similarity
function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) return 0

  let dotProduct = 0
  let mag1 = 0
  let mag2 = 0

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i]
    mag1 += vec1[i] * vec1[i]
    mag2 += vec2[i] * vec2[i]
  }

  mag1 = Math.sqrt(mag1)
  mag2 = Math.sqrt(mag2)

  if (mag1 === 0 || mag2 === 0) return 0

  return dotProduct / (mag1 * mag2)
}

export async function searchProducts(query: string, limit = 10): Promise<Product[]> {
  const products = await getProducts()

  // Build vocabulary from all products
  const allText = products.map((p) =>
    [p.title, p.description, p.shortDescription || '', ...p.tags].join(' ')
  )
  const vocabulary = new Set<string>()

  allText.forEach((text) => {
    tokenize(text).forEach((token) => vocabulary.add(token))
  })

  // Create query vector
  const queryVector = createVector(query, vocabulary)

  // Calculate similarity for each product
  const scored = products.map((product) => {
    const productText = [
      product.title,
      product.description,
      product.shortDescription || '',
      ...product.tags,
    ].join(' ')

    const productVector = createVector(productText, vocabulary)
    const score = cosineSimilarity(queryVector, productVector)

    return { product, score }
  })

  // Sort by score and return top results
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.product)
}

export async function findSimilarProducts(productId: string, limit = 4): Promise<Product[]> {
  const products = await getProducts()
  const targetProduct = products.find((p) => p.id === productId)

  if (!targetProduct) return []

  const query = [targetProduct.title, ...targetProduct.tags].join(' ')
  const results = await searchProducts(query, limit + 1)

  // Filter out the target product itself
  return results.filter((p) => p.id !== productId).slice(0, limit)
}
