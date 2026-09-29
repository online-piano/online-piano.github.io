"use client";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const isChinese = language === "zh";
  const links = [
    ["/", isChinese ? "钢琴" : "Piano"],
    ["/songs", isChinese ? "曲目" : "Songs"],
    ["/keyboard", isChinese ? "键盘设置" : "Keyboard"],
    ["/guide", isChinese ? "指南" : "Guide"],
    ["/about", isChinese ? "关于" : "About"],
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-black text-lg">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-600 text-white">
            ♫
          </span>
          Online Piano
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            className="language-toggle"
            onClick={() => setLanguage(isChinese ? "en" : "zh")}
            aria-label={isChinese ? "Switch to English" : "切换到中文"}
          >
            {isChinese ? "EN" : "中文"}
          </button>
          <button
            className="btn md:hidden"
            onClick={() => setOpen(!open)}
            aria-label={isChinese ? "打开菜单" : "Open menu"}
          >
            ☰ {isChinese ? "菜单" : "Menu"}
          </button>
        </div>
      </div>
      {open && (
        <nav className="container grid gap-1 border-t border-slate-100 py-3 md:hidden">
          {links.map(([href, label]) => (
            <Link
              onClick={() => setOpen(false)}
              key={href}
              href={href}
              className="rounded-lg px-3 py-3 font-semibold hover:bg-slate-100"
            >
              {label}
            </Link>
          ))}
          <Link
            onClick={() => setOpen(false)}
            href="/privacy"
            className="rounded-lg px-3 py-3 text-sm text-slate-600"
          >
            {isChinese ? "隐私政策" : "Privacy Policy"}
          </Link>
        </nav>
      )}
    </header>
  );
}
