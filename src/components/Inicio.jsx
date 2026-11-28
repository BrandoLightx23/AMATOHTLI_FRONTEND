import { useContext, useMemo } from "react"
import { AppContext } from "../context/AppContext"
import { useLanguage } from "../context/useLanguage"
import { Map, Calendar, Library, Gamepad2, ArrowRight } from "lucide-react"

export default function Inicio() {
  const { allObjects, collections, selectedCollectionSlug, setActiveTab } = useContext(AppContext)
  const { t } = useLanguage()

  const activeCollection = collections.find(collection => collection.slug === selectedCollectionSlug)
  const statsObjects = useMemo(() => activeCollection
    ? allObjects.filter(obj => String(obj.coleccion_id) === String(activeCollection.id))
    : allObjects, [allObjects, activeCollection])
  const total = statsObjects.length

  // Agrupar por países
  const countryCounts = {}
  statsObjects.forEach(obj => {
    // Usamos el país que el backend o frontend asocia a la región
    const region = (obj.lugar_origen || "").toLowerCase()
    let country = "other"
    if (region.includes("perú") || region.includes("peru") || region.includes("chancay") || region.includes("inca")) country = "peru"
    else if (region.includes("méxico") || region.includes("mexico") || region.includes("azteca") || region.includes("maya")) country = "mexico"
    else if (region.includes("ecuador")) country = "ecuador"
    else if (region.includes("colombia")) country = "colombia"
    else if (region.includes("guatemala")) country = "guatemala"
    else if (region.includes("costa rica")) country = "costa_rica"
    else if (region.includes("bolivia")) country = "bolivia"

    countryCounts[country] = (countryCounts[country] || 0) + 1
  })

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8" style={{ background: "#f5f0e8" }}>

      {/* Héroe Banner */}
      <div className="w-full max-w-5xl mx-auto bg-gradient-to-br from-[#2d6a5a] to-[#1e4d40] text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-md relative overflow-hidden mb-8 md:mb-10">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
          {/* Un gran círculo decorativo */}
          <circle cx="100" cy="100" r="150" fill="none" stroke="white" strokeWidth="20" />
        </div>

        <div className="max-w-2xl relative z-10">
          <span className="bg-[#c9830a] text-white text-xs font-extrabold uppercase px-3 py-1 rounded-full tracking-wider shadow-sm">
            {t("inicio.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mt-4 mb-4 tracking-wider leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            {t("inicio.heroTitle")}
          </h2>
          <p className="text-sm md:text-base text-[#e2ede8] leading-relaxed mb-8">
            {t("inicio.heroText")}
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setActiveTab("mapa")}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 bg-[#c9830a] hover:bg-[#b87208] text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <Map size={16} />
              {t("inicio.exploreMap")}
              <ArrowRight size={15} />
            </button>
            <button
              onClick={() => setActiveTab("juegos")}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-sm font-bold transition-all cursor-pointer"
            >
              <Gamepad2 size={16} />
              {t("inicio.goGames")}
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Secciones Rápidas */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">

        <div
          onClick={() => setActiveTab("mapa")}
          className="bg-white border border-[#d9d0bc] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 bg-[#eaf0ec] text-[#2d6a5a] rounded-xl flex items-center justify-center mb-3">
            <Map size={20} />
          </div>
          <h3 className="font-bold text-[#2c2416] text-sm mb-1">{t("inicio.card.map.title")}</h3>
          <p className="text-xs text-[#7a6e5f] leading-relaxed">{t("inicio.card.map.desc")}</p>
        </div>

        <div
          onClick={() => setActiveTab("linea_temporal")}
          className="bg-white border border-[#d9d0bc] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 bg-[#fff6e6] text-[#c9830a] rounded-xl flex items-center justify-center mb-3">
            <Calendar size={20} />
          </div>
          <h3 className="font-bold text-[#2c2416] text-sm mb-1">{t("inicio.card.timeline.title")}</h3>
          <p className="text-xs text-[#7a6e5f] leading-relaxed">{t("inicio.card.timeline.desc")}</p>
        </div>

        <div
          onClick={() => setActiveTab("coleccion")}
          className="bg-white border border-[#d9d0bc] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 bg-[#fdf2ee] text-[#b85c38] rounded-xl flex items-center justify-center mb-3">
            <Library size={20} />
          </div>
          <h3 className="font-bold text-[#2c2416] text-sm mb-1">{t("inicio.card.catalog.title")}</h3>
          <p className="text-xs text-[#7a6e5f] leading-relaxed">{t("inicio.card.catalog.desc")}</p>
        </div>

        <div
          onClick={() => setActiveTab("juegos")}
          className="bg-white border border-[#d9d0bc] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 bg-[#f3edf7] text-[#8e44ad] rounded-xl flex items-center justify-center mb-3">
            <Gamepad2 size={20} />
          </div>
          <h3 className="font-bold text-[#2c2416] text-sm mb-1">{t("inicio.card.games.title")}</h3>
          <p className="text-xs text-[#7a6e5f] leading-relaxed">{t("inicio.card.games.desc")}</p>
        </div>

      </div>

      {/* Estadísticas de la colección */}
      <div className="w-full max-w-5xl mx-auto bg-white border border-[#d9d0bc] rounded-3xl p-6 md:p-8 shadow-sm">
        <h3 className="text-xl font-bold text-[#2d6a5a] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
          {t("inicio.stats.title")}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-b border-[#f0ece4] pb-6 mb-6">
          <div>
            <p className="text-3xl font-black text-[#2d6a5a]">{total}</p>
            <p className="text-xs text-[#7a6e5f] uppercase tracking-wider font-semibold mt-1">{t("inicio.stats.total")}</p>
          </div>
          <div>
            <p className="text-3xl font-black text-[#c9830a]">{countryCounts["peru"] || 0}</p>
            <p className="text-xs text-[#7a6e5f] uppercase tracking-wider font-semibold mt-1">{t("inicio.stats.peru")}</p>
          </div>
          <div>
            <p className="text-3xl font-black text-[#b85c38]">{countryCounts["mexico"] || 0}</p>
            <p className="text-xs text-[#7a6e5f] uppercase tracking-wider font-semibold mt-1">{t("inicio.stats.mexico")}</p>
          </div>
          <div>
            <p className="text-3xl font-black text-[#8e44ad]">{Object.keys(countryCounts).length}</p>
            <p className="text-xs text-[#7a6e5f] uppercase tracking-wider font-semibold mt-1">{t("inicio.stats.countries")}</p>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-[#7a6e5f] uppercase tracking-wider mb-4">{t("inicio.stats.distribution")}</h4>
          <div className="flex flex-col gap-3">
            {Object.entries(countryCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([country, count]) => {
                const percentage = ((count / total) * 100).toFixed(1)
                return (
                  <div key={country} className="flex items-center gap-2 sm:gap-4 text-xs font-semibold">
                    <span className="w-20 sm:w-24 shrink-0 text-left text-[#2c2416]">{t(`inicio.country.${country}`)}</span>
                    <div className="flex-1 h-3 bg-[#ede8dc] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percentage}%` }}
                        className={`h-full rounded-full ${country === "peru" ? "bg-[#2d6a5a]" :
                          country === "mexico" ? "bg-[#c9830a]" :
                            country === "ecuador" ? "bg-[#b85c38]" :
                              "bg-[#a09080]"
                          }`}
                      />
                    </div>
                    <span className="shrink-0 min-w-[4.5rem] text-right whitespace-nowrap text-[#7a6e5f]">{count} ({percentage}%)</span>
                  </div>
                )
              })}
          </div>
        </div>
      </div>

    </div>
  )
}
