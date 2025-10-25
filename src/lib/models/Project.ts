import { Project } from "@/types";
import mongoose, { Schema } from "mongoose";

const schema = new Schema<Project>({
  title: {
    type: String,
    required: true,
  },
  titleFa: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: true,
  },
  descriptionFa: {
    type: String,
    required: false,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  imagePlaceholderUrl: {
    type: String,
    required: true,
  },
  githubUrl: {
    type: String,
    required: true,
  },
  projectUrl: {
    type: String,
    required: true,
  },
  technologies: {
    type: String,
    required: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  }
});

export default mongoose.models.Project ||
  mongoose.model<Project>("Project", schema);
