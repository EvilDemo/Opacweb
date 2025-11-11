# Quick Fix for Shopify Webhook 401 Error

## TL;DR - The Fix

Your webhook secret in Vercel doesn't match (or isn't set). Here's the quick fix:

### 1. Set the Environment Variable in Vercel

**The secret from your Shopify webhook:**
```
659aac82fbba5aaa3cd1193924a5e70cfa045a39b4b2fd103d39c2d7fd1643a9
```

**Add it to Vercel:**
1. Go to: https://vercel.com/your-username/opacweb/settings/environment-variables
2. Add: `SHOPIFY_WEBHOOK_SECRET` = `659aac82fbba5aaa3cd1193924a5e70cfa045a39b4b2fd103d39c2d7fd1643a9`
3. Select: Production, Preview, Development

### 2. Redeploy

```bash
vercel --prod
```

Or via Vercel dashboard: Deployments → Redeploy

### 3. Test

Visit: `https://opacweb.vercel.app/api/shopify-webhook`

Should show:
```json
{
  "status": "ok",
  "configured": true
}
```

### 4. Verify

1. In Shopify admin, go to your webhook
2. Click "Send test notification"
3. Should get status 200
4. Check Vercel logs for: `✅ Webhook processed successfully`

## That's It!

Once the webhook works, your shop page will automatically update when you change products in Shopify.

**For detailed troubleshooting**, see `WEBHOOK_DEBUG_GUIDE.md`

