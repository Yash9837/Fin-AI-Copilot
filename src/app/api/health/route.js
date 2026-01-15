// Health check and status endpoint
export async function GET(request) {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        api: true,
        memory: getMemoryStatus(),
        disk: true
      }
    };

    return Response.json(health, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      },
      { status: 503 }
    );
  }
}

function getMemoryStatus() {
  const usage = process.memoryUsage();
  const total = usage.heapTotal;
  const used = usage.heapUsed;
  const percentage = (used / total) * 100;

  return {
    healthy: percentage < 90,
    used: `${Math.round(used / 1024 / 1024)}MB`,
    total: `${Math.round(total / 1024 / 1024)}MB`,
    percentage: `${percentage.toFixed(2)}%`
  };
}
