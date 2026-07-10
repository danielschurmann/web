const team = [
  {
    name: "Daniel Schurmann",
    role: "Director",
    bio: "Contador Público (UBA). Fundó el estudio y lidera el asesoramiento a pymes.",
    featured: false,
  },
  {
    name: "Sebastián Cadenaba",
    role: "Contador Público",
    bio: "A cargo de las áreas de Sueldos e Impuestos del estudio.",
    featured: false,
  },
  {
    name: "Alejandra Fernández",
    role: "Atención a clientes",
    bio: "Coordina las tareas contables y el día a día con cada cliente.",
    featured: false,
  },
  {
    name: "Gabriel Marín",
    role: "Líder de AI",
    bio: "Diseña e implementa los agentes de AI que automatizan el área contable.",
    featured: true,
  },
];

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className="flex h-[104px] w-[104px] items-center justify-center rounded-full border border-border bg-band font-display text-2xl font-semibold text-accent"
      aria-hidden
    >
      {initials}
    </div>
  );
}

export function Team() {
  return (
    <section
      id="equipo"
      className="section-pad border-t border-border bg-white px-5 py-[76px]"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 text-center">
          <div className="text-[13px] font-semibold tracking-[0.12em] text-accent uppercase">
            El equipo
          </div>
          <h2 className="mt-2.5 font-display text-[clamp(26px,4vw,34px)] font-semibold tracking-[-0.02em] text-ink">
            Quiénes te acompañan
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((person) => (
            <div
              key={person.name}
              className={
                person.featured
                  ? "relative flex flex-col items-center rounded-2xl border-[1.5px] border-accent bg-accent/5 px-[22px] py-7 text-center"
                  : "flex flex-col items-center rounded-2xl border border-border bg-surface-muted px-[22px] py-7 text-center"
              }
            >
              {person.featured ? (
                <span className="absolute top-4 right-4 rounded-full bg-accent/12 px-2.5 py-0.5 text-[11px] font-bold tracking-[0.06em] text-accent">
                  IA
                </span>
              ) : null}
              <Avatar name={person.name} />
              <div className="mt-4 mb-1 font-display text-lg font-semibold text-ink">
                {person.name}
              </div>
              <div className="text-xs font-semibold tracking-[0.06em] text-accent uppercase">
                {person.role}
              </div>
              <div className="mt-2.5 text-sm leading-[1.5] text-muted">
                {person.bio}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
