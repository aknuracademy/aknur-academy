import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AKNUR Academy",
  description: "Онлайн оқу платформасы",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="kk">
      <body>{children}</body>
    </html>
  );
}