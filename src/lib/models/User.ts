import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string; // هش شده
  role: "admin";
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin"], default: "admin" },
});

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
