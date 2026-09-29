export default function PrivacyPage() {
  return (
    <div className="container py-14">
      <h1 className="text-4xl font-black">Privacy Policy</h1>
      <div className="card mt-8 max-w-3xl p-7 text-sm leading-7 text-slate-600">
        <p>
          <b>Last updated: September 2026</b>
        </p>
        <h2 className="mt-6 text-xl font-black text-slate-900">
          Information stored locally
        </h2>
        <p>
          Online Piano may store keyboard mappings and interface preferences in
          your browser using local storage. This information is intended to
          remain on your device.
        </p>
        <h2 className="mt-6 text-xl font-black text-slate-900">
          Audio and recordings
        </h2>
        <p>
          Playing piano and recording are handled by browser APIs. Recordings
          are not automatically uploaded to a server by this application.
        </p>
        <h2 className="mt-6 text-xl font-black text-slate-900">
          Third-party resources
        </h2>
        <p>
          The application may load piano samples from the Tone.js Salamander
          audio CDN. Your browser therefore makes network requests to the
          resource provider when samples are loaded.
        </p>
        <h2 className="mt-6 text-xl font-black text-slate-900">
          Analytics and advertising
        </h2>
        <p>
          If analytics or advertising services such as Google Analytics or
          Google AdSense are added in the future, this policy should be updated
          before those services are enabled.
        </p>
        <h2 className="mt-6 text-xl font-black text-slate-900">Contact</h2>
        <p>
          For privacy questions, contact the website operator through the
          contact method published on this website.
        </p>
      </div>
    </div>
  );
}
