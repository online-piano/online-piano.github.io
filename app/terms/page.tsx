export default function TermsPage() {
  return (
    <div className="container py-14">
      <h1 className="text-4xl font-black">Terms of Use</h1>
      <div className="card mt-8 max-w-3xl p-7 text-sm leading-7 text-slate-600">
        <p>
          By using Online Piano, you agree to use the service lawfully and
          responsibly.
        </p>
        <h2 className="mt-6 text-xl font-black text-slate-900">Service</h2>
        <p>
          The website is provided for playing, learning and experimentation.
          Features may change or become temporarily unavailable.
        </p>
        <h2 className="mt-6 text-xl font-black text-slate-900">
          Audio and content
        </h2>
        <p>
          Third-party samples and resources remain subject to their respective
          licenses. Users are responsible for checking rights when
          redistributing recordings or project content.
        </p>
        <h2 className="mt-6 text-xl font-black text-slate-900">Disclaimer</h2>
        <p>
          The service is provided without a guarantee of uninterrupted
          availability or suitability for a particular purpose.
        </p>
      </div>
    </div>
  );
}
