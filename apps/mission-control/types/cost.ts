export interface CostSummary {
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalRequests: number;
  averageDuration: number;
  byModel: Record<string, ModelCost>;
  byProvider: Record<string, ProviderCost>;
  byAssistant: AssistantCost[];
}

export interface ProviderCost {
  cost: number;
  requests: number;
  tokens: number;
}

export interface ModelCost {
  cost: number;
  requests: number;
  tokens: number;
}

export interface AssistantCost {
  assistantId: string;
  assistantName: string;
  cost: number;
  requests: number;
  tokens: number;
}

export interface DailyCost {
  date: string;
  cost: number;
  requests: number;
  tokens: number;
}

export interface DailyCostResponse {
  summary: {
    totalCost: number;
    totalRequests: number;
    totalTokens: number;
    averageDailyCost: number;
    daysWithData: number;
    peakDay: {
      date: string;
      cost: number;
      requests: number;
      tokens: number;
    };
  };
  dailyCosts: DailyCost[];
}

export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  description?: string;
  costPer1kInput?: number;
  costPer1kOutput?: number;
}
