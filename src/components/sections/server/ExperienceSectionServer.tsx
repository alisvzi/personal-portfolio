import { connectDB } from "@/lib/db/mongodb";
import ExperienceModel from "@/lib/models/Experience";
import { ExperienceSection } from "../ExperienceSection";

export default async function ExperienceSectionServer() {
  await connectDB();
  const experiences = await ExperienceModel.find({})
    .sort({ order: 1, _id: -1 })
    .lean();

  const serialized = (experiences as any[]).map((e) => {
    const { _id, __v, ...rest } = e;
    const id = typeof _id === "string" ? _id : _id?.toString?.();
    return { ...rest, id };
  });

  return <ExperienceSection experience={serialized as any} />;
}