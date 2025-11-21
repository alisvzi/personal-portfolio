import { DEFAULT_CONTENT } from "@/lib/constants";
import { connectDB } from "@/lib/db/mongodb";
import ContentModel from "@/lib/models/Content";
import { Content } from "@/types";
import HeroSection from "../HeroSection";

export default async function HeroSectionServer() {
  await connectDB();
  const contentDoc = await ContentModel.findOne().lean<Content>();

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

  return <HeroSection content={content} />;
}
