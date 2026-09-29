import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white/70">
      <div className="container grid gap-8 py-10 md:grid-cols-3">
        <div>
          <div className="font-black text-lg">♫ Online Piano</div>
          <p className="mt-2 text-sm text-slate-500">
            Play piano directly in your browser.
          </p>
        </div>
        <div>
          <div className="mb-3 font-bold">Explore</div>
          <div className="grid gap-2 text-sm text-slate-600">
            <Link href="/">Piano</Link>
            <Link href="/menu">Menu</Link>
            <Link href="/songs">Songs</Link>
            <Link href="/keyboard">Keyboard</Link>
            <Link href="/guide">Guide</Link>
            <Link href="/about">About</Link>
          </div>
        </div>
        <div>
          <div className="mb-3 font-bold">Legal</div>
          <div className="grid gap-2 text-sm text-slate-600">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Use</Link>
            <Link href="/cookies">Cookie Policy</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">
        © 2026 Online Piano. All rights reserved.
      </div>
    </footer>
  );
}
