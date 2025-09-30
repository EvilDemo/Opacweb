#!/usr/bin/env node

// Test script to simulate Sanity webhook calls
const https = require("https");

const WEBHOOK_URL = "https://www.opacweb.pt/api/sanity-webhook";
const SECRET =
  process.env.SANITY_WEBHOOK_SECRET || "your-sanity-webhook-secret"; // Use your actual webhook secret

// Test data simulating different Sanity webhook payloads
const testPayloads = [
  {
    _type: "pictures",
    _id: "test-picture-123",
    title: "Test Picture",
    _updatedAt: new Date().toISOString(),
  },
  {
    _type: "video",
    _id: "test-video-456",
    title: "Test Video",
    _updatedAt: new Date().toISOString(),
  },
  {
    _type: "music",
    _id: "test-music-789",
    title: "Test Music",
    _updatedAt: new Date().toISOString(),
  },
  {
    _type: "radio",
    _id: "test-radio-101",
    title: "Test Radio",
    _updatedAt: new Date().toISOString(),
  },
];

async function testWebhook(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "sanity-webhook-secret": SECRET,
        "Content-Length": data.length,
      },
    };

    const req = https.request(WEBHOOK_URL, options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        console.log(`✅ ${payload._type} webhook test:`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Response: ${responseData}`);
        console.log("");
        resolve({ status: res.statusCode, data: responseData });
      });
    });

    req.on("error", (error) => {
      console.error(`❌ ${payload._type} webhook test failed:`, error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log("🧪 Testing Sanity webhook revalidation...\n");

  for (const payload of testPayloads) {
    try {
      await testWebhook(payload);
      // Wait 1 second between tests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to test ${payload._type}:`, error.message);
    }
  }

  console.log("🎉 Webhook testing complete!");
  console.log("\nNext steps:");
  console.log("1. Check your production site for fresh content");
  console.log("2. Add content in Sanity Studio and publish");
  console.log("3. Verify it appears instantly on your site");
}

runTests().catch(console.error);
