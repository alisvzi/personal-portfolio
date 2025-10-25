import Navigation from "@/components/layout/Navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      {children}

      {/* Navigation Sidebar */}
      <Navigation />
    </main>
  );
}
