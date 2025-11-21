import { connectDB } from "@/lib/db/mongodb";
import ContentModel from "@/lib/models/Content";
import { Github, Linkedin, Twitter } from "lucide-react";
import type { ReactNode } from "react";
const SideToolBars = async ({ children }: { children?: ReactNode }) => {
  await connectDB();
  const contentDoc = await ContentModel.findOne().lean();

  return (
    <div className="relative">
      {children}
      {/* Social Links - Floating */}
      <div className="fixed left-8 bottom-8 hidden lg:flex flex-col items-center space-y-4">
        <div className="flex flex-col space-y-4">
          {[
            {
              name: "github",
              icon: Github,
              link: "https://github.com/yourprofile",
            },
            {
              name: "linkedin",
              icon: Linkedin,
              link: "https://linkedin.com/in/yourprofile",
            },
            {
              name: "twitter",
              icon: Twitter,
              link: "https://twitter.com/yourprofile",
            },
          ].map(({ name, icon: Icon, link }, index) => (
            <a
              key={name}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={name}
              className="text-[#8892b0] hover:text-[#64ffda] transition-colors"
            >
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </div>
        <div className="w-px h-20 bg-[#8892b0]" />
      </div>

      {/* Email - Floating */}
      <div className="fixed right-8 bottom-8 hidden lg:flex flex-col items-center space-y-4">
        <a
          href={`mailto:${contentDoc.contactEmail}`}
          className="text-[#8892b0] hover:text-[#64ffda] transition-colors font-mono text-sm tracking-widest"
          style={{ writingMode: "vertical-rl" }}
        >
          {contentDoc.contactEmail}
        </a>
        <div className="w-px h-20 bg-[#8892b0]" />
      </div>
    </div>
  );
};

export default SideToolBars;
