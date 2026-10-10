export default function About() {
  return (
    <section id="about" className="section-bg">
      <div className="section-container">

        <p className="section-label section-spacing">
          The Project
        </p>
        <h2 className="section-spacing mb-12">
          About SPADE-AI
        </h2>

        <div className="border-t border-earth-200 mb-12" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left — key facts panel */}
          <div>
            <div className="border-l-2 border-earth-300 pl-5 mb-8">
              <p className="text-xs font-sans font-medium uppercase tracking-widest text-earth-500 mb-1">
                Core Insight
              </p>
              <p className="text-xl font-semibold text-earth-900 leading-snug tracking-title">
                Soil Science Meets AI
              </p>
              <p className="text-sm font-sans text-earth-600 mt-1 leading-relaxed">
                Bridging agriculture and technology
              </p>
            </div>

            <div className="flex flex-col">
              {[
                { term: "Domain",  def: "Precision Agriculture & Remote Sensing"    },
                { term: "Method",  def: "Spectral Reconstruction from RGB Images"   },
                { term: "Target",  def: "Smallholder Farmers in Bangladesh"         },
                { term: "Output",  def: "Bengali-language Mobile Application"       },
                { term: "Zones",   def: "~10 Agro-ecological Zones (AEZs)"         },
              ].map((item: { term: string; def: string }, i: number, arr: Array<{ term: string; def: string }>) => (
                <div
                  key={i}
                  className={`flex gap-4 py-2.5 ${i < arr.length - 1 ? "border-b border-earth-100" : ""}`}
                >
                  <span className="text-xs font-sans font-medium uppercase tracking-wider text-earth-500 pt-0.5 min-w-[68px]">
                    {item.term}
                  </span>
                  <span className="text-sm font-sans text-earth-800 leading-snug">
                    {item.def}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — text */}
          <div className="flex flex-col gap-9">
            <div>
              <h3 className="text-xs font-sans font-semibold uppercase tracking-wider text-earth-900 mb-3 pb-2 border-b border-earth-200">
                General Objective
              </h3>
              <p className="text-sm font-sans text-earth-800 leading-loose">
                To develop an AI-driven crop suitability recommendation system (SPADE-AI) that analyzes
                soil properties from smartphone images through spectral reconstruction and multi-source
                agro-ecological data fusion, enabling precise crop suitability and rotation recommendations
                for sustainable, data-informed agricultural practices, thereby enhancing soil health,
                increasing productivity, and strengthening rural socio-economic resilience in Bangladesh.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}