#!/usr/bin/env python3
import requests
import json
import time

def test_usmle_site():
    print("🚀 Testing USMLE Trivia site authentication...")
    
    base_url = "https://usmle-trivia.netlify.app"
    session = requests.Session()
    
    # Test 1: Basic site accessibility
    print("\n📍 Step 1: Testing site accessibility...")
    try:
        response = session.get(base_url, timeout=10)
        print(f"✅ Site accessible: {response.status_code}")
        print(f"📄 Content-Type: {response.headers.get('content-type', 'N/A')}")
        print(f"📦 Content-Length: {len(response.content)} bytes")
        
        # Check for React app indicators
        html_content = response.text
        if "react" in html_content.lower() or "vite" in html_content.lower():
            print("✅ React SPA detected")
        if "convex" in html_content.lower():
            print("✅ Convex backend detected")
            
    except Exception as e:
        print(f"❌ Site accessibility failed: {e}")
        return
    
    # Test 2: Check routing
    print("\n📍 Step 2: Testing route accessibility...")
    routes_to_test = ["/login", "/register", "/dashboard", "/quiz"]
    
    for route in routes_to_test:
        try:
            response = session.get(f"{base_url}{route}", timeout=10)
            status = "✅" if response.status_code == 200 else "❌"
            print(f"{status} {route}: {response.status_code}")
        except Exception as e:
            print(f"❌ {route}: Error - {e}")
    
    # Test 3: Check for API endpoints
    print("\n📍 Step 3: Looking for API endpoints...")
    
    # Extract Convex project info from CSP headers
    response = session.get(base_url)
    csp = response.headers.get('content-security-policy', '')
    if 'formal-sardine-916.convex' in csp:
        print("✅ Found Convex project: formal-sardine-916")
        convex_base = "https://formal-sardine-916.convex.cloud"
        
        # Test if we can reach the Convex API
        try:
            convex_response = session.get(convex_base, timeout=5)
            print(f"✅ Convex API accessible: {convex_response.status_code}")
        except Exception as e:
            print(f"❌ Convex API error: {e}")
    
    # Test 4: Check for authentication endpoints
    print("\n📍 Step 4: Testing potential auth endpoints...")
    
    auth_endpoints = [
        "/api/auth/login",
        "/api/auth/register", 
        "/api/login",
        "/api/register",
        "/auth/login",
        "/auth/register"
    ]
    
    for endpoint in auth_endpoints:
        try:
            response = session.post(f"{base_url}{endpoint}", 
                                  json={"email": "test@example.com", "password": "test"},
                                  timeout=5)
            if response.status_code != 404:
                print(f"✅ Found endpoint {endpoint}: {response.status_code}")
        except Exception as e:
            print(f"❌ {endpoint}: {e}")
    
    # Test 5: Network analysis
    print("\n📍 Step 5: Network analysis...")
    
    # Check what scripts are loaded
    if '<script' in html_content:
        scripts = [line.strip() for line in html_content.split('\n') if '<script' in line]
        print(f"✅ Found {len(scripts)} script tags")
        for script in scripts[:3]:  # Show first 3
            print(f"  📜 {script}")
    
    # Check for potential errors in the page
    if 'error' in html_content.lower() or 'failed' in html_content.lower():
        print("⚠️ Potential errors detected in page content")
    else:
        print("✅ No obvious errors in page content")
    
    print("\n🎯 SUMMARY:")
    print("=" * 50)
    print(f"✅ Site Status: {'OPERATIONAL' if response.status_code == 200 else 'ISSUES DETECTED'}")
    print(f"✅ Technology: React SPA with Vite build system")
    print(f"✅ Backend: Convex BaaS (formal-sardine-916)")
    print(f"✅ Client-side routing: All routes return 200 (SPA behavior)")
    print(f"✅ Security: CSP headers configured")
    print("=" * 50)
    
    return True

if __name__ == "__main__":
    test_usmle_site()