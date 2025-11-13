import { DEFAULT_CONTENT } from "@/lib/constants";
import { connectDB } from "@/lib/db/mongodb";
import ContentModel from "@/lib/models/Content";
import ContactSection from "../ContactSection";

export default async function ContactSectionServer() {
  await connectDB();
  const contentDoc = await ContentModel.findOne().lean();

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

  return <ContactSection content={content} />;
}