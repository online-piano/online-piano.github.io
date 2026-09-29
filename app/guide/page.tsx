const steps = [
  [
    "1",
    "Choose your keyboard",
    "Use the 36-key compact mode or the full 88-key layout.",
  ],
  [
    "2",
    "Play a note",
    "Click a key, touch it on mobile, or use your computer keyboard.",
  ],
  [
    "3",
    "Customize controls",
    "Open the keyboard customization controls and assign your own keys.",
  ],
  [
    "4",
    "Use sustain",
    "Enable Sustain to let notes continue after you release a key.",
  ],
  [
    "5",
    "Practice songs",
    "Choose a demo melody and follow the highlighted current note.",
  ],
];
export default function GuidePage() {
  return (
    <div className="container py-14">
      <h1 className="text-4xl font-black">How to Play</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Everything you need to start playing Online Piano.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {steps.map(([n, t, d]) => (
          <div className="card p-6" key={n}>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-violet-100 font-black text-violet-700">
              {n}
            </div>
            <h2 className="mt-4 text-xl font-black">{t}</h2>
            <p className="mt-2 text-slate-600">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
