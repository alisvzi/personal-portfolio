import { ContentDocument } from "@/types";
import { Schema, model, models } from "mongoose";

const schema = new Schema<ContentDocument>({
  heroTitle: { type: String, required: true },
  heroSubtitle: { type: String, required: true },
  heroDescription: { type: String, required: true },
  aboutText: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
});

const ContentModel =
  models.Content || model<ContentDocument>("Content", schema);

export default ContentModel;
