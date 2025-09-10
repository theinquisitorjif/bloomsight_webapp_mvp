import { Info } from "lucide-react";

type Flag = {
  key: string;
  name: string;
  img: string;      
  summary: string; 
  guidance?: string; 
};

const FLAGS: Flag[] = [
  {
    key: "green",
    name: "Green – Low Hazard",
    img: "/beach-flags/green.png",
    summary: "Calm conditions. Exercise normal caution.",
    guidance: "Always swim near a lifeguard and with a buddy."
  },
  {
    key: "yellow",
    name: "Yellow – Medium Hazard",
    img: "/beach-flags/yellow.png",
    summary: "Moderate surf and/or currents.",
    guidance: "Stay close to shore; weak swimmers should use flotation."
  },
  {
    key: "red",
    name: "Red – High Hazard",
    img: "/beach-flags/red.png",
    summary: "High surf and/or strong currents.",
    guidance: "Strong swimmers only; check in with lifeguards first."
  },
  {
    key: "double-red",
    name: "Double Red – Water Closed",
    img: "/beach-flags/double-red.png",
    summary: "Water closed to the public.",
    guidance: "Do not enter the water."
  },
  {
    key: "purple",
    name: "Purple – Marine Pests",
    img: "/beach-flags/purple.png",
    summary: "Dangerous marine life present (e.g., jellyfish).",
    guidance: "Be alert; ask lifeguards about current conditions."
  },
];

export default function BeachFlagsSection() {

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex items-center gap-2">
        <Info className="h-5 w-5" aria-hidden />
        <h2 className="text-xl font-semibold">Beach Flag Meanings</h2>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FLAGS.map((f) => (
            <li
            key={f.key}
            className="rounded-2xl border p-4 shadow-sm bg-white/60"
            >
            <div className="flex items-center gap-4">
                <img
                src={f.img}
                alt={`${f.name} flag`}
                className="h-14 w-14 object-contain"
                loading="lazy"
                />
                <h3 className="text-lg font-medium">{f.name}</h3>
            </div>
            <p className="mt-3 text-sm text-gray-700">{f.summary}</p>
            {f.guidance && (
                <p className="mt-2 text-sm text-gray-600">
                <span className="font-medium">Guidance: </span>
                {f.guidance}
                </p>
            )}
            </li>
        ))}

        {/* NEW: Safety card */}
        <li className="rounded-2xl border p-6 shadow-sm bg-white/80 flex flex-col items-center justify-center">
            <a
            href="/safety"
            className="w-full h-full flex flex-col items-center justify-center text-center hover:text-blue-700 transition-colors"
            >
            <img
                src="/beach-flags/safety.png"
                alt="Safety Info"
                className="h-14 w-14 mb-3"
            />
            <h3 className="text-lg font-semibold">Beach Safety</h3>
            <p className="mt-2 text-sm text-gray-600">Learn more about staying safe at the beach</p>
            </a>
        </li>
        </ul>


      <p className="mt-6 text-xs text-gray-500">
        Flag system based on common U.S. beach safety standards; always follow
        local lifeguard instructions and posted signage.
      </p>
    </section>
  );
}
