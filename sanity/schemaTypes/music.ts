import { defineField, defineType } from "sanity";

export default defineType({
  name: "music",
  title: "By Us",
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
      name: "spotifyUrl",
      title: "Spotify URL",
      type: "url",
      description: "Link to the track on Spotify",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail",
      type: "image",
      description: "Album or track thumbnail image",
      options: {
        hotspot: true,
      },
    }),
  ],
});
