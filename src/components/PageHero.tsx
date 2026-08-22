export default function PageHero({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <header className="relative overflow-hidden border-b border-navy/8 bg-white">
      <div className="pointer-events-none absolute -right-24 top-[-40%] h-72 w-72 rounded-full bg-forest/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <p className="eyebrow">{label}</p>
        <h1 className="mt-5 max-w-3xl font-serif text-[clamp(2.2rem,4.8vw,3.8rem)] leading-[1.08] tracking-[-0.03em] text-navy">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate md:text-[17px]">
          {description}
        </p>
      </div>
    </header>
  );
}
