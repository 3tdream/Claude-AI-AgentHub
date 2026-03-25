export interface CostApiResponse {
  total_usd: number;
  period: { start: string; end: string };
  cached: boolean;
}

export interface CostErrorResponse {
  error: string;
  fallback_usd: null;
  details?: string;
  retry_after_seconds?: number;
}

export interface CostCacheEntry {
  cache_key: string;
  total_usd: number;
  period_start: string;
  period_end: string;
  fetched_at: string;
  expires_at: string;
}

export interface CostQueryRequest {
  raw_start: string | null;
  raw_end: string | null;
  resolved_start: string;
  resolved_end: string;
  cache_key: string;
  requester_ip: string;
  request_timestamp: string;
}

export interface AnthropicUsageRecord {
  id: string;
  type: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  timestamp: string;
  organization_id: string;
}

export interface RateLimitBucket {
  ip_address: string;
  request_count: number;
  window_start: number;
  window_expires_at: number;
  last_request_at: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export interface AuditLogEntry {
  cache_key: string;
  period_start: string;
  period_end: string;
  total_usd: number | null;
  fetched_at: Date;
  upstream_status_code: number;
  upstream_response_ms: number;
  was_cached: false;
  error_message: string | null;
}
