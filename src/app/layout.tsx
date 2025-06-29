import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const Inter = localFont({
  src: "./fonts/Inter.ttf",
  variable: "--font-Inter",
});

export const metadata: Metadata = {
  title: "Анимоджи",
  description: "Генерация эмоций и картинок с помощью ИИ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${Inter.variable} antialiased`}
      >
        <div className="flex flex-col grow h-full">{children}</div>
      </body>
    </html>
  );
}
