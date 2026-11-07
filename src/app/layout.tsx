import type { Metadata } from "next";
import { DbProvider } from "@/components/DbProvider";
import { SwRegister } from "@/components/SwRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "PetCaixa",
  description: "Registrador diário PetCaixa",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[#081318] text-white antialiased">
        <div className="pointer-events-none fixed -left-20 -top-20 h-64 w-64 rounded-full bg-teal-500/15 blur-[90px]" />
        <div className="pointer-events-none fixed -bottom-20 -right-20 h-64 w-64 rounded-full bg-yellow-500/10 blur-[90px]" />
        <SwRegister />
        <DbProvider>{children}</DbProvider>
      </body>
    </html>
  );
}
