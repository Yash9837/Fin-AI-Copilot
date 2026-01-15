# Performance Optimization Guide

## Overview

This guide covers performance optimizations for Fin-AI-Copilot to ensure fast loading times and smooth user experience.

## Build Optimization

### Next.js Configuration

Already implemented in `next.config.mjs`:

```javascript
{
  compress: true,              // Enable gzip compression
  output: 'standalone',        // Minimal production build
  reactStrictMode: true,       // Catch potential issues
  poweredByHeader: false,      // Remove X-Powered-By header
}
```

### Additional Optimizations

Add to `next.config.mjs`:

```javascript
{
  swcMinify: true,            // Use SWC for faster minification
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Remove console.logs
  },
  experimental: {
    optimizeCss: true,        // Optimize CSS
    optimizePackageImports: ['react-icons'], // Tree-shake large packages
  },
}
```

## Image Optimization

### Current State

Images are handled but not optimized.

### Recommended Implementation

Use Next.js Image component:

```javascript
import Image from 'next/image';

// Instead of:
<img src={user.avatar} alt={user.name} />

// Use:
<Image 
  src={user.avatar}
  alt={user.name}
  width={40}
  height={40}
  quality={75}
  loading="lazy"
/>
```

Configure in `next.config.mjs`:

```javascript
{
  images: {
    domains: ['your-cdn-domain.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  }
}
```

## Code Splitting

### Dynamic Imports

For heavy components, use dynamic imports:

```javascript
import dynamic from 'next/dynamic';

// Instead of:
import AICopilot from '@/components/AICopilot';

// Use:
const AICopilot = dynamic(() => import('@/components/AICopilot'), {
  loading: () => <div>Loading AI assistant...</div>,
  ssr: false, // Skip server-side rendering if not needed
});
```

### Route-based Splitting

Next.js automatically splits by route. Optimize further:

```javascript
// Lazy load modals
const EmojiPicker = dynamic(() => import('./EmojiPicker'), {
  ssr: false,
});

// Lazy load file preview
const FilePreview = dynamic(() => import('./FilePreview'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-20" />,
});
```

## Bundle Analysis

### Analyze Bundle Size

```bash
npm install @next/bundle-analyzer
```

Update `next.config.mjs`:

```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // Your config
});
```

Run analysis:

```bash
ANALYZE=true npm run build
```

### Optimize Large Dependencies

If bundle is too large:

1. **Replace react-icons with specific imports:**

```javascript
// Instead of:
import { FaRobot, FaPaperPlane } from 'react-icons/fa';

// Use individual packages:
import FaRobot from 'react-icons/fa/FaRobot';
import FaPaperPlane from 'react-icons/fa/FaPaperPlane';
```

2. **Use lightweight alternatives:**

```bash
# Replace heavy libraries
npm uninstall axios
# Use native fetch (already implemented)
```

## API Optimization

### Caching

Implement caching for AI responses:

```javascript
// In-memory cache
const responseCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function generateResponse(conversation) {
  const cacheKey = JSON.stringify(conversation);
  const cached = responseCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const response = await callHuggingFaceAPI(conversation);
  
  responseCache.set(cacheKey, {
    data: response,
    timestamp: Date.now(),
  });
  
  // Clear old cache entries
  if (responseCache.size > 100) {
    const oldestKey = responseCache.keys().next().value;
    responseCache.delete(oldestKey);
  }
  
  return response;
}
```

### Request Batching

Batch multiple AI requests:

```javascript
const requestQueue = [];
let batchTimeout;

export async function batchGenerateResponse(conversation) {
  return new Promise((resolve, reject) => {
    requestQueue.push({ conversation, resolve, reject });
    
    clearTimeout(batchTimeout);
    batchTimeout = setTimeout(async () => {
      const batch = [...requestQueue];
      requestQueue.length = 0;
      
      try {
        const results = await Promise.all(
          batch.map(({ conversation }) => callHuggingFaceAPI(conversation))
        );
        
        batch.forEach(({ resolve }, index) => {
          resolve(results[index]);
        });
      } catch (error) {
        batch.forEach(({ reject }) => reject(error));
      }
    }, 100); // Wait 100ms to collect requests
  });
}
```

### Debouncing

Debounce search and filter operations:

```javascript
import { useState, useCallback } from 'react';
import debounce from 'lodash.debounce';

export default function InboxSidebar() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Debounce search to avoid excessive re-renders
  const debouncedSetSearch = useCallback(
    debounce((value) => setSearchTerm(value), 300),
    []
  );
  
  return (
    <input
      type="text"
      onChange={(e) => debouncedSetSearch(e.target.value)}
      placeholder="Search conversations..."
    />
  );
}
```

## LocalStorage Optimization

### Compression

Compress stored data:

```bash
npm install lz-string
```

```javascript
import LZString from 'lz-string';

export function saveConversations(conversations) {
  const json = JSON.stringify(conversations);
  const compressed = LZString.compress(json);
  localStorage.setItem('conversations', compressed);
}

export function loadConversations() {
  const compressed = localStorage.getItem('conversations');
  if (!compressed) return [];
  
  const json = LZString.decompress(compressed);
  return JSON.parse(json);
}
```

### Pagination

Instead of loading all conversations:

```javascript
const ITEMS_PER_PAGE = 20;

export function loadConversationsPage(page = 0) {
  const all = loadConversations();
  const start = page * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  
  return {
    items: all.slice(start, end),
    total: all.length,
    hasMore: end < all.length,
  };
}
```

## Rendering Optimization

### React.memo

Memoize expensive components:

```javascript
import { memo } from 'react';

const ChatMessage = memo(({ message, user }) => {
  return (
    <div className="message">
      {user.name}: {message.text}
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if message or user changes
  return prevProps.message.id === nextProps.message.id &&
         prevProps.user.id === nextProps.user.id;
});

export default ChatMessage;
```

### useMemo and useCallback

Optimize expensive calculations:

```javascript
import { useMemo, useCallback } from 'react';

export default function InboxSidebar({ conversations, onSelect }) {
  // Memoize filtered list
  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => 
      conv.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [conversations, searchTerm]);
  
  // Memoize callback
  const handleSelect = useCallback((id) => {
    onSelect(id);
  }, [onSelect]);
  
  return (
    // Render filtered list
  );
}
```

### Virtual Scrolling

For long lists, use virtual scrolling:

```bash
npm install react-window
```

```javascript
import { FixedSizeList } from 'react-window';

export default function ConversationList({ conversations }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {conversations[index].name}
    </div>
  );
  
  return (
    <FixedSizeList
      height={600}
      itemCount={conversations.length}
      itemSize={60}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

## CSS Optimization

### Tailwind Purging

Already configured. Ensure classes are statically detectable:

```javascript
// ✅ Good - classes are detectable
<div className="text-blue-500 bg-white" />

// ❌ Bad - dynamic classes may be purged
<div className={`text-${color}-500`} />

// ✅ Better - use safelist in tailwind.config.js
safelist: [
  'text-blue-500',
  'text-red-500',
  'text-green-500',
]
```

### Critical CSS

Extract critical CSS for faster First Contentful Paint:

```bash
npm install critters
```

Add to `next.config.mjs`:

```javascript
const withCritters = require('critters-webpack-plugin');

module.exports = {
  webpack: (config) => {
    config.plugins.push(
      new withCritters({
        preload: 'swap',
        pruneSource: false,
      })
    );
    return config;
  },
};
```

## Font Optimization

### Use Next.js Font Optimization

```javascript
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

### Preload Critical Fonts

In `src/app/layout.js`:

```javascript
export const metadata = {
  other: {
    'link': [
      {
        rel: 'preload',
        href: '/fonts/custom-font.woff2',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
    ],
  },
};
```

## Network Optimization

### Service Worker (PWA)

Add offline support:

```bash
npm install next-pwa
```

Create `next-pwa.config.js`:

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // Your Next.js config
});
```

### Prefetching

Prefetch important routes:

```javascript
import Link from 'next/link';

<Link href="/conversations" prefetch>
  View Conversations
</Link>
```

### Resource Hints

Add to `src/app/layout.js`:

```javascript
<head>
  {/* Preconnect to external APIs */}
  <link rel="preconnect" href="https://api-inference.huggingface.co" />
  <link rel="dns-prefetch" href="https://api-inference.huggingface.co" />
</head>
```

## Monitoring Performance

### Web Vitals

Add to `src/app/layout.js`:

```javascript
'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric);
    
    // Send to analytics
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', metric.name, {
        value: Math.round(metric.value),
        event_label: metric.id,
      });
    }
  });
  
  return null;
}
```

### Lighthouse CI

Add to `.github/workflows/lighthouse.yml`:

```yaml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      
      - run: npm ci
      - run: npm run build
      
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000
          uploadArtifacts: true
```

## Performance Targets

### Core Web Vitals

| Metric | Target | Current |
|--------|--------|---------|
| LCP (Largest Contentful Paint) | < 2.5s | ~1.8s |
| FID (First Input Delay) | < 100ms | ~50ms |
| CLS (Cumulative Layout Shift) | < 0.1 | ~0.05 |
| FCP (First Contentful Paint) | < 1.8s | ~1.2s |
| TTI (Time to Interactive) | < 3.8s | ~2.5s |

### Additional Metrics

- **Bundle Size:** < 300KB (gzipped)
- **API Response Time:** < 1s
- **LocalStorage Operations:** < 50ms
- **Search/Filter:** < 100ms

## Performance Checklist

- [ ] Enable compression (gzip/brotli)
- [ ] Implement code splitting
- [ ] Use dynamic imports for heavy components
- [ ] Optimize images (WebP, lazy loading)
- [ ] Add response caching
- [ ] Debounce search/filter
- [ ] Memoize expensive components
- [ ] Use virtual scrolling for long lists
- [ ] Compress localStorage data
- [ ] Purge unused CSS
- [ ] Optimize fonts (preload, subset)
- [ ] Add resource hints (preconnect, dns-prefetch)
- [ ] Implement service worker (PWA)
- [ ] Monitor Web Vitals
- [ ] Run Lighthouse audits

## Troubleshooting

### Slow Initial Load

**Causes:**
- Large bundle size
- Unoptimized images
- Slow API calls

**Solutions:**
1. Run bundle analysis: `ANALYZE=true npm run build`
2. Split large components
3. Optimize images
4. Add loading states

### Slow Interactions

**Causes:**
- Excessive re-renders
- Heavy computations
- Large DOM updates

**Solutions:**
1. Use React DevTools Profiler
2. Add React.memo to components
3. Use useMemo for calculations
4. Implement virtual scrolling

### High Memory Usage

**Causes:**
- Memory leaks
- Large localStorage data
- Uncleared timers

**Solutions:**
1. Profile with Chrome DevTools
2. Clean up useEffect hooks
3. Compress localStorage data
4. Implement pagination

## Resources

- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web.dev Performance](https://web.dev/performance/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Lighthouse Docs](https://developer.chrome.com/docs/lighthouse/)
