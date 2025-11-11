#!/usr/bin/env node

/**
 * Test script for Shopify webhook configuration
 * Usage: node scripts/test-webhook.mjs [webhook-url]
 *
 * This script simulates a Shopify webhook request to test your webhook endpoint.
 */

import crypto from "crypto";

const WEBHOOK_URL = process.argv[2] || "https://opacweb.vercel.app/api/shopify-webhook";
const SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;

if (!SECRET) {
  console.error("❌ Error: SHOPIFY_WEBHOOK_SECRET environment variable is not set!");
  console.log("\nTo use this script, set the environment variable:");
  console.log('  export SHOPIFY_WEBHOOK_SECRET="your-secret-here"');
  console.log("  node scripts/test-webhook.mjs [webhook-url]");
  process.exit(1);
}

// Sample webhook payload
const testPayload = {
  id: 8765432109876,
  title: "Test Product",
  handle: "test-product",
  body_html: "<p>This is a test product</p>",
  vendor: "Opac",
  product_type: "Test",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  status: "active",
  tags: "test",
  variants: [
    {
      id: 43210987654321,
      product_id: 8765432109876,
      title: "Default Title",
      price: "19.99",
      sku: "TEST-001",
      inventory_quantity: 10,
      inventory_management: "shopify",
    },
  ],
};

const rawBody = JSON.stringify(testPayload);

// Generate HMAC signature (same way Shopify does)
const signature = crypto.createHmac("sha256", SECRET).update(rawBody, "utf8").digest("base64");

console.log("🧪 Testing Shopify Webhook Configuration\n");
console.log("📍 Webhook URL:", WEBHOOK_URL);
console.log("🔑 Secret configured:", SECRET ? `${SECRET.substring(0, 10)}...` : "NO");
console.log("📝 Signature:", signature.substring(0, 30) + "...");
console.log("📦 Payload size:", rawBody.length, "bytes\n");

async function testWebhook() {
  try {
    console.log("📤 Sending test webhook...\n");

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Topic": "products/update",
        "X-Shopify-Hmac-Sha256": signature,
        "X-Shopify-Shop-Domain": "test-shop.myshopify.com",
        "X-Shopify-API-Version": "2024-10",
      },
      body: rawBody,
    });

    const responseText = await response.text();
    let responseJson;

    try {
      responseJson = JSON.parse(responseText);
    } catch {
      responseJson = { raw: responseText };
    }

    console.log("📥 Response Status:", response.status, response.statusText);
    console.log("📥 Response:", JSON.stringify(responseJson, null, 2));

    if (response.status === 200 && responseJson.success) {
      console.log("\n✅ SUCCESS! Webhook is working correctly.");
      console.log("✅ Cache revalidation should have been triggered.");
    } else if (response.status === 401) {
      console.log("\n❌ AUTHENTICATION FAILED!");
      console.log("The webhook secret on your server does not match the one used to sign this request.");
      console.log("\n🔧 Steps to fix:");
      console.log("1. Go to your Vercel project settings");
      console.log("2. Check the SHOPIFY_WEBHOOK_SECRET environment variable");
      console.log("3. It should match the secret shown in your Shopify webhook settings");
      console.log(
        "4. The secret in the image you shared: 659aac82fbba5aaa3cd1193924a5e70cfa045a39b4b2fd103d39c2d7fd1643a9"
      );
    } else {
      console.log("\n⚠️ UNEXPECTED RESPONSE");
      console.log("Check the response details above for more information.");
    }
  } catch (error) {
    console.error("\n❌ ERROR sending webhook:", error.message);
    console.error(error);
  }
}

// Also test GET endpoint
async function testGetEndpoint() {
  console.log("\n\n🧪 Testing GET endpoint (health check)...\n");

  try {
    const response = await fetch(WEBHOOK_URL);
    const data = await response.json();

    console.log("📥 Response:", JSON.stringify(data, null, 2));

    if (data.configured) {
      console.log("\n✅ Webhook endpoint is configured");
    } else {
      console.log("\n⚠️ Webhook endpoint is NOT properly configured");
      console.log("Make sure SHOPIFY_WEBHOOK_SECRET is set in your environment variables");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Run tests
testGetEndpoint().then(() => testWebhook());
