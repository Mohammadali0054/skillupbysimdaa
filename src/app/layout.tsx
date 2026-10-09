import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "SimdaaLearn - Online Courses - Learn Anything, On Your Schedule",
  description: "SimdaaLearn is an online learning and teaching marketplace with over 213,000 courses and 62 million students. Learn programming, marketing, data science and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main style={{ minHeight: 'calc(100vh - 72px - 300px)' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
