import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  name: string;
  email: string;
  subject?: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: false },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export default mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);