#!/usr/bin/env node

/**
 * Quick test script to verify Shopify configuration
 * Run with: node scripts/test-shopify.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Shopify Configuration...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found');
  console.log('   Create it with your Shopify credentials\n');
  process.exit(1);
}

// Read .env.local
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

// Check required variables
const required = [
  'NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN',
  'NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN',
  'NEXT_PUBLIC_SHOP_ENABLED'
];

let allPresent = true;

required.forEach(varName => {
  const value = envVars[varName];
  if (!value || value === '' || value.includes('your-')) {
    console.log(`❌ ${varName}: Not configured`);
    allPresent = false;
  } else {
    // Mask sensitive values
    const displayValue = varName.includes('TOKEN') 
      ? `${value.substring(0, 10)}...` 
      : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  }
});

console.log('');

if (!allPresent) {
  console.log('⚠️  Missing required configuration variables');
  console.log('   Add them to .env.local:\n');
  console.log('   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com');
  console.log('   NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-access-token');
  console.log('   NEXT_PUBLIC_SHOP_ENABLED=true\n');
  process.exit(1);
}

// Optional: Test API connection
if (envVars.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN && envVars.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
  console.log('🌐 Testing Shopify API connection...\n');
  
  const domain = envVars.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token = envVars.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const apiVersion = envVars.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION || '2024-10';
  
  const testUrl = `https://${domain}/api/${apiVersion}/graphql.json`;
  
  fetch(testUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({
      query: '{ shop { name } }'
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.data && data.data.shop) {
        console.log(`✅ Connected to Shopify store: ${data.data.shop.name}`);
        console.log(`   Store domain: ${domain}\n`);
      } else if (data.errors) {
        console.log('❌ API Error:', data.errors[0]?.message || 'Unknown error');
        console.log('   Check your Storefront API access token\n');
      } else {
        console.log('⚠️  Unexpected response from Shopify API\n');
      }
    })
    .catch(err => {
      console.log('❌ Connection failed:', err.message);
      console.log('   Check your network connection and store domain\n');
    });
} else {
  console.log('✅ Configuration looks good!');
  console.log('   Start the dev server: pnpm dev\n');
}

