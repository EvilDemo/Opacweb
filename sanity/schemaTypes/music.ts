import { defineField, defineType } from "sanity";

export default defineType({
  name: "music",
  title: "Music",
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
      name: "albumWebsite",
      title: "Album Website",
      type: "url",
      description:
        "Optional: Link to a custom album website. If provided, this will be shown instead of Spotify link on the media page",
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
