import { defineField, defineType } from "sanity";

export default defineType({
  name: "pictures",
  title: "Pictures",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule) =>
        Rule.required().custom((image: any) => {
          if (!image) return true;
          // Recommend optimal dimensions
          const width = image.asset?.metadata?.dimensions?.width;
          const height = image.asset?.metadata?.dimensions?.height;

          if (width && height) {
            const aspectRatio = width / height;
            const megapixels = (width * height) / 1000000;

            // Warn if image is too large (over 5MP)
            if (megapixels > 5) {
              return "Image is very large. Consider resizing to under 5MP for better performance.";
            }

            // Recommend 3:2 aspect ratio for media cards (1.5 ratio)
            if (aspectRatio < 1.3 || aspectRatio > 1.7) {
              return "Consider using a 3:2 aspect ratio (1.5) for better media card layout.";
            }
          }
          return true;
        }),
    }),
    defineField({
      name: "gallery",
      title: "Gallery Images",
      type: "array",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
        },
      ],
      validation: (Rule) =>
        Rule.custom((gallery: any) => {
          if (!gallery || gallery.length === 0) return true;

          // Check each image in the gallery
          for (const image of gallery) {
            if (image.asset?.metadata?.dimensions) {
              const width = image.asset.metadata.dimensions.width;
              const height = image.asset.metadata.dimensions.height;
              const megapixels = (width * height) / 1000000;

              // Warn if any image is too large
              if (megapixels > 8) {
                return "Some gallery images are very large. Consider resizing to under 8MP for better performance.";
              }
            }
          }
          return true;
        }),
    }),
  ],
});
