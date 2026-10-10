export default function Impact() {
  const { ICSETEP_OBJECTIVES, NATIONAL_POLICIES, SDG_GOALS } = require('@/constants');

  return (
    <section id="impact" className="section-bg">
      <div className="section-container">

        <p className="section-label section-spacing">
          Research Impact
        </p>
        <h2 className="section-spacing mb-4">
          Impact & Significance
        </h2>
        <p className="text-sm font-sans text-earth-700 leading-relaxed mb-12 max-w-xl">
          Advancing sustainable agriculture through AI-driven innovation and inclusive digital transformation.
        </p>

        <div className="border-t border-earth-200 mb-12" />

        {/* ICSETEP + National Policy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">

          {/* ICSETEP */}
          <div>
            <img src="/logos/icsetep.png" alt="ICSETEP Logo" className="h-20 object-contain mb-5 opacity-90" />
            <h3 className="text-sm font-sans font-semibold text-earth-900 uppercase tracking-wider mb-2 pb-2 border-b border-earth-200">
              ICSETEP Alignment
            </h3>
            <p className="text-xs font-sans text-earth-600 leading-relaxed mb-4">
              SPADE-AI supports multiple ICSETEP objectives across research, education, and socio-economic impact.
            </p>
            <div className="flex flex-col">
              {ICSETEP_OBJECTIVES.map((item: { label: string }, i: number, arr: Array<{ label: string }>) => (
                <div key={i} className={`flex items-baseline gap-3 py-2.5 ${i < arr.length - 1 ? "border-b border-earth-100" : ""}`}>
                  <span className="w-1 h-1 rounded-full bg-earth-400 flex-shrink-0 mt-2" />
                  <span className="text-xs font-sans text-earth-800 leading-snug">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* National Policy */}
          <div>
            <img src="/logos/bd.png" alt="National Policy Logo" className="h-20 object-contain mb-5 opacity-90" />
            <h3 className="text-sm font-sans font-semibold text-earth-900 uppercase tracking-wider mb-2 pb-2 border-b border-earth-200">
              National Policy Alignment
            </h3>
            <p className="text-xs font-sans text-earth-600 leading-relaxed mb-4">
              The project is aligned with Bangladesh's key national frameworks for digital agriculture and food security.
            </p>
            <div className="flex flex-col">
              {NATIONAL_POLICIES.map((item: { label: string }, i: number, arr: Array<{ label: string }>) => (
                <div key={i} className={`flex items-baseline gap-3 py-2.5 ${i < arr.length - 1 ? "border-b border-earth-100" : ""}`}>
                  <span className="w-1 h-1 rounded-full bg-earth-400 flex-shrink-0 mt-2" />
                  <span className="text-xs font-sans text-earth-800 leading-snug">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="border-t border-earth-200 mb-12" />

        {/* SDGs */}
        <p className="text-xs tracking-widest uppercase text-earth-500 font-sans font-medium mb-2">
          UN Sustainable Development Goals
        </p>
        <h3 className="text-xl font-semibold text-earth-900 mb-2 tracking-title">
          Sustainable Development Goals
        </h3>
        <p className="text-xs font-sans text-earth-600 mb-8 leading-relaxed">
          SPADE-AI contributes to five United Nations SDGs
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-5 border border-earth-200">
          {SDG_GOALS.map((sdg: { logo: string; title: string; description: string }, i: number, arr: Array<{ logo: string; title: string; description: string }>) => (
            <div
              key={i}
              className={`p-5 flex flex-col gap-3 ${i < arr.length - 1 ? "border-b sm:border-b-0 sm:border-r border-earth-200" : ""}`}
            >
              <img src={sdg.logo} alt={sdg.title} className="w-12 h-12 object-contain" />
              <div>
                <p className="text-xs font-sans font-semibold text-earth-900 mb-1">{sdg.title}</p>
                <p className="text-xs font-sans text-earth-600 leading-relaxed">{sdg.description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}