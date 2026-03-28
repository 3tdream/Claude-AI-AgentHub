import { useState, useEffect, useCallback } from 'react';
import type { CostApiResponse as CostResponse } from '@/types/costs';

interface UseCostsState {
  value: number | null;
  period: { start: string; end: string } | null;
  cached: boolean;
  loading: boolean;
  error: boolean;
}

const POLL_INTERVAL_MS = 300_000; // 5 minutes — aligns with server-side cache TTL

export function useCosts(start?: string, end?: string): UseCostsState {
  const [state, setState] = useState<UseCostsState>({
    value: null,
    period: null,
    cached: false,
    loading: true,
    error: false,
  });

  const fetchCosts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (start) params.set('start', start);
      if (end) params.set('end', end);

      const url = `/api/costs/anthropic${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url, { credentials: 'same-origin' });

      if (!res.ok) {
        setState(prev => ({ ...prev, loading: false, error: true, value: null }));
        return;
      }

      const data: CostResponse = await res.json();
      setState({
        value: data.total_usd,
        period: data.period,
        cached: data.cached,
        loading: false,
        error: false,
      });
    } catch {
      setState(prev => ({ ...prev, loading: false, error: true, value: null }));
    }
  }, [start, end]);

  useEffect(() => {
    fetchCosts();

    const interval = setInterval(fetchCosts, POLL_INTERVAL_MS);

    // Re-fetch on tab focus to get fresh data when user returns
    const handleFocus = () => fetchCosts();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchCosts]);

  return state;
}
