import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const messageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    subject: { type: String, required: false, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

messageSchema.index({ createdAt: -1 });
messageSchema.index({ read: 1, createdAt: -1 });

export type MessageDoc = InferSchemaType<typeof messageSchema>;

const MessageModel =
  (mongoose.models.Message as Model<MessageDoc>) ??
  mongoose.model<MessageDoc>("Message", messageSchema);

export default MessageModel;
