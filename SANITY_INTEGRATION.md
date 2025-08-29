# Sanity.io Integration for Opac Web

This document explains how to use the Sanity.io CMS integration for managing media content on your website.

## Overview

Your Next.js project now includes Sanity.io as a headless CMS to manage:

- **Picture Projects**: Photography and visual projects
- **Videos**: YouTube, Vimeo, and other video content
- **Music**: Original music tracks with Spotify integration
- **Radio Playlists**: Curated music playlists

## Accessing the Sanity Studio

1. **Start your development server**:

   ```bash
   npm run dev
   ```

2. **Open the Sanity Studio**:
   Navigate to `http://localhost:3000/studio` in your browser

3. **Log in**: Use your Google account (weareopac@gmail.com) to access the studio

## Content Management

### Picture Projects

- **Title**: Project name
- **Description**: Brief description of the project
- **Thumbnail**: Main thumbnail image (supports hotspot editing)
- **Gallery**: Additional images for the project gallery

### Videos

- **Title**: Video title
- **Description**: Video description
- **Platform**: Select from YouTube, Vimeo, or Other
- **Embed URL**: URL for embedding (e.g., YouTube embed URL)
- **Original URL**: Original video URL on the platform
- **Thumbnail**: Optional custom thumbnail image
- **Order**: Display order

### Music Tracks

- **Title**: Track name
- **Description**: Track description
- **Spotify URL**: Link to the track on Spotify
- **Genre**: Select from predefined genres
- **Cover Image**: Album/track cover image
- **Duration**: Track length (e.g., "3:45")
- **Order**: Display order

### Radio Playlists

- **Title**: Playlist name
- **Description**: Playlist description
- **Spotify URL**: Link to the playlist on Spotify
- **Genre**: Select from predefined genres
- **Cover Image**: Playlist cover image
- **Mood**: Playlist vibe/mood
- **Order**: Display order

## Adding Content

1. **Navigate to the desired content type** in the Sanity Studio
2. **Click "Create new"** button
3. **Fill in the required fields** (marked with \*)
4. **Upload images** using the image field
5. **Set the order** for proper display sequence
6. **Click "Publish"** to make content live

## Content Display

Your media page (`/media`) automatically fetches and displays content from Sanity:

- Content is fetched in real-time
- Images are automatically optimized
- Content is displayed in the order specified
- Empty states show helpful messages when no content exists

## Image Management

- **Hotspot Editing**: Click on uploaded images to set focal points
- **Automatic Optimization**: Images are automatically optimized and served via CDN
- **Responsive**: Images automatically adapt to different screen sizes

## Environment Variables

The following environment variables are automatically configured:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`: Your Sanity project ID
- `NEXT_PUBLIC_SANITY_DATASET`: Dataset name (production)
- `NEXT_PUBLIC_SANITY_API_VERSION`: API version

## Troubleshooting

### Content Not Loading

- Check that your development server is running
- Verify environment variables are set correctly
- Check browser console for error messages

### Images Not Displaying

- Ensure images are published in Sanity Studio
- Check that images have been uploaded successfully
- Verify image URLs in the browser network tab

### Studio Access Issues

- Make sure you're logged in with the correct Google account
- Check that the studio route is accessible at `/studio`
- Verify Sanity configuration files are present

## Next Steps

1. **Add Sample Content**: Create a few test entries for each content type
2. **Customize Schemas**: Modify field types and validation rules as needed
3. **Add More Content Types**: Extend the system for other media types
4. **Set Up Webhooks**: Configure real-time updates for production

## Support

For Sanity.io specific issues, refer to the [official documentation](https://www.sanity.io/docs).
For project-specific questions, check the codebase or contact the development team.
