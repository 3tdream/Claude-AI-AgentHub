'use client';

import React, { useEffect, useState } from 'react';
import { useCosts } from '@/hooks/useCosts';

interface CostCounterProps {
  /** Optional date range. Defaults to last 30 days (server-computed). */
  start?: string;
  end?: string;
  /** Optional label prefix shown before the value */
  label?: string;
}

/**
 * CostCounter — displays real-time Anthropic API spend in the topbar.
 * Fixed-width container prevents layout shift when value toggles between
 * loading/error ("—") and a dollar amount ("$114.04").
 */
export function CostCounter({ start, end, label = 'API Cost:' }: CostCounterProps) {
  const { value, loading, error, cached } = useCosts(start, end);

  const displayValue = (() => {
    if (loading && value === null) return '…';
    if (error || value === null) return '—';
    return `$${value.toFixed(2)}`;
  })();

  const isUnavailable = error || (value === null && !loading);

  return (
    <div
      className="cost-counter-container"
      title={
        cached
          ? 'Cached — refreshes every 5 minutes'
          : isUnavailable
          ? 'Cost data unavailable'
          : 'Live Anthropic API usage'
      }
    >
      {label && (
        <span className="cost-counter-label">{label}</span>
      )}
      <span
        className={[
          'cost-counter-value',
          loading && value === null ? 'cost-counter-loading' : '',
          isUnavailable ? 'cost-counter-unavailable' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-live="polite"
        aria-label={`Anthropic API cost: ${displayValue}`}
      >
        {displayValue}
      </span>
    </div>
  );
}

export default CostCounter;
