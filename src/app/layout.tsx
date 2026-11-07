import type { Metadata } from "next";
import { DbProvider } from "@/components/DbProvider";
import { SwRegister } from "@/components/SwRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vendas",
  description: "Registro de vendas diárias",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-950 text-white antialiased">
        <SwRegister />
        <DbProvider>{children}</DbProvider>
      </body>
    </html>
  );
}
