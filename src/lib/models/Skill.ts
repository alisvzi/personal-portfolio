import { Skill } from "@/types";
import mongoose, { Schema } from "mongoose";

const schema = new Schema<Skill>({
  name: {
    type: String,
    required: true,
  },
  nameFa: {
    type: String,
    required: false,
  },
  category: {
    type: String,
    required: false,
  },
  level: {
    type: Number,
    required: false,
    min: 0,
    max: 100,
  },
  icon: {
    type: String,
    required: false,
  },
  order: {
    type: Number,
    default: 0,
  }
});

export default mongoose.models.Skill || mongoose.model<Skill>("Skill", schema);
