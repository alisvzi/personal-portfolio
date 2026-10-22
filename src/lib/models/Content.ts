import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * Singleton document holding the editable copy for the landing page.
 *
 * The schema is typed from the schema definition itself (`InferSchemaType`)
 * rather than from the API-facing `Content` interface, which previously
 * extended the DOM `Document` type by accident because it was not imported.
 *
 * The `*Fa` fields hold the Persian variants. They are optional on purpose:
 * adding them is additive, so the document that already exists in production
 * keeps working and simply falls back to the base value until a Persian
 * translation is written in the admin panel. Nothing is migrated or rewritten.
 */
const contentSchema = new Schema(
  {
    heroTitle: { type: String, required: true, trim: true, maxlength: 160 },
    heroSubtitle: { type: String, required: true, trim: true, maxlength: 160 },
    heroDescription: { type: String, required: true, trim: true, maxlength: 600 },
    aboutText: { type: String, required: true, trim: true, maxlength: 4000 },
    contactEmail: { type: String, required: true, trim: true, maxlength: 254 },
    contactPhone: { type: String, required: true, trim: true, maxlength: 40 },

    heroTitleFa: { type: String, trim: true, maxlength: 160 },
    heroSubtitleFa: { type: String, trim: true, maxlength: 160 },
    heroDescriptionFa: { type: String, trim: true, maxlength: 600 },
    aboutTextFa: { type: String, trim: true, maxlength: 4000 },
  },
  { timestamps: true },
);

export type ContentDoc = InferSchemaType<typeof contentSchema>;

const ContentModel =
  (mongoose.models.Content as Model<ContentDoc>) ??
  mongoose.model<ContentDoc>("Content", contentSchema);

export default ContentModel;
