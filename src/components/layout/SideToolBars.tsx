import { Github, Linkedin } from "lucide-react";

import { SOCIAL_LINKS } from "@/lib/constants";
import { getContent } from "@/lib/data";

/**
 * Fixed side rails: contact on the leading edge, nothing on the trailing edge.
 *
 * Positioning note (important): the chapter navigation rail already owns the
 * *trailing* edge, vertically centred. Both rails previously sat on the same
 * edge — the email at `bottom-8` and the nav at `top-1/2` — so on short
 * viewports the two stacks overlapped each other and the email clipped against
 * the viewport edge. The contact rails therefore live on the *leading* edge as
 * one coherent column: email vertically centred, socials pinned to the bottom.
 *
 * All insets are logical (`start-*` / `end-*`) so the column mirrors correctly
 * in RTL instead of drifting over the content.
 *
 * A Server Component that reads through the cached data layer, so it shares the
 * landing page's single `Content` query instead of issuing its own.
 */

/** Gradient hairline shared by both rails, fading at both ends. */
function RailLine({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`h-16 w-px bg-gradient-to-b from-transparent via-accent/40 to-transparent ${className ?? ""}`}
    />
  );
}

export default async function SideToolBars() {
  const content = await getContent();

  const links = [
    { name: "GitHub", icon: Github, href: SOCIAL_LINKS.github },
    { name: "LinkedIn", icon: Linkedin, href: SOCIAL_LINKS.linkedin },
  ];

  return (
    <>
      {/* Email — leading edge, vertically centred (mirrors the nav rail). */}
      <div className="fixed start-8 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-4 lg:flex">
        <a
          href={`mailto:${content.contactEmail}`}
          // The address is Latin text inside a possibly-RTL page; isolating it
          // stops the bidi algorithm from reordering the dots and the `@`.
          dir="ltr"
          className="font-mono text-sm tracking-widest text-text-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          style={{ writingMode: "vertical-rl" }}
        >
          {content.contactEmail}
        </a>
        <RailLine />
      </div>

      {/* Social — leading edge, pinned to the bottom. */}
      <div className="fixed bottom-8 start-8 z-40 hidden flex-col items-center gap-4 lg:flex">
        <RailLine />
        <div className="flex flex-col gap-4">
          {links.map(({ name, icon: Icon, href }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer me"
              aria-label={name}
              className="text-text-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
