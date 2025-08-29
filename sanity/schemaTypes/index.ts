import { type SchemaTypeDefinition } from "sanity";
import pictures from "./pictures";
import video from "./video";
import music from "./music";
import radio from "./radio";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [pictures, video, music, radio],
};
