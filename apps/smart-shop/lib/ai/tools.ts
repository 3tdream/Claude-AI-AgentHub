import { getProducts, getProduct, getPage } from '../content'
import { searchProducts } from '../search/vector'

export interface Tool {
  name: string
  description: string
  parameters: Record<string, any>
  execute: (args: Record<string, any>) => Promise<any>
}

export const tools: Tool[] = [
  {
    name: 'searchProducts',
    description:
      'Search for products by keywords. Returns relevant products matching the query.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (e.g., "wireless headphones", "yoga mat")',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return',
          default: 5,
        },
      },
      required: ['query'],
    },
    execute: async (args) => {
      const results = await searchProducts(args.query, args.limit || 5)
      return results.map((r) => ({
        id: r.id,
        title: r.title,
        price: r.price.amount,
        category: r.category,
        tags: r.tags,
        available: r.available,
      }))
    },
  },
  {
    name: 'getProduct',
    description: 'Get detailed information about a specific product by its ID or slug.',
    parameters: {
      type: 'object',
      properties: {
        identifier: {
          type: 'string',
          description: 'Product ID or slug',
        },
      },
      required: ['identifier'],
    },
    execute: async (args) => {
      const product = await getProduct(args.identifier)
      if (!product) return { error: 'Product not found' }
      return {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        specs: product.specs,
        variants: product.variants,
        tags: product.tags,
        stock: product.stock,
        available: product.available,
      }
    },
  },
  {
    name: 'analyzePage',
    description: 'Analyze a CMS page structure, layout, and blocks.',
    parameters: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'Page slug to analyze',
        },
      },
      required: ['slug'],
    },
    execute: async (args) => {
      const page = await getPage(args.slug)
      if (!page) return { error: 'Page not found' }
      return {
        title: page.title,
        layout: page.layout,
        blocks: page.blocks.map((b) => ({
          type: b.type,
          id: b.id,
        })),
      }
    },
  },
  {
    name: 'getSalesData',
    description: 'Get sales data for analysis (stub - returns mock data).',
    parameters: {
      type: 'object',
      properties: {
        range: {
          type: 'string',
          description: 'Date range (e.g., "7d", "30d", "90d")',
          default: '30d',
        },
      },
    },
    execute: async (args) => {
      // Mock sales data for demo
      const days = parseInt(args.range?.replace('d', '') || '30')
      const data = Array.from({ length: Math.min(days, 30) }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 5000) + 1000,
        orders: Math.floor(Math.random() * 50) + 10,
      })).reverse()

      return {
        range: args.range || '30d',
        data,
        summary: {
          totalRevenue: data.reduce((sum, d) => sum + d.revenue, 0),
          totalOrders: data.reduce((sum, d) => sum + d.orders, 0),
          avgOrderValue:
            data.reduce((sum, d) => sum + d.revenue, 0) /
            data.reduce((sum, d) => sum + d.orders, 0),
        },
      }
    },
  },
  {
    name: 'proposeChart',
    description: 'Propose a Recharts configuration for visualizing data.',
    parameters: {
      type: 'object',
      properties: {
        metric: {
          type: 'string',
          description: 'Metric to visualize (e.g., "revenue", "orders")',
        },
        chartType: {
          type: 'string',
          enum: ['line', 'bar', 'area', 'pie'],
          description: 'Type of chart',
        },
      },
      required: ['metric', 'chartType'],
    },
    execute: async (args) => {
      return {
        chartType: args.chartType,
        metric: args.metric,
        config: {
          xAxis: 'date',
          yAxis: args.metric,
          colors: ['#8884d8', '#82ca9d', '#ffc658'],
        },
      }
    },
  },
  {
    name: 'runQAChecklist',
    description: 'Generate a QA checklist for a specific scope.',
    parameters: {
      type: 'object',
      properties: {
        scope: {
          type: 'string',
          description: 'Scope to test (e.g., "checkout", "product-page", "cart")',
        },
      },
      required: ['scope'],
    },
    execute: async (args) => {
      const checklists: Record<string, string[]> = {
        checkout: [
          'Verify shipping address validation',
          'Test payment form validation',
          'Ensure order summary is accurate',
          'Test "Place Order" button functionality',
          'Verify order confirmation page displays',
          'Check email receipt is sent',
        ],
        'product-page': [
          'Verify product images load correctly',
          'Test variant selection',
          'Check "Add to Cart" button works',
          'Ensure price displays correctly',
          'Verify stock status is accurate',
          'Test product spec table',
        ],
        cart: [
          'Test quantity adjustment',
          'Verify item removal',
          'Check cart total calculation',
          'Test "Continue Shopping" link',
          'Verify "Proceed to Checkout" button',
          'Check empty cart state',
        ],
      }

      const checklist = checklists[args.scope] || ['No checklist available for this scope']

      return {
        scope: args.scope,
        checklist,
        priority: 'high',
      }
    },
  },
]

export async function executeTool(name: string, args: Record<string, any>): Promise<any> {
  const tool = tools.find((t) => t.name === name)
  if (!tool) {
    throw new Error(`Tool not found: ${name}`)
  }
  return tool.execute(args)
}
