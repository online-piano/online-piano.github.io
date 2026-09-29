import Link from "next/link";
export default function MenuPage() {
  const items = [
    ["/", "🎹 Piano", "Play the piano in your browser."],
    ["/songs", "🎵 Songs", "Practice songs and melodies."],
    ["/keyboard", "⌨ Keyboard", "Customize your computer keyboard mapping."],
    ["/guide", "📖 Guide", "Learn how to use the piano."],
    ["/about", "ℹ About", "About Online Piano and its audio resources."],
    ["/privacy", "🔒 Privacy", "Privacy policy."],
    ["/terms", "📄 Terms", "Terms of use."],
    ["/cookies", "🍪 Cookies", "Cookie policy."],
  ];
  return (
    <div className="container py-14">
      <h1 className="text-4xl font-black">Menu</h1>
      <p className="mt-3 text-slate-600">
        Everything available on Online Piano.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(([href, title, desc]) => (
          <Link
            href={href}
            key={href}
            className="card p-6 hover:-translate-y-1 transition"
          >
            <div className="text-xl font-black">{title}</div>
            <p className="mt-2 text-sm text-slate-500">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
