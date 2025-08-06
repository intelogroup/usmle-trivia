#!/bin/bash

# 🚀 Convex Deployment Script for MedQuiz Pro
# This script deploys the Convex backend with the production key

echo "🏥 MedQuiz Pro - Convex Production Deployment"
echo "============================================="

# Set the deployment key
export CONVEX_DEPLOYMENT_KEY="prod:formal-sardine-916|eyJ2MiI6ImIyMWM3NDc1MGM3NTRmNTJhNTQ2NmIyMzQzZjYxYWY1In0="

echo "✅ Deployment key set: prod:formal-sardine-916"
echo "🔗 Deployment URL: https://formal-sardine-916.convex.cloud"
echo ""

# Check if Convex CLI is available
if ! command -v convex &> /dev/null; then
    echo "❌ Convex CLI not found. Please install with: npm install -g convex"
    exit 1
fi

echo "📦 Deploying Convex schema and functions..."
echo ""

# Deploy the schema and functions
npx convex dev --once

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Convex deployment completed successfully!"
    echo "✅ Schema deployed to: https://formal-sardine-916.convex.cloud"
    echo "✅ HTTP Actions available at: https://formal-sardine-916.convex.site"
    echo ""
    echo "📋 Next steps:"
    echo "1. Enable React hooks in convexAuth.ts and convexQuiz.ts"
    echo "2. Test authentication flow"
    echo "3. Test quiz functionality"
    echo "4. Deploy to Netlify"
    echo ""
else
    echo ""
    echo "❌ Convex deployment failed!"
    echo "💡 This might require interactive setup. Try running manually:"
    echo "   npx convex dev --configure=existing --team jay-code101 --project usmletrivia"
    echo ""
fi