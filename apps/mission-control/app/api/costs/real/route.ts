import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const CONFIG_FILE = path.join(process.cwd(), "data", "costs-config.json");

interface CostsConfig {
  /** Monthly fixed costs (e.g., Claude Code Max subscription) */
  fixedMonthlyCosts: { label: string; amount: number }[];
  /** API key usage — manually updated or from console */
  apiKeyUsage: { keyName: string; amount: number; periodStart: string; periodEnd: string; lastUpdated: string }[];
  /** Monthly budget cap */
  monthlyBudget: number;
}

const DEFAULT_CONFIG: CostsConfig = {
  fixedMonthlyCosts: [
    { label: "Claude Code Max", amount: 100 },
  ],
  apiKeyUsage: [
    { keyName: "AIAgentTeam", amount: 114.04, periodStart: "2026-03-13", periodEnd: "2026-03-23", lastUpdated: "2026-03-25" },
  ],
  monthlyBudget: 250,
};

async function loadConfig(): Promise<CostsConfig> {
  try {
    const raw = await fs.readFile(CONFIG_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    // Create default config
    await fs.mkdir(path.dirname(CONFIG_FILE), { recursive: true });
    await fs.writeFile(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2), "utf-8");
    return DEFAULT_CONFIG;
  }
}

async function saveConfig(config: CostsConfig) {
  await fs.mkdir(path.dirname(CONFIG_FILE), { recursive: true });
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}

/**
 * GET /api/costs/real — real cost summary across all sources
 */
export async function GET() {
  const config = await loadConfig();

  const fixedTotal = config.fixedMonthlyCosts.reduce((s, c) => s + c.amount, 0);
  const apiTotal = config.apiKeyUsage.reduce((s, k) => s + k.amount, 0);
  const totalSpent = fixedTotal + apiTotal;
  const remaining = config.monthlyBudget - totalSpent;
  const budgetUsedPercent = config.monthlyBudget > 0 ? Math.round((totalSpent / config.monthlyBudget) * 100) : 0;

  return NextResponse.json({
    data: {
      totalSpent,
      fixedCosts: { items: config.fixedMonthlyCosts, total: fixedTotal },
      apiCosts: { items: config.apiKeyUsage, total: apiTotal },
      budget: {
        monthly: config.monthlyBudget,
        spent: totalSpent,
        remaining,
        usedPercent: budgetUsedPercent,
      },
    },
  });
}

/**
 * PATCH /api/costs/real — update cost config
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
