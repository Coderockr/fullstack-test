import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { Asterisk } from "@/components/glyphs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Aporte — Gestão de Investimentos",
    template: "%s · Aporte",
  },
  description:
    "Crie investimentos, acompanhe o rendimento composto e simule saques com imposto calculado.",
};

function BackgroundArt() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* manchas de luz mais claras, como na referência */}
      <div className="absolute -top-32 left-[12%] h-105 w-105 rounded-full bg-white/35 blur-3xl" />
      <div className="absolute top-[45%] -right-32 h-120 w-120 rounded-full bg-white/25 blur-3xl" />
      {/* fagulhas espalhadas */}
      <span className="absolute left-[8%] top-[30%] text-foreground/15">
        <Asterisk size={14} />
      </span>
      <span className="absolute right-[14%] top-[16%] text-foreground/12">
        <Asterisk size={18} />
      </span>
      <span className="absolute left-[22%] bottom-[12%] text-foreground/10">
        <Asterisk size={12} />
      </span>
      <span className="absolute right-[6%] bottom-[28%] text-foreground/15">
        <Asterisk size={15} />
      </span>
    </div>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <Image
        src="/logo.png"
        alt="CodeRockr"
        width={782}
        height={604}
        priority
        className="h-11 w-auto rounded-lg"
      />
    </Link>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <BackgroundArt />
        <header className="sticky top-0 z-10 bg-dark shadow-lg shadow-dark/20">
          <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5">
            <Logo />
            <Link
              href="/investments/new"
              className="btn-primary border border-lime/25 px-4 py-2 text-sm"
            >
              + Novo investimento
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
          {children}
        </main>
        <footer className="mt-6 bg-dark py-6">
          <p className="mx-auto flex max-w-5xl items-center gap-2 px-5 text-xs text-on-dark/70">
            <Asterisk size={11} className="text-lime" />
            Aporte — rendimento composto de 0,52% ao mês · desafio fullstack
          </p>
        </footer>
      </body>
    </html>
  );
}
