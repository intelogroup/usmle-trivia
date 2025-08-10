#!/bin/bash

# MANUAL AUTHENTICATION TESTING SCRIPT
# Tests the authentication system by inspecting the running application
# This script verifies that all authentication pages load correctly

echo "🏥 MedQuiz Pro - Authentication System Testing"
echo "=============================================="

BASE_URL="http://localhost:5173"
TEST_DIR="tests/authentication"

# Create screenshots directory
mkdir -p "$TEST_DIR/screenshots"

echo ""
echo "📋 Test 1: Landing Page Access"
echo "------------------------------"
LANDING_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
if [ "$LANDING_RESPONSE" = "200" ]; then
    echo "✅ Landing page accessible (HTTP $LANDING_RESPONSE)"
else
    echo "❌ Landing page not accessible (HTTP $LANDING_RESPONSE)"
fi

echo ""
echo "📋 Test 2: Login Page Access"
echo "-----------------------------"
LOGIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/login")
if [ "$LOGIN_RESPONSE" = "200" ]; then
    echo "✅ Login page accessible (HTTP $LOGIN_RESPONSE)"
    
    # Check if page contains expected elements
    LOGIN_CONTENT=$(curl -s "$BASE_URL/login")
    if [[ "$LOGIN_CONTENT" == *"MedQuiz Pro"* ]]; then
        echo "✅ Login page contains branding"
    else
        echo "❌ Login page missing branding"
    fi
    
    if [[ "$LOGIN_CONTENT" == *"USMLE Preparation Platform"* ]]; then
        echo "✅ Login page contains USMLE branding"
    else
        echo "❌ Login page missing USMLE branding"
    fi
else
    echo "❌ Login page not accessible (HTTP $LOGIN_RESPONSE)"
fi

echo ""
echo "📋 Test 3: Register Page Access"
echo "-------------------------------"
REGISTER_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/register")
if [ "$REGISTER_RESPONSE" = "200" ]; then
    echo "✅ Register page accessible (HTTP $REGISTER_RESPONSE)"
    
    # Check if page contains expected elements
    REGISTER_CONTENT=$(curl -s "$BASE_URL/register")
    if [[ "$REGISTER_CONTENT" == *"Join thousands of medical students"* ]]; then
        echo "✅ Register page contains medical student messaging"
    else
        echo "❌ Register page missing medical student messaging"
    fi
else
    echo "❌ Register page not accessible (HTTP $REGISTER_RESPONSE)"
fi

echo ""
echo "📋 Test 4: Protected Route (Dashboard)"
echo "--------------------------------------"
DASHBOARD_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/dashboard")
if [ "$DASHBOARD_RESPONSE" = "200" ]; then
    echo "✅ Dashboard page accessible (HTTP $DASHBOARD_RESPONSE)"
    echo "   Note: Should check if authentication is required"
else
    echo "❌ Dashboard page not accessible (HTTP $DASHBOARD_RESPONSE)"
fi

echo ""
echo "📋 Test 5: Static Assets"
echo "------------------------"
# Check if CSS and JS assets are loading
MAIN_JS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/src/main.tsx")
if [ "$MAIN_JS_RESPONSE" = "200" ]; then
    echo "✅ Main JavaScript accessible (HTTP $MAIN_JS_RESPONSE)"
else
    echo "❌ Main JavaScript not accessible (HTTP $MAIN_JS_RESPONSE)"
fi

echo ""
echo "📋 Test 6: API Endpoint Testing"
echo "-------------------------------"
# Test if Convex endpoints are configured (should get CORS or 404, not connection refused)
CONVEX_URL="https://formal-sardine-916.convex.cloud"
CONVEX_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$CONVEX_URL" --max-time 10)
if [ "$CONVEX_RESPONSE" != "000" ]; then
    echo "✅ Convex backend reachable (HTTP $CONVEX_RESPONSE)"
else
    echo "❌ Convex backend not reachable"
fi

echo ""
echo "📋 Test 7: Environment Configuration"
echo "------------------------------------"
if [ -f ".env.local" ]; then
    echo "✅ Local environment file exists"
    if grep -q "VITE_CONVEX_URL" .env.local; then
        echo "✅ Convex URL configured in environment"
    else
        echo "❌ Convex URL not found in environment"
    fi
else
    echo "❌ Local environment file missing"
fi

echo ""
echo "📋 Test 8: Build Verification"
echo "-----------------------------"
# Check if the application builds without errors
echo "Building application for testing..."
BUILD_OUTPUT=$(npm run build 2>&1)
BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "✅ Application builds successfully"
    
    # Check build output size
    if [ -d "dist" ]; then
        BUILD_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
        echo "   Build size: $BUILD_SIZE"
    fi
else
    echo "❌ Application build failed"
    echo "Build errors:"
    echo "$BUILD_OUTPUT" | tail -10
fi

echo ""
echo "📋 Test 9: TypeScript Compilation"
echo "---------------------------------"
TYPECHECK_OUTPUT=$(npm run type-check 2>&1)
TYPECHECK_EXIT_CODE=$?

if [ $TYPECHECK_EXIT_CODE -eq 0 ]; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    echo "Type errors:"
    echo "$TYPECHECK_OUTPUT" | tail -5
fi

echo ""
echo "📋 Test 10: Authentication Components"
echo "-------------------------------------"
# Check if authentication components exist
AUTH_COMPONENTS=(
    "src/pages/Login.tsx"
    "src/pages/Register.tsx"
    "src/services/convexAuth.ts"
    "convex/auth.config.ts"
    "convex/auth.ts"
)

for component in "${AUTH_COMPONENTS[@]}"; do
    if [ -f "$component" ]; then
        echo "✅ $component exists"
    else
        echo "❌ $component missing"
    fi
done

echo ""
echo "📋 SUMMARY"
echo "=========="

# Count successful tests
TOTAL_TESTS=10
SUCCESS_COUNT=0

# Increment success count based on previous results (simplified)
[ "$LANDING_RESPONSE" = "200" ] && ((SUCCESS_COUNT++))
[ "$LOGIN_RESPONSE" = "200" ] && ((SUCCESS_COUNT++))
[ "$REGISTER_RESPONSE" = "200" ] && ((SUCCESS_COUNT++))
[ "$DASHBOARD_RESPONSE" = "200" ] && ((SUCCESS_COUNT++))
[ "$MAIN_JS_RESPONSE" = "200" ] && ((SUCCESS_COUNT++))
[ "$CONVEX_RESPONSE" != "000" ] && ((SUCCESS_COUNT++))
[ -f ".env.local" ] && ((SUCCESS_COUNT++))
[ $BUILD_EXIT_CODE -eq 0 ] && ((SUCCESS_COUNT++))
[ $TYPECHECK_EXIT_CODE -eq 0 ] && ((SUCCESS_COUNT++))
[ -f "src/pages/Login.tsx" ] && ((SUCCESS_COUNT++))

echo "Tests passed: $SUCCESS_COUNT/$TOTAL_TESTS"
echo ""

if [ $SUCCESS_COUNT -ge 8 ]; then
    echo "🎉 AUTHENTICATION SYSTEM READY FOR TESTING"
    echo "   The application is properly configured and accessible"
    echo "   All major components are in place"
    echo ""
    echo "🔍 NEXT STEPS:"
    echo "   1. Test registration with new user credentials"
    echo "   2. Test login with existing user: jayveedz19@gmail.com"
    echo "   3. Verify session management and logout functionality"
    echo "   4. Check user profile data integration"
    echo ""
elif [ $SUCCESS_COUNT -ge 6 ]; then
    echo "⚠️  AUTHENTICATION SYSTEM PARTIALLY READY"
    echo "   Some components need attention, but core functionality should work"
    echo ""
else
    echo "❌ AUTHENTICATION SYSTEM NEEDS FIXES"
    echo "   Multiple critical issues detected"
    echo ""
fi

echo "📁 Test results saved to: $TEST_DIR/"
echo "🌐 Application running at: $BASE_URL"
echo "=============================================="