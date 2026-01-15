# Security Best Practices

## Overview

This document outlines security measures implemented in Fin-AI-Copilot and recommendations for production deployment.

## Security Headers

The following security headers are configured in `next.config.mjs`:

### Content Security Policy (CSP)

```javascript
"Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api-inference.huggingface.co;"
```

**Protection:** Prevents XSS attacks by restricting resource loading.

### X-Frame-Options

```javascript
"X-Frame-Options": "DENY"
```

**Protection:** Prevents clickjacking by disallowing the site in iframes.

### X-Content-Type-Options

```javascript
"X-Content-Type-Options": "nosniff"
```

**Protection:** Prevents MIME-type sniffing attacks.

### X-XSS-Protection

```javascript
"X-XSS-Protection": "1; mode=block"
```

**Protection:** Enables browser XSS filtering (legacy browsers).

### Referrer-Policy

```javascript
"Referrer-Policy": "strict-origin-when-cross-origin"
```

**Protection:** Controls referrer information sent to third parties.

### Permissions-Policy

```javascript
"Permissions-Policy": "camera=(), microphone=(), geolocation=()"
```

**Protection:** Disables unnecessary browser features.

## API Security

### Hugging Face API

**Current Implementation:**
- API key stored in environment variable `NEXT_PUBLIC_HF_API_KEY`
- ⚠️ **Note:** `NEXT_PUBLIC_` prefix makes it client-side accessible

**Recommended for Production:**

1. **Move API calls to server-side:**

Create `/src/app/api/ai/route.js`:

```javascript
export async function POST(request) {
  try {
    const { messages } = await request.json();
    
    // API key is server-side only
    const apiKey = process.env.HF_API_KEY; // No NEXT_PUBLIC_ prefix
    
    const response = await fetch('https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: messages }),
    });
    
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

2. **Update client to use API route:**

In `src/utils/claudeApi.js`:

```javascript
export async function generateResponse(conversation) {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversation }),
    });
    
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}
```

3. **Update environment variables:**

```bash
# .env.local (development)
HF_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Vercel/Netlify environment (production)
HF_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Server-side only
```

## Data Security

### LocalStorage

**Current Implementation:**
- Conversations stored in browser localStorage
- No encryption

**Recommendations:**

1. **Encrypt sensitive data:**

```bash
npm install crypto-js
```

In `src/utils/storage.js`:

```javascript
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-key';

export function saveConversations(conversations) {
  try {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(conversations),
      ENCRYPTION_KEY
    ).toString();
    
    localStorage.setItem('conversations', encrypted);
    return true;
  } catch (error) {
    console.error('Save error:', error);
    return false;
  }
}

export function loadConversations() {
  try {
    const encrypted = localStorage.getItem('conversations');
    if (!encrypted) return [];
    
    const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    const json = decrypted.toString(CryptoJS.enc.Utf8);
    
    return JSON.parse(json);
  } catch (error) {
    console.error('Load error:', error);
    return [];
  }
}
```

2. **Implement auto-logout:**

Add session timeout in `src/app/page.js`:

```javascript
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

useEffect(() => {
  let timeout;
  
  const resetTimeout = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      // Clear sensitive data
      localStorage.clear();
      alert('Session expired. Data cleared for security.');
      window.location.reload();
    }, SESSION_TIMEOUT);
  };
  
  // Reset on user activity
  window.addEventListener('mousemove', resetTimeout);
  window.addEventListener('keypress', resetTimeout);
  
  resetTimeout();
  
  return () => {
    clearTimeout(timeout);
    window.removeEventListener('mousemove', resetTimeout);
    window.removeEventListener('keypress', resetTimeout);
  };
}, []);
```

## Input Validation

### File Uploads

**Current Implementation:**
- No file size limit
- No file type validation

**Recommended Implementation:**

In `src/components/Composer.js`:

```javascript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files);
  
  const validFiles = files.filter(file => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      alert(`File ${file.name} is too large. Max size: 5MB`);
      return false;
    }
    
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert(`File ${file.name} has invalid type. Allowed: JPEG, PNG, GIF, PDF`);
      return false;
    }
    
    return true;
  });
  
  // Generate previews for valid files
  validFiles.forEach(file => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedFiles(prev => [...prev, {
        name: file.name,
        size: file.size,
        type: file.type,
        preview: reader.result
      }]);
    };
    reader.readAsDataURL(file);
  });
};
```

### Message Input

**Add sanitization:**

```bash
npm install dompurify
```

In `src/components/Composer.js`:

```javascript
import DOMPurify from 'dompurify';

const handleSendMessage = () => {
  // Sanitize input
  const cleanMessage = DOMPurify.sanitize(message.trim(), {
    ALLOWED_TAGS: [], // Remove all HTML tags
    ALLOWED_ATTR: []
  });
  
  if (!cleanMessage) return;
  
  onSendMessage(cleanMessage, attachedFiles);
  setMessage('');
  setAttachedFiles([]);
};
```

## Authentication (Optional)

For production, consider adding authentication:

### Option 1: NextAuth.js

```bash
npm install next-auth
```

Create `/src/app/api/auth/[...nextauth]/route.js`:

```javascript
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub;
      return session;
    },
  },
};

export default NextAuth(authOptions);
```

Protect pages in `src/app/page.js`:

```javascript
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>Access Denied</div>;
  
  return (
    // Your app content
  );
}
```

### Option 2: Clerk

```bash
npm install @clerk/nextjs
```

Simpler setup with built-in UI components.

## Rate Limiting

Implement rate limiting to prevent abuse:

```bash
npm install express-rate-limit
```

Create `/src/middleware.js`:

```javascript
import { NextResponse } from 'next/server';

const rateLimitMap = new Map();

export function middleware(request) {
  const ip = request.ip ?? '127.0.0.1';
  const now = Date.now();
  
  // Get or create rate limit entry
  const limit = rateLimitMap.get(ip) || { count: 0, resetTime: now + 60000 };
  
  // Reset if time window expired
  if (now > limit.resetTime) {
    limit.count = 0;
    limit.resetTime = now + 60000;
  }
  
  // Check limit (60 requests per minute)
  if (limit.count >= 60) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  
  // Increment counter
  limit.count++;
  rateLimitMap.set(ip, limit);
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

## HTTPS Enforcement

### Vercel/Netlify

HTTPS is automatic with custom domains.

### Docker/VPS

Use Let's Encrypt with Nginx:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Install certificate:

```bash
sudo certbot --nginx -d yourdomain.com
```

## Environment Variables

### Secure Storage

**Never commit:**
- `.env.local`
- `.env.production.local`
- Any file with secrets

**Always use:**
- Platform secret management (Vercel/Netlify/GitHub Secrets)
- Environment-specific variables

### Audit Regularly

```bash
# Check for exposed secrets
npm install -g git-secrets
git secrets --scan
```

## Security Checklist

- [ ] Move API calls to server-side routes
- [ ] Implement rate limiting
- [ ] Add input validation and sanitization
- [ ] Encrypt localStorage data
- [ ] Add authentication (if needed)
- [ ] Enable HTTPS
- [ ] Set up CSP headers
- [ ] Implement session timeout
- [ ] Audit dependencies regularly (`npm audit`)
- [ ] Set up security monitoring
- [ ] Review logs for suspicious activity
- [ ] Backup data regularly
- [ ] Test error handling (don't expose stack traces)
- [ ] Disable source maps in production
- [ ] Remove console.logs in production
- [ ] Set secure cookie flags (if using cookies)

## Vulnerability Scanning

### NPM Audit

```bash
# Check for vulnerabilities
npm audit

# Fix automatically (if possible)
npm audit fix

# Force fixes (may break things)
npm audit fix --force
```

### Snyk

```bash
npm install -g snyk
snyk test
snyk monitor
```

### OWASP ZAP

Use OWASP ZAP for penetration testing:

```bash
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://your-domain.com
```

## Incident Response

### If Compromised

1. **Immediate Actions:**
   - Revoke all API keys
   - Change all passwords
   - Block suspicious IPs
   - Take app offline if needed

2. **Investigation:**
   - Check logs for unauthorized access
   - Identify breach point
   - Assess data exposure

3. **Recovery:**
   - Patch vulnerabilities
   - Restore from backup
   - Notify affected users (if applicable)
   - Update security measures

4. **Prevention:**
   - Document incident
   - Update security policies
   - Train team on lessons learned

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/authentication)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Snyk Vulnerability Database](https://snyk.io/vuln/)
