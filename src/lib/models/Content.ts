import { Content } from "@/types";
import mongoose, { Schema } from "mongoose";

const schema = new Schema<Content>({
  heroTitle: {
    type: String,
    required: true,
  },
  heroSubtitle: {
    type: String,
    required: true,
  },
  heroDescription: {
    type: String,
    required: true,
  },
  aboutText: {
    type: String,
    required: true,
  },
  contactEmail: {
    type: String,
    required: true,
  },
  contactPhone: {
    type: String,
    required: true,
  },
});

export default mongoose.models.Content ||
  mongoose.model<Content>("Content", schema);
