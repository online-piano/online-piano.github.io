export default function CookiesPage() {
  return (
    <div className="container py-14">
      <h1 className="text-4xl font-black">Cookie Policy</h1>
      <div className="card mt-8 max-w-3xl p-7 text-sm leading-7 text-slate-600">
        <p>
          <b>Last updated: September 2026</b>
        </p>
        <p className="mt-4">
          The current application does not require account cookies for its core
          piano functionality. Keyboard mappings and preferences can be stored
          using browser local storage.
        </p>
        <p className="mt-4">
          If analytics, advertising, authentication or other third-party
          services are introduced, this page should be updated to describe the
          technologies they use and how users can manage them.
        </p>
      </div>
    </div>
  );
}
