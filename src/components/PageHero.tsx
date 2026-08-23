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
    <header className="relative overflow-hidden border-b border-navy/8 bg-white pt-[4.75rem] sm:pt-[5.25rem] md:pt-[5.75rem]">
      <div className="pointer-events-none absolute -right-24 top-[-40%] h-72 w-72 rounded-full bg-forest/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-5 sm:pb-14 sm:pt-8 md:px-8 md:pb-20 md:pt-10">
        <p className="eyebrow">{label}</p>
        <h1 className="mt-4 max-w-3xl font-serif text-[clamp(1.85rem,6.5vw,3.8rem)] leading-[1.08] tracking-[-0.03em] text-navy sm:mt-5">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate sm:mt-4 sm:text-base md:text-[17px]">
          {description}
        </p>
      </div>
    </header>
  );
}
