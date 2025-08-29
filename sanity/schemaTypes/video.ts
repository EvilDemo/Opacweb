import { defineField, defineType } from "sanity";

export default defineType({
  name: "video",
  title: "Video",
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
      name: "videoUrl",
      title: "Video URL",
      type: "url",
      description: "Link to the video",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "animatedCoverImage",
      title: "Animated Cover Image",
      type: "image",
      description: "Video cover image GIF",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      description: "Video cover image JPEG",
      options: {
        hotspot: true,
      },
    }),
  ],
});
