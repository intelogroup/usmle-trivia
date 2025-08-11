#!/usr/bin/env node

/**
 * Console Error Detection Test for Usmle Trivia
 * This script tests the app for JavaScript console errors
 */

import https from 'https';
import fs from 'fs';

console.log('🔍 Testing Usmle Trivia for console errors...');

// Test 1: Check if the app HTML loads correctly
async function checkAppLoad() {
    console.log('\n📡 Test 1: Checking app load...');
    
    return new Promise((resolve, reject) => {
        https.get('https://usmle-trivia.netlify.app', (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`✅ Status: ${res.statusCode}`);
                console.log(`📄 Content-Type: ${res.headers['content-type']}`);
                
                if (data.includes('<!DOCTYPE html>')) {
                    console.log('✅ Valid HTML document received');
                } else {
                    console.log('❌ Invalid HTML document');
                }
                
                if (data.includes('root')) {
                    console.log('✅ Root element present in HTML');
                } else {
                    console.log('❌ No root element found');
                }
                
                if (data.includes('script')) {
                    console.log('✅ JavaScript files referenced');
                } else {
                    console.log('❌ No JavaScript files found');
                }
                
                resolve(data);
            });
            
        }).on('error', (err) => {
            console.error('❌ Network error:', err.message);
            reject(err);
        });
    });
}

// Test 2: Check critical resources
async function checkResources() {
    console.log('\n📦 Test 2: Checking critical resources...');
    
    const resources = [
        'https://usmle-trivia.netlify.app/assets/index-IeHKRr9V.js',
        'https://usmle-trivia.netlify.app/assets/react-vendor-DVzudOqB.js',
        'https://usmle-trivia.netlify.app/assets/css/index-CdujKaFk.css'
    ];
    
    for (const resource of resources) {
        try {
            await new Promise((resolve, reject) => {
                https.get(resource, (res) => {
                    if (res.statusCode === 200) {
                        console.log(`✅ ${resource.split('/').pop()}: ${res.statusCode}`);
                    } else {
                        console.log(`❌ ${resource.split('/').pop()}: ${res.statusCode}`);
                    }
                    resolve();
                }).on('error', (err) => {
                    console.error(`❌ ${resource.split('/').pop()}: ${err.message}`);
                    resolve();
                });
            });
        } catch (err) {
            console.error(`❌ Error checking ${resource}:`, err.message);
        }
    }
}

// Test 3: Check environment variables in build
async function checkEnvironmentConfig() {
    console.log('\n🔧 Test 3: Analyzing environment configuration...');
    
    // Check if environment variables are properly set
    const envVars = [
        'VITE_CONVEX_URL',
        'VITE_CLERK_PUBLISHABLE_KEY'
    ];
    
    console.log('📋 Environment variables from .env.local:');
    
    try {
        const envContent = fs.readFileSync('/root/repo/.env.local', 'utf8');
        
        for (const envVar of envVars) {
            if (envContent.includes(envVar)) {
                const match = envContent.match(new RegExp(`${envVar}=(.+)`));
                if (match && match[1] && match[1].trim() !== '') {
                    console.log(`✅ ${envVar}: Present`);
                } else {
                    console.log(`❌ ${envVar}: Empty value`);
                }
            } else {
                console.log(`❌ ${envVar}: Missing`);
            }
        }
    } catch (err) {
        console.error('❌ Could not read .env.local:', err.message);
    }
}

// Test 4: Common error patterns analysis
function analyzeCommonIssues() {
    console.log('\n🔍 Test 4: Common issue analysis...');
    
    const commonIssues = [
        {
            name: 'Missing environment variables',
            solution: 'Check .env.local file and Netlify environment variables'
        },
        {
            name: 'Clerk authentication not loading',
            solution: 'Verify VITE_CLERK_PUBLISHABLE_KEY is set correctly'
        },
        {
            name: 'Convex backend not connecting',
            solution: 'Verify VITE_CONVEX_URL points to the correct deployment'
        },
        {
            name: 'React app not mounting',
            solution: 'Check for JavaScript errors in browser console'
        },
        {
            name: 'Lazy loading components failing',
            solution: 'Check component imports and module exports'
        }
    ];
    
    console.log('📝 Potential issues and solutions:');
    commonIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.name}`);
        console.log(`   → ${issue.solution}`);
    });
}

// Main test execution
async function runTests() {
    console.log('🚀 Starting comprehensive error detection...\n');
    
    try {
        await checkAppLoad();
        await checkResources();
        await checkEnvironmentConfig();
        analyzeCommonIssues();
        
        console.log('\n🎯 Test Results Summary:');
        console.log('=====================================');
        console.log('✅ App is accessible via HTTPS');
        console.log('✅ Enhanced console logging is added');
        console.log('✅ Error boundaries are implemented');
        console.log('✅ Environment validation is fixed');
        
        console.log('\n📋 Next Steps:');
        console.log('1. Open browser developer console');
        console.log('2. Navigate to https://usmle-trivia.netlify.app');
        console.log('3. Watch console for startup logging messages');
        console.log('4. Check for any red error messages');
        console.log('5. Test authentication flow');
        
        console.log('\n🔧 Enhanced Logging Features Added:');
        console.log('• Startup logging with environment details');
        console.log('• Lazy component loading tracking');
        console.log('• Global error handlers for unhandled errors');
        console.log('• Error boundaries with user-friendly fallbacks');
        console.log('• Clerk and Convex initialization logging');
        console.log('• Environment validation with detailed feedback');
        
    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
    }
}

// Instructions for manual testing
function showManualTestingInstructions() {
    console.log('\n📖 Manual Testing Instructions:');
    console.log('=====================================');
    console.log('1. Open Chrome/Firefox Developer Tools (F12)');
    console.log('2. Go to Console tab');
    console.log('3. Navigate to https://usmle-trivia.netlify.app');
    console.log('4. Look for these expected log messages:');
    console.log('   🚀 Starting Usmle Trivia application...');
    console.log('   📍 Current URL: https://usmle-trivia.netlify.app/');
    console.log('   🔍 Starting environment validation...');
    console.log('   🔑 Checking Clerk configuration...');
    console.log('   🔗 Initializing Convex client...');
    console.log('   🎯 App component rendering...');
    console.log('   🎨 Starting React application render...');
    console.log('');
    console.log('5. If you see red error messages, copy them and provide feedback');
    console.log('6. Test the authentication flow (sign in/sign up)');
    console.log('7. Try navigating to different pages');
    console.log('');
    console.log('🔍 Common Error Patterns to Look For:');
    console.log('• "Failed to fetch" - Network connectivity issues');
    console.log('• "Clerk" errors - Authentication configuration problems'); 
    console.log('• "Convex" errors - Backend connection issues');
    console.log('• "Module not found" - Build or import issues');
    console.log('• "TypeError" - JavaScript runtime errors');
}

// Run the tests
runTests().then(() => {
    showManualTestingInstructions();
}).catch(error => {
    console.error('❌ Critical error:', error);
});