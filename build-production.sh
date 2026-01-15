#!/bin/bash

# Production Build Script for Fin-AI-Copilot
# This script prepares the application for production deployment

set -e  # Exit on error

echo "🚀 Starting production build process..."
echo ""

# Check Node version
echo "📋 Checking Node.js version..."
node -v
echo ""

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf out
echo "✓ Cleaned"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false
echo "✓ Dependencies installed"
echo ""

# Run linting
echo "🔍 Running linter..."
npm run lint || echo "⚠️  Linting warnings (non-blocking)"
echo ""

# Build for production
echo "🏗️  Building for production..."
npm run build
echo "✓ Build completed successfully"
echo ""

# Check build output
if [ -d ".next" ]; then
    echo "✅ Build artifacts created successfully"
    echo ""
    echo "📊 Build statistics:"
    du -sh .next
    echo ""
else
    echo "❌ Build failed - .next directory not found"
    exit 1
fi

echo "✨ Production build complete!"
echo ""
echo "Next steps:"
echo "  - Test locally: npm start"
echo "  - Deploy to Vercel: vercel --prod"
echo "  - Deploy with Docker: docker build -t fin-ai-copilot ."
echo ""
echo "Happy deploying! 🎉"
