export default function AboutPage() {
  return (
    <div className="container py-14">
      <h1 className="text-4xl font-black">About Online Piano</h1>
      <div className="card mt-8 max-w-3xl p-7 text-slate-600">
        <p>
          Online Piano is a browser-based virtual piano designed to make
          practicing and experimenting with piano accessible without installing
          desktop software.
        </p>
        <p className="mt-4">
          The piano sound uses the Salamander Grand Piano sample set through the
          Tone.js Salamander audio resources. Sample licensing and attribution
          should be retained when redistributing this project.
        </p>
        <p className="mt-4">
          The application is designed to keep keyboard mappings and basic
          preferences in the browser rather than requiring an account.
        </p>
      </div>
    </div>
  );
}
