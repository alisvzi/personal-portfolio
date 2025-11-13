import { connectDB } from "@/lib/db/mongodb";
import ProjectModel from "@/lib/models/Project";
import WorkSection from "../WorkSection";

export default async function WorkSectionServer() {
  await connectDB();
  const projects = await ProjectModel.find({})
    .sort({ featured: -1, order: 1, _id: -1 })
    .lean();

  const serialized = (projects as any[]).map((p) => {
    const { _id, __v, ...rest } = p;
    const id = typeof _id === "string" ? _id : _id?.toString?.();
    return { ...rest, id, _id: id };
  });

  return <WorkSection projects={serialized as any} />;
}