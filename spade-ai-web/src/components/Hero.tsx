export default function Hero() {
  return (
    <section id="home" className="section-bg border-b border-earth-200">
      <div className="section-container">

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 section-spacing">
          <span className="section-label">
            Jashore University of Science and Technology
          </span>
          <span className="text-earth-300" aria-hidden="true">·</span>
          <span className="section-label">
            University of Dhaka
          </span>
        </div>

        <div className="border-t border-earth-200 mb-10" />

        <p className="section-label section-spacing">
          Research Project — 2026–2027
        </p>

        <h1 className="text-earth-900 tracking-display max-w-[720px] mb-6">
          Deep Learning Based Soil Property Estimation
        </h1>

        <p className="text-body font-sans text-earth-700 border-l-2 border-earth-300 pl-5 max-w-[680px] mb-6">
          SPADE-AI: Deep Learning Based Soil Property Estimation from Smartphone
          Image through Spectral Reconstruction and Multi-Source Data Fusion for
          Crop Suitability Assessment and Rotation Planning
        </p>

        {/* <div className="flex flex-wrap items-center gap-2 mb-10 pl-5">
          {["Precision Agriculture", "Spectral Reconstruction", "Soil Analysis", "Deep Learning", "Crop Recommendation"].map((kw, i) => (
            <span key={i} className="text-xs font-sans text-earth-600 border border-earth-300 rounded-sm px-2 py-0.5">
              {kw}
            </span>
          ))}
        </div> */}

        <div className="border-t border-earth-200 mb-8" />

        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-wrap gap-0">
            {[
              { value: "2026", label: "Project Start" },
              { value: "2027", label: "Completion"    },
            ].map((stat, i, arr) => (
              <div key={i} className={i < arr.length - 1 ? "pr-7 mr-7 border-r border-earth-200" : ""}>
                <p className="text-xl font-semibold text-earth-900 leading-none tracking-snug mb-1">{stat.value}</p>
                <p className="text-xs font-sans font-medium uppercase tracking-widest text-earth-500">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-5 opacity-70">
            <img src="/logos/adb.png"     alt="Asian Development Bank" className="h-20 object-contain" />
            <img src="/logos/ugc.png"     alt="UGC Bangladesh"         className="h-20 object-contain" />
            <img src="/logos/icsetep.png" alt="ICSETEP"                className="h-20 object-contain" />
          </div>
        </div>

      </div>
    </section>
  );
}