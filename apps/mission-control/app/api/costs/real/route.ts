import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const CONFIG_FILE = path.join(process.cwd(), "data", "costs-config.json");

interface ApiBalance {
  provider: string;
  label: string;
  balance: number;
  lastUpdated: string;
  consoleUrl: string;
}

interface CostsConfig {
  fixedMonthlyCosts: { label: string; amount: number }[];
  apiBalances: ApiBalance[];
  monthlyBudget: number;
}

const DEFAULT_CONFIG: CostsConfig = {
  fixedMonthlyCosts: [{ label: "Claude Code Max", amount: 100 }],
  apiBalances: [
    { provider: "anthropic", label: "Anthropic API", balance: 0, lastUpdated: "", consoleUrl: "https://console.anthropic.com/settings/billing" },
    { provider: "openai", label: "OpenAI API", balance: 0, lastUpdated: "", consoleUrl: "https://platform.openai.com/usage" },
    { provider: "google", label: "Google AI", balance: 0, lastUpdated: "", consoleUrl: "https://console.cloud.google.com/billing" },
  ],
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

/** Load pipeline token usage to calculate real API spend */
async function loadPipelineSpend(): Promise<{ total: number; byProvider: Record<string, number> }> {
  const byProvider: Record<string, number> = {};
  let total = 0;
  try {
    const runsDir = path.join(process.cwd(), "data", "pipeline-runs");
    const files = await fs.readdir(runsDir);
    for (const f of files.filter(f => f.endsWith(".json"))) {
      try {
        const run = JSON.parse(await fs.readFile(path.join(runsDir, f), "utf-8"));
        if (run.tokenUsage) {
          for (const usage of Object.values(run.tokenUsage) as any[]) {
            const cost = usage.cost || 0;
            const provider = usage.provider || "anthropic";
            byProvider[provider] = (byProvider[provider] || 0) + cost;
            total += cost;
          }
        }
      } catch { /* skip corrupt */ }
    }
  } catch { /* no runs dir */ }
  return { total: Math.round(total * 100) / 100, byProvider };
}

/**
 * GET /api/costs/real — real cost summary
 *
 * Shows:
 * - Fixed costs (Claude Code subscription)
 * - API balances per provider (manually entered)
 * - Pipeline spend (calculated from tokenUsage in runs)
 * - Budget remaining
 */
export async function GET() {
  const [config, pipelineSpend] = await Promise.all([loadConfig(), loadPipelineSpend()]);

  const fixedTotal = config.fixedMonthlyCosts.reduce((s, c) => s + c.amount, 0);
  const apiBalanceTotal = config.apiBalances.reduce((s, b) => s + b.balance, 0);
  const totalSpent = fixedTotal + pipelineSpend.total;
  const remaining = config.monthlyBudget - totalSpent;

  return NextResponse.json({
    data: {
      totalSpent: Math.round(totalSpent * 100) / 100,
      fixedCosts: {
        items: config.fixedMonthlyCosts,
        total: fixedTotal,
      },
      apiBalances: {
        items: config.apiBalances,
        total: apiBalanceTotal,
      },
      pipelineSpend: {
        total: pipelineSpend.total,
        byProvider: pipelineSpend.byProvider,
      },
      budget: {
        monthly: config.monthlyBudget,
        spent: Math.round(totalSpent * 100) / 100,
        remaining: Math.round(remaining * 100) / 100,
        usedPercent: config.monthlyBudget > 0 ? Math.round((totalSpent / config.monthlyBudget) * 100) : 0,
      },
    },
  });
}

/**
 * PATCH /api/costs/real — update cost config
 *
 * Body options:
 * - { fixedMonthlyCosts: [...] }
 * - { monthlyBudget: number }
 * - { updateBalance: { provider: "anthropic", balance: 45.50 } }
 */
export async function PATCH(req: NextRequest) {
  try {
    const updates = await req.json();
    const config = await loadConfig();

    if (updates.fixedMonthlyCosts) config.fixedMonthlyCosts = updates.fixedMonthlyCosts;
    if (updates.monthlyBudget != null) config.monthlyBudget = updates.monthlyBudget;

    // Update single provider balance
    if (updates.updateBalance) {
      const { provider, balance } = updates.updateBalance;
      const idx = config.apiBalances.findIndex(b => b.provider === provider);
      if (idx >= 0) {
        config.apiBalances[idx].balance = balance;
        config.apiBalances[idx].lastUpdated = new Date().toISOString();
      }
    }

    // Replace all balances
    if (updates.apiBalances) config.apiBalances = updates.apiBalances;

    await saveConfig(config);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
