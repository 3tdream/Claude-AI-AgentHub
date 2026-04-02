import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const CONFIG_FILE = path.join(process.cwd(), "data", "costs-config.json");

interface CostsConfig {
  fixedMonthlyCosts: { label: string; amount: number }[];
  apiKeyUsage: { keyName: string; amount: number; periodStart: string; periodEnd: string; lastUpdated: string }[];
  monthlyBudget: number;
}

const DEFAULT_CONFIG: CostsConfig = {
  fixedMonthlyCosts: [
    { label: "Claude Code Max", amount: 100 },
  ],
  apiKeyUsage: [],
  monthlyBudget: 250,
};

async function loadConfig(): Promise<CostsConfig> {
  try {
    const raw = await fs.readFile(CONFIG_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    await fs.mkdir(path.dirname(CONFIG_FILE), { recursive: true });
    await fs.writeFile(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2), "utf-8");
    return DEFAULT_CONFIG;
  }
}

async function saveConfig(config: CostsConfig) {
  await fs.mkdir(path.dirname(CONFIG_FILE), { recursive: true });
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}

/** Fetch live API costs from Agent Hub (if available) */
async function fetchAgentHubCosts(): Promise<{ totalCost: number; byModel: Record<string, { cost: number; requests: number }> } | null> {
  try {
    const baseUrl = process.env.AGENT_HUB_API_URL || "http://localhost:3000/assistant";
    const apiKey = process.env.AGENT_HUB_API_KEY;
    if (!apiKey) return null;

    const res = await fetch(`${baseUrl}/costs/summary`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { totalCost: data.totalCost || 0, byModel: data.byModel || {} };
  } catch {
    // Hub offline — try cached
    try {
      const cachePath = path.join(process.cwd(), "data", "agent-hub-costs-cache.json");
      const raw = await fs.readFile(cachePath, "utf-8");
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}

/**
 * GET /api/costs/real — merged cost summary: fixed costs + live Agent Hub API costs
 */
export async function GET() {
  const [config, hubCosts] = await Promise.all([loadConfig(), fetchAgentHubCosts()]);

  const fixedTotal = config.fixedMonthlyCosts.reduce((s, c) => s + c.amount, 0);
  const manualApiTotal = config.apiKeyUsage.reduce((s, k) => s + k.amount, 0);
  const hubApiTotal = hubCosts?.totalCost || 0;

  // Use live Hub data if available, otherwise fall back to manual config
  const apiTotal = hubApiTotal > 0 ? hubApiTotal : manualApiTotal;
  const apiSource = hubApiTotal > 0 ? "live" : manualApiTotal > 0 ? "manual" : "none";

  const totalSpent = fixedTotal + apiTotal;
  const remaining = config.monthlyBudget - totalSpent;
  const budgetUsedPercent = config.monthlyBudget > 0 ? Math.round((totalSpent / config.monthlyBudget) * 100) : 0;

  return NextResponse.json({
    data: {
      totalSpent: Math.round(totalSpent * 100) / 100,
      fixedCosts: { items: config.fixedMonthlyCosts, total: fixedTotal },
      apiCosts: {
        items: hubApiTotal > 0
          ? [{ keyName: "Agent Hub (live)", amount: Math.round(hubApiTotal * 100) / 100, periodStart: "", periodEnd: "", lastUpdated: new Date().toISOString().split("T")[0] }]
          : config.apiKeyUsage,
        total: Math.round(apiTotal * 100) / 100,
        source: apiSource,
        byModel: hubCosts?.byModel || null,
      },
      budget: {
        monthly: config.monthlyBudget,
        spent: Math.round(totalSpent * 100) / 100,
        remaining: Math.round(remaining * 100) / 100,
        usedPercent: budgetUsedPercent,
      },
    },
  });
}

/**
 * PATCH /api/costs/real — update cost config (fixed costs, manual API usage, budget)
 */
export async function PATCH(req: NextRequest) {
  try {
    const updates = await req.json();
    const config = await loadConfig();

    if (updates.apiKeyUsage) config.apiKeyUsage = updates.apiKeyUsage;
    if (updates.fixedMonthlyCosts) config.fixedMonthlyCosts = updates.fixedMonthlyCosts;
    if (updates.monthlyBudget != null) config.monthlyBudget = updates.monthlyBudget;

    await saveConfig(config);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
