import { DEFAULT_CONTENT } from "@/lib/constants";
import { connectDB } from "@/lib/db/mongodb";
import ContentModel from "@/lib/models/Content";
import SkillModel from "@/lib/models/Skill";
import { AboutSection } from "../AboutSection";

export default async function AboutSectionServer() {
  await connectDB();

  const [contentDoc, skills] = await Promise.all([
    ContentModel.findOne().lean(),
    SkillModel.find({}).sort({ order: 1, name: 1 }).lean(),
  ]);

  const content = contentDoc
    ? {
        heroTitle: contentDoc.heroTitle,
        heroSubtitle: contentDoc.heroSubtitle,
        heroDescription: contentDoc.heroDescription,
        aboutText: contentDoc.aboutText,
        contactEmail: contentDoc.contactEmail,
        contactPhone: contentDoc.contactPhone,
      }
    : DEFAULT_CONTENT;

  const serializedSkills = (skills as any[]).map((s) => {
    const { _id, __v, ...rest } = s;
    const id = typeof _id === "string" ? _id : _id?.toString?.();
    return { ...rest, id, _id: id };
  });

  return <AboutSection content={content} skills={serializedSkills as any} />;
}