import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    /** bcrypt hash. Plain-text passwords are never stored. */
    password: { type: String, required: true },
    role: { type: String, enum: ["admin"], default: "admin" },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema>;

const UserModel =
  (mongoose.models.User as Model<UserDoc>) ??
  mongoose.model<UserDoc>("User", userSchema);

export default UserModel;
