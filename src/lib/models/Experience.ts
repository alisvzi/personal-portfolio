import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const experienceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    company: { type: String, required: true, trim: true, maxlength: 160 },
    period: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    technologies: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) => value.length > 0 && value.length <= 24,
        message: "Between 1 and 24 technologies are required",
      },
    },
    order: { type: Number, default: 0, min: 0, max: 9999 },
  },
  { timestamps: true },
);

experienceSchema.index({ order: 1, _id: -1 });

export type ExperienceDoc = InferSchemaType<typeof experienceSchema>;

const ExperienceModel =
  (mongoose.models.Experience as Model<ExperienceDoc>) ??
  mongoose.model<ExperienceDoc>("Experience", experienceSchema);

export default ExperienceModel;
