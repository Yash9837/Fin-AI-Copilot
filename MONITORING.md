# Monitoring & Observability

## Health Check Endpoint

The application includes a built-in health check endpoint at `/api/health`.

### Response Format

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0",
  "checks": {
    "api": true,
    "memory": {
      "healthy": true,
      "used": "45MB",
      "total": "512MB",
      "percentage": "8.78%"
    },
    "disk": true
  }
}
```

### Usage

```bash
# Check health status
curl https://your-domain.com/api/health

# Monitor with watch
watch -n 5 curl -s https://your-domain.com/api/health | jq .status
```

## Monitoring Solutions

### 1. Vercel Analytics (Free)

Vercel provides built-in analytics:

1. Enable in Vercel dashboard → Analytics tab
2. View real-time traffic, performance metrics
3. Track Core Web Vitals automatically

**Features:**
- Page views and unique visitors
- Top pages and referrers
- Device and browser breakdown
- Core Web Vitals (LCP, FID, CLS)

### 2. UptimeRobot (Free)

Monitor uptime and get alerts:

1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Create HTTP(s) monitor
3. URL: `https://your-domain.com/api/health`
4. Check interval: 5 minutes (free tier)
5. Add alert contacts (email, Slack, Discord)

**Features:**
- 50 monitors (free)
- 5-minute checks
- Email/SMS alerts
- Public status pages
- 90-day logs

### 3. Better Stack (Free Tier)

Comprehensive monitoring:

1. Sign up at [betterstack.com](https://betterstack.com)
2. Add HTTP monitor
3. URL: `https://your-domain.com/api/health`
4. Configure alerts

**Features:**
- HTTP(s) monitoring
- SSL certificate tracking
- Incident management
- Status pages
- On-call scheduling

### 4. Grafana Cloud (Free Tier)

Advanced metrics and logging:

```bash
# Install Grafana agent (optional)
docker run -d \
  --name=grafana-agent \
  -v /var/run/docker.sock:/var/run/docker.sock \
  grafana/agent:latest
```

**Features:**
- 10k series metrics (free)
- 50GB logs (free)
- Custom dashboards
- Alerting rules

## Application Performance Monitoring (APM)

### Sentry (Free Tier)

Error tracking and performance:

```bash
npm install @sentry/nextjs
```

Add to `next.config.mjs`:

```javascript
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(
  {
    // Your Next.js config
  },
  {
    org: "your-org",
    project: "fin-ai-copilot",
    authToken: process.env.SENTRY_AUTH_TOKEN,
  }
);
```

**Features:**
- 5k errors/month (free)
- Performance monitoring
- Release tracking
- Source maps support

## Custom Monitoring Script

Create `scripts/monitor.sh`:

```bash
#!/bin/bash

URL="https://your-domain.com/api/health"
WEBHOOK_URL="https://discord.com/api/webhooks/..." # Optional Discord webhook

while true; do
  RESPONSE=$(curl -s -w "\n%{http_code}" "$URL")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)
  
  if [ "$HTTP_CODE" -ne 200 ]; then
    echo "[$(date)] ❌ Health check failed: HTTP $HTTP_CODE"
    
    # Send Discord notification (optional)
    if [ -n "$WEBHOOK_URL" ]; then
      curl -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"content\": \"🚨 Fin-AI-Copilot health check failed: HTTP $HTTP_CODE\"}"
    fi
  else
    STATUS=$(echo "$BODY" | jq -r .status)
    UPTIME=$(echo "$BODY" | jq -r .uptime)
    MEMORY=$(echo "$BODY" | jq -r .checks.memory.percentage)
    
    echo "[$(date)] ✅ Status: $STATUS | Uptime: ${UPTIME}s | Memory: $MEMORY"
  fi
  
  sleep 300 # Check every 5 minutes
done
```

Run in background:

```bash
chmod +x scripts/monitor.sh
nohup ./scripts/monitor.sh > monitor.log 2>&1 &
```

## Log Aggregation

### Logtail (Free Tier)

Real-time log management:

```bash
npm install @logtail/pino
```

Add to your app:

```javascript
import { Logtail } from "@logtail/node";

const logtail = new Logtail(process.env.LOGTAIL_TOKEN);

// Log events
logtail.info("User action", { userId: 123, action: "send_message" });
logtail.error("API error", { error: errorMessage });
```

**Features:**
- 1GB logs/month (free)
- Real-time streaming
- Search and filtering
- Alerts

## Performance Tracking

### Key Metrics to Monitor

1. **Response Time**
   - Health endpoint: < 200ms
   - Page load: < 2s
   - API requests: < 1s

2. **Error Rate**
   - Target: < 1%
   - Alert threshold: > 5%

3. **Uptime**
   - Target: 99.9% (43 min downtime/month)
   - Alert threshold: < 99.5%

4. **Memory Usage**
   - Target: < 80%
   - Alert threshold: > 90%

5. **API Rate Limits**
   - Hugging Face: 1k req/day (no key) or 30k req/month (with key)
   - Monitor 429 errors

## Dashboard Recommendations

### Simple Dashboard (Google Sheets)

Use Google Sheets with `IMPORTDATA()` function:

```
=IMPORTDATA("https://your-domain.com/api/health")
```

Refresh every minute for basic monitoring.

### Advanced Dashboard (Grafana)

Import community dashboard:
- Dashboard ID: 11159 (Node.js Application)
- Dashboard ID: 13407 (Next.js Monitoring)

## Alerting Strategy

### Critical Alerts (Immediate)
- Health check fails (5xx errors)
- Uptime < 99.5%
- Memory > 95%

### Warning Alerts (15 min delay)
- Response time > 2s
- Error rate > 5%
- Memory > 80%

### Info Alerts (Daily digest)
- Daily traffic summary
- Error summary
- Performance trends

## Cost Breakdown (Free Tier)

| Service | Free Tier | Paid Starts At |
|---------|-----------|----------------|
| Vercel Analytics | ✅ Included | N/A |
| UptimeRobot | 50 monitors | $7/mo (10 sites) |
| Better Stack | 10 monitors | $20/mo |
| Sentry | 5k errors/mo | $26/mo |
| Logtail | 1GB logs/mo | $8/mo |
| Grafana Cloud | 10k metrics | $8/mo |

**Total Free Tier:** $0/month with generous limits!

## Best Practices

1. **Set up monitoring BEFORE deployment**
2. **Test alerts** - trigger a fake failure
3. **Monitor trends** - not just current status
4. **Set realistic thresholds** - avoid alert fatigue
5. **Document runbooks** - what to do when alerts fire
6. **Review weekly** - adjust thresholds as needed

## Troubleshooting

### Health Check Returns 503

**Possible causes:**
- Out of memory (check `memory.percentage`)
- API connection issues
- Database timeout (if applicable)

**Solutions:**
1. Check logs: `vercel logs` or `docker logs`
2. Restart service: `vercel redeploy` or `docker restart`
3. Scale resources if needed

### High Response Times

**Possible causes:**
- Hugging Face API slow (model loading)
- Large payload sizes
- Memory pressure

**Solutions:**
1. Add caching layer
2. Optimize API calls (batch requests)
3. Upgrade to larger instance

### Memory Leaks

**Detection:**
- Memory percentage increases over time
- Crashes after long uptime

**Solutions:**
1. Restart service regularly (cron)
2. Profile with `node --inspect`
3. Check for unclosed connections

## Resources

- [Vercel Analytics Docs](https://vercel.com/docs/analytics)
- [UptimeRobot Docs](https://uptimerobot.com/api/)
- [Sentry Next.js Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Grafana Cloud Free Tier](https://grafana.com/products/cloud/)
