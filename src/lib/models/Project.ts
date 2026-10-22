import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * A gallery image.
 *
 * `_id: false` because these are value objects, not entities: they are always
 * read and written as part of their parent project, and a per-image ObjectId
 * would add noise to every payload for no benefit.
 */
const projectImageSchema = new Schema(
  {
    url: { type: String, required: true, trim: true, maxlength: 1000 },
    placeholder: { type: String, required: false, trim: true },
  },
  { _id: false },
);

const projectSchema = new Schema(
  {
    /**
     * URL segment of the detail page.
     *
     * Optional at the schema level so documents created before detail pages
     * existed remain valid; the data layer derives a slug for them and the
     * admin panel persists one on the next save.
     */
    slug: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      maxlength: 80,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    titleFa: { type: String, required: false, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    descriptionFa: { type: String, required: false, trim: true, maxlength: 2000 },
    /** Long-form case study, one paragraph per blank line. */
    longDescription: { type: String, required: false, trim: true, maxlength: 20000 },
    longDescriptionFa: {
      type: String,
      required: false,
      trim: true,
      maxlength: 20000,
    },
    role: { type: String, required: false, trim: true, maxlength: 120 },
    year: { type: String, required: false, trim: true, maxlength: 20 },
    client: { type: String, required: false, trim: true, maxlength: 160 },
    imageUrl: { type: String, required: true, trim: true },
    imagePlaceholderUrl: { type: String, required: false, trim: true },
    gallery: { type: [projectImageSchema], default: [] },
    githubUrl: { type: String, required: false, trim: true, maxlength: 500 },
    projectUrl: { type: String, required: false, trim: true, maxlength: 500 },
    technologies: { type: String, required: true, trim: true, maxlength: 500 },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0, min: 0, max: 9999 },
  },
  { timestamps: true },
);

// Mirrors the sort in the data layer so the listing is served from the index.
projectSchema.index({ featured: -1, order: 1, _id: -1 });

export type ProjectDoc = InferSchemaType<typeof projectSchema>;

const ProjectModel =
  (mongoose.models.Project as Model<ProjectDoc>) ??
  mongoose.model<ProjectDoc>("Project", projectSchema);

export default ProjectModel;
