const words = [
  "36 STATES",
  "774 LGAS",
  "LIVE TENDERS",
  "VERIFIED KYC",
  "OPEN AWARDS",
  "FIELD REPORTS",
  "CIVIC MAP",
  "AI DESK",
];

export default function WordTicker() {
  const loop = [...words, ...words];
  return (
    <div className="relative overflow-hidden border-y border-white/8 bg-navy-deep py-5 text-white">
      <div className="ticker-track flex w-max gap-10 pr-10">
        {loop.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="flex items-center gap-10 font-serif text-xl italic tracking-tight text-white/80 md:text-[1.65rem]"
          >
            {word}
            <span className="text-forest" aria-hidden>
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
