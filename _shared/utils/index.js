/**
 * Shared Utilities Index
 * Import utilities: import { formatDate, validateEmail } from '../_shared/utils';
 */

// Date utilities
export * from './date';

// String utilities
export * from './string';

// Validation utilities
export * from './validation';

// API utilities
export * from './api';

// Array utilities
export * from './array';

// Object utilities
export * from './object';

// Common utility functions
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max);
};

export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};
