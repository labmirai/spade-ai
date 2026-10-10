export default function Team() {
  const { TEAM_PI, TEAM_COPI, TEAM_ASSISTANTS } = require('@/constants');

  return (
    <section id="team" className="section-bg">
      <div className="section-container">

        <p className="section-label section-spacing">
          Research Group
        </p>
        <h2 className="section-spacing mb-2">
          SPADE-AI Team
        </h2>
        <p className="text-sm font-sans text-earth-700 leading-relaxed mb-12 max-w-lg">
          A collaborative research group advancing AI-driven precision agriculture
          at Jashore University of Science and Technology.
        </p>

        <div className="border-t border-earth-200 mb-10" />

        {/* PI */}
        <div className="mb-9">
          <p className="text-xs font-sans font-medium uppercase tracking-widest text-earth-500 mb-1">{TEAM_PI.role}</p>
          <h3 className="text-xl font-semibold text-earth-900 tracking-title mb-1.5">{TEAM_PI.name}</h3>
          <a href={`mailto:${TEAM_PI.email}`} className="text-fine font-sans text-earth-600 border-b border-earth-300 pb-px no-underline">
            {TEAM_PI.email}
          </a>
        </div>

        {/* Co-PI */}
        <div className="mb-12">
          <p className="text-xs font-sans font-medium uppercase tracking-widest text-earth-500 mb-1">{TEAM_COPI.role}</p>
          <h3 className="text-xl font-semibold text-earth-900 tracking-title mb-1.5">{TEAM_COPI.name}</h3>
          <a href={`mailto:${TEAM_COPI.email}`} className="text-fine font-sans text-earth-600 border-b border-earth-300 pb-px no-underline">
            {TEAM_COPI.email}
          </a>
        </div>

        <div className="border-t border-earth-200 mb-8" />

        <p className="text-xs font-sans font-medium uppercase tracking-widest text-earth-500 mb-5">
          Research Assistants
        </p>

        <div className="flex flex-col mb-14">
          {TEAM_ASSISTANTS.map((ra: { name: string; email: string }, i: number, arr: Array<{ name: string; email: string }>) => (
            <div key={i} className={`flex items-baseline justify-between flex-wrap gap-2 py-4 ${i < arr.length - 1 ? "border-b border-earth-100" : ""}`}>
              <span className="text-base font-semibold text-earth-900 tracking-title">{ra.name}</span>
              <a href={`mailto:${ra.email}`} className="text-fine font-sans text-earth-600 border-b border-earth-300 pb-px no-underline">
                {ra.email}
              </a>
            </div>
          ))}
        </div>

        <div className="border-t border-earth-200 pt-8 flex items-center gap-5 flex-wrap">
          <img src="/logos/just.png" alt="Jashore University of Science and Technology" className="h-20 object-contain opacity-90" />
          <div>
            <p className="text-sm font-sans font-semibold text-earth-900">Jashore University of Science and Technology</p>
            <p className="text-xs font-sans text-earth-500 mt-0.5">Jashore, Bangladesh</p>
          </div>
        </div>

      </div>
    </section>
  );
}