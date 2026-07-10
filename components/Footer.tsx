export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-3 px-5 py-[26px] text-[13.5px] text-faint md:flex-row md:items-center md:px-10">
        <div className="font-brand text-[17px] font-semibold text-ink">
          DS <span className="text-accent">&amp;</span> Asociados
        </div>
        <div>© {new Date().getFullYear()} · Buenos Aires, Argentina</div>
      </div>
    </footer>
  );
}
