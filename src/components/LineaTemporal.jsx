import { useState, useContext, useMemo } from "react"
import { AppContext } from "../context/AppContext"
import { useLanguage } from "../context/useLanguage"
import { UNKNOWN_YEAR } from "../constants"
import MuseumImage from "./MuseumImage"
import { Calendar, Info, ChevronRight, X } from "lucide-react"

// Épocas históricas: los textos están en i18n/translations.js (era.* y eraDesc.*)
const ERA_DESC_YEARS = [400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000]

function getEraNameKey(century) {
  if (century === UNKNOWN_YEAR) return "era.unknown"
  const num = Number(century)
  if (num >= 400 && num <= 900) return "era.early"
  if (num >= 1000 && num <= 1500) return "era.classic"
  if (num >= 1600 && num <= 1700) return "era.earlyPost"
  if (num >= 1800 && num <= 2000) return "era.latePost"
  return "era.undefined"
}

function getEraDescKey(century) {
  if (century === UNKNOWN_YEAR) return "eraDesc.unknown"
  const num = Number(century)
  return ERA_DESC_YEARS.includes(num) ? `eraDesc.${num}` : "eraDesc.undefined"
}

export default function LineaTemporal() {
  const { allObjects } = useContext(AppContext)
  const { t, formatCentury, formatYear } = useLanguage()
  const [detailedObject, setDetailedObject] = useState(null)

  // Agrupar los objetos de la base de datos por siglo o fecha desconocida
  const objectsByCentury = useMemo(() => {
    const groups = {}
    allObjects.forEach(obj => {
      if (obj.year !== null) {
        const century = Math.floor(obj.year / 100) * 100
        if (!groups[century]) groups[century] = []
        groups[century].push(obj)
      } else {
        if (!groups[UNKNOWN_YEAR]) groups[UNKNOWN_YEAR] = []
        groups[UNKNOWN_YEAR].push(obj)
      }
    })
    return groups
  }, [allObjects])

  // Lista ordenada de siglos que CONTIENEN objetos, con Fecha desconocida al final
  const activeCenturies = useMemo(() => {
    const centuries = Object.keys(objectsByCentury)
      .filter(k => k !== UNKNOWN_YEAR)
      .map(Number)
      .sort((a, b) => a - b)
      .map(String)

    if (objectsByCentury[UNKNOWN_YEAR]) {
      centuries.push(UNKNOWN_YEAR)
    }
    return centuries
  }, [objectsByCentury])

  const getEraColor = (century) => {
    if (century === UNKNOWN_YEAR) return "bg-[#a09080]"
    const num = Number(century)
    if (num >= 400 && num <= 900) return "bg-[#c9830a]"
    if (num >= 1000 && num <= 1500) return "bg-[#2d6a5a]"
    if (num >= 1600 && num <= 1700) return "bg-[#e8a012]"
    return "bg-[#b85c38]"
  }

  const getEraBorderColor = (century) => {
    if (century === UNKNOWN_YEAR) return "border-[#a09080]"
    const num = Number(century)
    if (num >= 400 && num <= 900) return "border-[#c9830a]"
    if (num >= 1000 && num <= 1500) return "border-[#2d6a5a]"
    if (num >= 1600 && num <= 1700) return "border-[#e8a012]"
    return "border-[#b85c38]"
  }

  const getEraTextColor = (century) => {
    if (century === UNKNOWN_YEAR) return "text-[#a09080]"
    const num = Number(century)
    if (num >= 400 && num <= 900) return "text-[#c9830a]"
    if (num >= 1000 && num <= 1500) return "text-[#2d6a5a]"
    if (num >= 1600 && num <= 1700) return "text-[#e8a012]"
    return "text-[#b85c38]"
  }

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8" style={{ background: "#f5f0e8" }}>

      {/* Encabezado */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-[#2d6a5a] tracking-wider mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          {t("lt.title")}
        </h2>
        <p className="text-xs text-[#7a6e5f]">
          {t("lt.subtitle")}
        </p>
      </div>

      {/* Línea de Tiempo Vertical */}
      <div className="relative border-l-2 border-[#d9d0bc] ml-4 md:ml-12 pl-6 md:pl-10 pb-12 flex flex-col gap-12">
        {activeCenturies.map((century) => {
          const era = { name: t(getEraNameKey(century)), desc: t(getEraDescKey(century)) }
          const list = objectsByCentury[century] || []

          return (
            <div key={century} className="relative">

              {/* Nodo / Punto de conexión en la línea de tiempo */}
              <div className={`absolute -left-[31px] md:-left-[47px] top-1.5 w-4 h-4 md:w-6 md:h-6 rounded-full border-4 border-[#f5f0e8] ${getEraColor(century)} shadow-sm z-10`} />

              {/* Encabezado del Siglo */}
              <div className="mb-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`text-xl md:text-2xl font-black ${getEraTextColor(century)}`} style={{ fontFamily: "'Playfair Display', serif" }}>
                    {century === UNKNOWN_YEAR ? t("common.unknownDate") : formatCentury(Number(century))}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${getEraColor(century)}`}>
                    {era.name}
                  </span>
                </div>

                {/* Explicación histórica */}
                <p className="text-xs text-[#7a6e5f] mt-1.5 max-w-3xl leading-relaxed flex items-start gap-1.5">
                  <Info size={13} className="mt-0.5 flex-shrink-0 opacity-70" />
                  {era.desc}
                </p>
              </div>

              {/* Slider Horizontal de Objetos del Siglo */}
              <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 pr-6 scrollbar-hide">
                {list.map(obj => (
                  <div
                    key={obj.id}
                    onClick={() => setDetailedObject(obj)}
                    className={`flex-shrink-0 w-44 sm:w-56 bg-white border border-[#d9d0bc] rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1`}
                  >
                    <div className="w-full aspect-square overflow-hidden rounded-2xl bg-[#f9f8f6] mb-3">
                      <MuseumImage
                        objeto={obj}
                        alt={obj.titulo || t("common.object")}
                        zoomable={false}
                        useThumbnail={true}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="text-xs font-extrabold text-[#c9830a] uppercase tracking-wider truncate mb-1">
                      {obj.estilo_cultura || t("common.mesoamerica")}
                    </h4>
                    <h4 className="text-sm font-bold text-[#2c2416] line-clamp-2 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {obj.titulo}
                    </h4>
                    <p className="text-xs text-[#7a6e5f] truncate mt-1">
                      {obj.lugar_origen || t("common.unknownOrigin")}
                    </p>
                  </div>
                ))}

                {/* Tarjeta de resumen final del siglo */}
                <div className="flex-shrink-0 w-44 bg-[#ede8dc]/50 border border-[#d9d0bc] rounded-3xl p-6 flex flex-col justify-center items-center text-center">
                  <span className="text-2xl font-black text-[#2d6a5a]">{list.length}</span>
                  <span className="text-[10px] text-[#7a6e5f] font-bold uppercase tracking-widest mt-2">
                    {t("lt.objectsInCentury")}
                  </span>
                </div>
              </div>

            </div>
          )
        })}
      </div>

      {/* Modal de Detalle (Igual para mantener identidad visual) */}
      {detailedObject && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f5f0e8] border-2 border-[#d9d0bc] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">

            <button
              onClick={() => setDetailedObject(null)}
              className="absolute right-4 top-4 p-2 rounded-full bg-white/80 hover:bg-white border border-[#d9d0bc] text-[#2c2416] transition-colors z-10 cursor-pointer shadow-sm"
            >
              <X size={18} />
            </button>

            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/2 aspect-square rounded-2xl overflow-hidden bg-white shadow-inner">
                <MuseumImage
                  objeto={detailedObject}
                  alt={detailedObject.titulo}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="w-full md:w-1/2 flex flex-col justify-start">
                <span className="text-[10px] uppercase font-extrabold text-[#c9830a] tracking-wider">
                  {t("detail.inventoryNo", { value: detailedObject.numero_inventario || t("common.noNumber") })}
                </span>

                <h3 className="text-2xl font-black text-[#2c2416] mt-1 mb-3 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {detailedObject.titulo}
                </h3>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#eaf0ec] text-[#2d6a5a] text-[10px] font-bold border border-[#c2d9cc]">
                    {detailedObject.estilo_cultura || t("common.unknownCulture")}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#ede8dc] text-[#7a6e5f] text-[10px] font-bold border border-[#d9d0bc]">
                    {detailedObject.yearRaw || (detailedObject.year ? formatYear(detailedObject.year) : t("common.unknownDate"))}
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 text-xs border-t border-[#d9d0bc]/50 pt-4">
                  <div>
                    <span className="text-[#a09080] font-semibold">{t("detail.region")}</span>
                    <p className="text-[#2c2416] font-medium">{detailedObject.lugar_origen || t("common.unknown")}</p>
                  </div>
                  <div>
                    <span className="text-[#a09080] font-semibold">{t("detail.material")}</span>
                    <p className="text-[#2c2416] font-medium">{detailedObject.material_tecnica || t("common.unknown")}</p>
                  </div>
                  {detailedObject.dimensiones && (
                    <div>
                      <span className="text-[#a09080] font-semibold">{t("detail.dimensions")}</span>
                      <p className="text-[#2c2416] font-medium">{detailedObject.dimensiones}</p>
                    </div>
                  )}
                  {detailedObject.creditos && (
                    <div className="border-t border-[#d9d0bc]/20 pt-2 mt-2">
                      <span className="text-[#a09080] font-semibold">{t("detail.credits")}</span>
                      <p className="text-[#7a6e5f] text-[11px] leading-relaxed italic">{detailedObject.creditos}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-8 py-4 bg-[#ede8dc]/50 border-t border-[#d9d0bc]/50 flex justify-end">
              <button
                onClick={() => setDetailedObject(null)}
                className="px-5 py-2 rounded-xl bg-[#2d6a5a] hover:bg-[#1e4d40] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {t("detail.close")}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
