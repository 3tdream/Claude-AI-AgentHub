# @workspace/utils

Shared utility functions for AI Projects monorepo.

## Installation

This package is internal to the monorepo. Import it in your apps:

```typescript
import { delay, debounce, capitalize } from '@workspace/utils';
```

## Available Utilities

### Async Utilities
- `delay(ms)` - Delay execution for specified milliseconds
- `sleep(ms)` - Alias for delay
- `retry(fn, retries, delayMs)` - Retry a function with exponential backoff

### Function Utilities
- `debounce(fn, wait)` - Debounce function execution
- `throttle(fn, limit)` - Throttle function execution

### String Utilities
- `capitalize(str)` - Capitalize first letter
- `truncate(str, length, suffix)` - Truncate string with suffix
- `toCamelCase(str)` - Convert to camelCase
- `toKebabCase(str)` - Convert to kebab-case

### Array Utilities
- `unique(arr)` - Remove duplicates
- `groupBy(arr, key)` - Group array items by key

### Object Utilities
- `deepClone(obj)` - Deep clone object
- `isEmpty(value)` - Check if value is empty

### Validation Utilities
- `validateEmail(email)` - Validate email format
- `isValidUrl(url)` - Check if string is valid URL

### Number Utilities
- `clamp(num, min, max)` - Clamp number between min and max
- `generateId()` - Generate unique ID

### Date Utilities
- `formatDate(date, locale)` - Format date to readable string

## Usage Examples

```typescript
// Debounce search input
const debouncedSearch = debounce((query: string) => {
  console.log('Searching:', query);
}, 300);

// Delay execution
await delay(1000);

// Validate email
if (validateEmail('user@example.com')) {
  // Valid email
}

// Group items
const users = [
  { name: 'Alice', role: 'admin' },
  { name: 'Bob', role: 'user' },
  { name: 'Charlie', role: 'admin' },
];
const grouped = groupBy(users, 'role');
// { admin: [...], user: [...] }
```

## License

MIT
