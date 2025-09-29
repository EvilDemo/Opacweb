# Sanity Webhook Setup for Automatic Cache Revalidation

This document explains how to set up automatic cache revalidation when content is updated in Sanity.

## Problem Solved

Previously, when you added new items in Sanity, they wouldn't appear in production immediately due to CDN caching. This setup ensures content updates are reflected within 1 minute.

## Setup Instructions

### 1. Environment Variables

Add these environment variables to your production deployment:

```bash
# Required for webhook security
SANITY_WEBHOOK_SECRET=your-secret-key-here

# Optional: For manual revalidation API
REVALIDATE_SECRET=your-manual-secret-here
```

### 2. Sanity Webhook Configuration

1. Go to your Sanity project dashboard
2. Navigate to **API** → **Webhooks**
3. Click **Create webhook**
4. Configure the webhook:
   - **Name**: `Next.js Cache Revalidation`
   - **URL**: `https://your-domain.com/api/sanity-webhook`
   - **Dataset**: `production` (or your dataset name)
   - **Trigger on**: `Create`, `Update`, `Delete`
   - **Filter**: Leave empty to trigger on all documents
   - **Secret**: Use the same value as `SANITY_WEBHOOK_SECRET`
   - **API Version**: `2025-08-28` (or your current version)

### 3. Document Types Supported

The webhook automatically revalidates cache for these document types:

- `pictures` → revalidates `pictures` tag
- `video` → revalidates `videos` tag
- `music` → revalidates `music` tag
- `radio` → revalidates `radio` tag

### 4. Manual Revalidation (Optional)

You can also manually trigger revalidation by calling:

```bash
curl -X POST "https://your-domain.com/api/revalidate?secret=your-manual-secret" \
  -H "Content-Type: application/json" \
  -d '{"tag": "pictures"}'
```

## How It Works

1. **Content Update**: You add/edit content in Sanity Studio
2. **Webhook Trigger**: Sanity sends a webhook to your Next.js app
3. **Cache Invalidation**: Next.js revalidates the specific cache tag
4. **Fresh Data**: Next request fetches fresh data from Sanity
5. **User Sees Update**: New content appears within 1 minute

## Cache Strategy

- **Cache Duration**: 1 minute (`revalidate: 60`)
- **CDN**: Still enabled for performance
- **Fresh Data**: Guaranteed within 1 minute of Sanity updates
- **Performance**: Maintains fast loading with smart caching

## Troubleshooting

### Webhook Not Working

1. Check webhook URL is correct
2. Verify `SANITY_WEBHOOK_SECRET` matches
3. Check Sanity webhook logs for errors
4. Verify your deployment has the environment variable

### Content Still Not Updating

1. Wait up to 1 minute for automatic revalidation
2. Use manual revalidation API
3. Check browser cache (hard refresh)
4. Verify document type is supported

### Testing

Test the webhook by:

1. Adding new content in Sanity Studio
2. Checking the webhook logs in Sanity dashboard
3. Verifying content appears on your site within 1 minute
