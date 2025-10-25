import { Experience } from "@/types";
import mongoose, { Schema } from "mongoose";

const ExperienceSchema: Schema<Experience> = new Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  period: { type: String, required: true },
  description: { type: String, required: true },
  technologies: { type: [String], required: true },
  order: { type: Number, default: 0 }
});

export default mongoose.models.Experience ||
  mongoose.model<Experience>("Experience", ExperienceSchema);
