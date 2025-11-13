# Shared Utilities

Common utility functions and helper modules used across all projects.

## Categories

### 📅 Date & Time
- Date formatting
- Time calculations
- Timezone conversions

### 🔤 String Utilities
- String manipulation
- Text formatting
- Sanitization

### ✅ Validation
- Email validation
- Form validation
- Data validation

### 🔄 Data Transformers
- Object transformations
- Array utilities
- Data normalization

### 🌐 API Helpers
- HTTP request wrappers
- Error handling
- Response formatting

### 🔐 Security
- Encryption/decryption
- Hashing
- Token generation

## Usage Example

```javascript
// Import specific utilities
import { formatDate, validateEmail, debounce } from '../_shared/utils';

// Use utilities
const formattedDate = formatDate(new Date(), 'YYYY-MM-DD');
const isValid = validateEmail('user@example.com');
const debouncedFn = debounce(() => console.log('Called'), 300);
```

## Structure

```
utils/
├── date/              # Date utilities
├── string/            # String utilities
├── validation/        # Validation functions
├── api/               # API helpers
├── security/          # Security utilities
└── index.js           # Main export
```

## Creating New Utilities

1. Choose appropriate category or create new one
2. Write pure, testable functions
3. Add JSDoc documentation
4. Include unit tests
5. Export from index.js

### Template:
```javascript
/**
 * Description of what the function does
 * @param {Type} param - Parameter description
 * @returns {Type} Return value description
 * @example
 * functionName(exampleInput) // exampleOutput
 */
export function functionName(param) {
  // Implementation
  return result;
}
```

## Best Practices

- Keep functions pure (no side effects)
- Write comprehensive tests
- Document all parameters and return values
- Use TypeScript types when possible
- Handle edge cases
- Optimize for performance

---

**Last Updated**: 2025-11-12
