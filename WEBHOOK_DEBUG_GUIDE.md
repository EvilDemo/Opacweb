# Shopify Webhook Debug Guide

## The Problem

Your Shopify webhooks are configured but returning **401 errors**, which means the webhook signature validation is failing. This prevents cache revalidation, so changes made in Shopify don't appear on the shop page.

### Why Individual Product Pages Work But Shop Grid Doesn't

- **Shop Grid** (`/shop`): Uses cached data with `unstable_cache` and tag `"shopify-products"`
- **Product Pages** (`/shop/[slug]`): Fetches fresh data on every request (not cached)
- **Result**: When webhooks fail, the grid shows stale data but individual pages show current data

## Root Cause: Signature Validation Failure

The webhook endpoint validates that requests are genuinely from Shopify by checking the HMAC signature. The 401 error means this validation is failing.

## Step-by-Step Fix

### 1. Find Your Webhook Secret in Shopify

The secret is shown in your webhook configuration in Shopify:

```
659aac82fbba5aaa3cd1193924a5e70cfa045a39b4b2fd103d39c2d7fd1643a9
```

This is visible in your screenshot at the bottom: "Your webhooks will be signed with..."

### 2. Set the Environment Variable in Vercel

#### Via Vercel Dashboard:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`opacweb`)
3. Go to **Settings** → **Environment Variables**
4. Add or update:
   - **Name**: `SHOPIFY_WEBHOOK_SECRET`
   - **Value**: `659aac82fbba5aaa3cd1193924a5e70cfa045a39b4b2fd103d39c2d7fd1643a9`
   - **Environment**: Check all (Production, Preview, Development)
5. Click **Save**

#### Via Vercel CLI:

```bash
vercel env add SHOPIFY_WEBHOOK_SECRET
# When prompted, paste: 659aac82fbba5aaa3cd1193924a5e70cfa045a39b4b2fd103d39c2d7fd1643a9
# Select: Production, Preview, Development (all)
```

### 3. Redeploy Your Application

After setting the environment variable, you MUST redeploy:

```bash
# Trigger a new deployment
vercel --prod

# Or via Vercel Dashboard:
# Go to Deployments → Click "..." → Redeploy
```

**Important**: Simply adding/updating environment variables does NOT automatically update running deployments. You must redeploy!

### 4. Test the Webhook Endpoint

#### Test via Browser:

Visit: `https://opacweb.vercel.app/api/shopify-webhook`

You should see:
```json
{
  "status": "ok",
  "message": "Shopify webhook endpoint ready",
  "configured": true,
  "allowedTopics": ["products/create", "products/update", "products/delete", "inventory_levels/update"],
  "timestamp": "2025-11-11T..."
}
```

If `"configured": false`, the environment variable is not set correctly.

#### Test with the Provided Script:

```bash
# Set the secret locally (use the same secret)
export SHOPIFY_WEBHOOK_SECRET="659aac82fbba5aaa3cd1193924a5e70cfa045a39b4b2fd103d39c2d7fd1643a9"

# Run the test script
node scripts/test-webhook.mjs https://opacweb.vercel.app/api/shopify-webhook
```

This simulates a real Shopify webhook request with proper signature.

### 5. Test from Shopify

In your Shopify admin:

1. Go to **Settings** → **Notifications** → **Webhooks**
2. Click on one of your webhook subscriptions
3. At the bottom, there should be a **"Send test notification"** button
4. Click it and check the response

### 6. Verify Logs in Vercel

1. Go to Vercel Dashboard → Your Project → **Logs**
2. Filter by `/api/shopify-webhook`
3. After sending a test webhook, you should see detailed logs:
   - `📥 Webhook request received`
   - `📋 Webhook details`
   - `✅ Signature validated successfully`
   - `🔄 Revalidating cache...`
   - `✅ Webhook processed successfully`

If you see `❌` errors, the logs will tell you exactly what's wrong.

## Common Issues & Solutions

### Issue 1: "No logs found"

**Cause**: The request never reaches your handler (could be blocked by Vercel edge, or wrong URL)

**Solution**:
- Verify the webhook URL is exactly: `https://opacweb.vercel.app/api/shopify-webhook`
- Check that your Vercel deployment is live and not failed
- Try accessing the GET endpoint in a browser first

### Issue 2: Still getting 401 after setting secret

**Cause**: Old deployment is still running, or secret has extra spaces

**Solution**:
- Redeploy your application (environment variables only apply to new deployments)
- Double-check the secret has no leading/trailing spaces
- Make sure you're testing against the production URL, not a preview deployment

### Issue 3: Webhook succeeds but shop grid still shows old data

**Cause**: Browser or CDN caching

**Solution**:
- Hard refresh the browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Wait a few seconds after the webhook fires
- Check if the product page shows the new data (it should, since it's not cached)
- If product page is updated but grid isn't, the revalidation might not be working

### Issue 4: Secret is correct but signature still fails

**Cause**: Request body is being modified before reaching the handler

**Solution**:
- Ensure you don't have any middleware that modifies the request body
- Check that Next.js config doesn't have body parsing overrides
- The webhook handler reads the raw body text before validation

## Understanding the Logs

With the improved logging, you'll see:

### ✅ Success Log:
```
📥 Webhook request received
📋 Webhook details { topic: 'products/update', shop: '...', ... }
✅ Signature validated successfully
📦 Webhook payload { topic: 'products/update', id: '...', handle: '...' }
🔄 Revalidating cache...
✅ Revalidated product page: /shop/product-handle
✅ Webhook processed successfully in 245ms
```

### ❌ Failed Signature Log:
```
📥 Webhook request received
📋 Webhook details { topic: 'products/update', ... }
❌ Signature mismatch { computed: 'ABC...', received: 'XYZ...' }
❌ Invalid webhook signature
```

### ❌ Missing Secret Log:
```
📥 Webhook request received
📋 Webhook details { ..., hasSecret: false, ... }
❌ SHOPIFY_WEBHOOK_SECRET environment variable is not set!
```

## Verification Checklist

- [ ] `SHOPIFY_WEBHOOK_SECRET` is set in Vercel environment variables
- [ ] The secret matches the one shown in Shopify (no typos, no extra spaces)
- [ ] The environment variable is set for Production (and Preview/Development if testing those)
- [ ] The application has been redeployed after setting the variable
- [ ] GET request to `/api/shopify-webhook` shows `"configured": true`
- [ ] Test webhook from Shopify returns status 200
- [ ] Vercel logs show `✅ Webhook processed successfully`
- [ ] After making a change in Shopify, the shop page updates after a refresh

## Still Having Issues?

If you've followed all steps and it's still not working:

1. **Check the exact error in Vercel logs** - The detailed logging will tell you exactly what's failing
2. **Verify the webhook URL** - It should be exactly `https://opacweb.vercel.app/api/shopify-webhook`
3. **Check Shopify webhook delivery logs** - Shopify keeps a log of all webhook deliveries and their responses
4. **Try creating a new webhook** - Sometimes Shopify's webhook cache can cause issues
5. **Contact me with the specific error** - Share the exact log output and we can debug further

## Technical Details

### How Shopify Webhooks Work:

1. Event happens in Shopify (e.g., product updated)
2. Shopify sends POST request to your webhook URL
3. Request includes:
   - `X-Shopify-Topic` header (e.g., "products/update")
   - `X-Shopify-Hmac-Sha256` header (signature)
   - JSON body with event data
4. Your server validates the signature using the shared secret
5. If valid, process the webhook and revalidate caches
6. Return 200 OK to Shopify

### The Signature:

```javascript
// How Shopify creates the signature:
const signature = crypto.createHmac('sha256', SECRET)
  .update(rawBody, 'utf8')
  .digest('base64');

// Your server must create the same signature from the raw body
// and compare it to the header value
```

### Cache Revalidation:

The webhook triggers:
- `revalidateTag("shopify-products")` - Invalidates the products cache
- `revalidatePath("/shop")` - Revalidates the shop page
- `revalidatePath("/shop/[handle]")` - Revalidates the specific product page

This tells Next.js to fetch fresh data on the next request.

