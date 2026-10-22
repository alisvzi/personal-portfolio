import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const skillSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    nameFa: { type: String, required: false, trim: true, maxlength: 80 },
    category: { type: String, required: false, trim: true, maxlength: 80 },
    level: { type: Number, required: false, min: 0, max: 100 },
    icon: { type: String, required: false, trim: true, maxlength: 200 },
    order: { type: Number, default: 0, min: 0, max: 9999 },
  },
  { timestamps: true },
);

skillSchema.index({ order: 1, name: 1 });

export type SkillDoc = InferSchemaType<typeof skillSchema>;

const SkillModel =
  (mongoose.models.Skill as Model<SkillDoc>) ??
  mongoose.model<SkillDoc>("Skill", skillSchema);

export default SkillModel;
