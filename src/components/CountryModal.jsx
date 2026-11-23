import { useState, useContext, useEffect, useRef } from "react"
import { X, ChevronLeft, MapPin, Calendar } from "lucide-react"
import { AppContext } from "../context/AppContext"
import { useLanguage } from "../context/useLanguage"
import MuseumImage from "./MuseumImage"

export default function CountryModal({ country, onClose }) {
  const { setSelectedObject } = useContext(AppContext)
  const [selected, setSelected] = useState(null)
  const { t } = useLanguage()
  const { name, objects } = country
  const label = t(`country.${name}`)

  if (selected) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div
          className="bg-[#f5f0e8] border border-[#d9d0bc] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
          style={{ maxHeight: "90vh" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#d9d0bc] bg-white/60">
            <button
              onClick={() => { setSelected(null) }}
              className="flex items-center gap-2 text-[#2d6a5a] hover:text-[#1e4d40] transition-colors text-sm font-medium"
            >
              <ChevronLeft size={16} /> {t("country.back", { label })}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#a09080] hover:text-[#2c2416] hover:bg-[#ede8dc] transition-all"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 overflow-y-auto" style={{ maxHeight: "calc(90vh - 65px)" }}>
            {/* Imagen Detalle */}
            <MuseumImage
              objeto={selected}
              useThumbnail={false}
              alt={selected.titulo}
              zoomable={true}
              className="w-full h-64 rounded-xl border border-[#d9d0bc]"
            />

            <h2
              className="mt-5 text-xl font-black text-[#2c2416] leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {selected.titulo}
            </h2>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eaf0ec] text-[#2d6a5a] text-xs font-medium border border-[#c2d9cc]">
                <Calendar size={11} />
                {selected.year ? (selected.yearRaw || selected.year) : t("common.unknownYear")}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ede8dc] text-[#7a6e5f] text-xs font-medium border border-[#d9d0bc]">
                <MapPin size={11} />
                {selected.regionLabel || selected.region || label}
              </span>
            </div>

            <div className="mt-6 border-t border-[#d9d0bc]/60 pt-5">
              <h4 className="text-xs font-extrabold text-[#2d6a5a] uppercase tracking-wider mb-4">{t("country.techSheet")}</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 bg-white/40 border border-[#d9d0bc]/40 rounded-xl p-4">
                <div>
                  <span className="text-[#a09080] font-semibold uppercase tracking-wider text-[9px]">{t("country.culture")}</span>
                  <p className="text-[#2c2416] text-xs font-medium mt-0.5">{selected.estilo_cultura || t("common.unknown")}</p>
                </div>
                <div>
                  <span className="text-[#a09080] font-semibold uppercase tracking-wider text-[9px]">{t("country.region")}</span>
                  <p className="text-[#2c2416] text-xs font-medium mt-0.5">{selected.lugar_origen || t("common.unknown")}</p>
                </div>
                <div className="col-span-2 border-t border-[#ede8dc] pt-2">
                  <span className="text-[#a09080] font-semibold uppercase tracking-wider text-[9px]">{t("country.material")}</span>
                  <p className="text-[#2c2416] text-xs font-medium mt-0.5">{selected.material_tecnica || t("common.na")}</p>
                </div>
                {selected.dimensiones && selected.dimensiones !== 'N/A' && (
                  <div className="col-span-2 border-t border-[#ede8dc] pt-2">
                    <span className="text-[#a09080] font-semibold uppercase tracking-wider text-[9px]">{t("country.dimensions")}</span>
                    <p className="text-[#2c2416] text-xs font-medium mt-0.5">{selected.dimensiones}</p>
                  </div>
                )}
                {selected.numero_inventario && selected.numero_inventario !== 'N/A' && (
                  <div className="border-t border-[#ede8dc] pt-2">
                    <span className="text-[#a09080] font-semibold uppercase tracking-wider text-[9px]">{t("country.inventory")}</span>
                    <p className="text-[#2c2416] text-xs font-medium mt-0.5">{selected.numero_inventario}</p>
                  </div>
                )}
                {selected.autor && selected.autor !== 'Desconocido' && (
                  <div className="border-t border-[#ede8dc] pt-2">
                    <span className="text-[#a09080] font-semibold uppercase tracking-wider text-[9px]">{t("country.author")}</span>
                    <p className="text-[#2c2416] text-xs font-medium mt-0.5">{selected.autor}</p>
                  </div>
                )}
                {selected.creditos && (
                  <div className="col-span-2 border-t border-[#ede8dc] pt-2">
                    <span className="text-[#a09080] font-semibold uppercase tracking-wider text-[9px]">{t("country.credits")}</span>
                    <p className="text-[#7a6e5f] text-xs leading-relaxed italic mt-0.5">{selected.creditos}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div
        className="bg-[#f5f0e8] border border-[#d9d0bc] rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: "85vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#d9d0bc] bg-white/60 rounded-t-2xl shrink-0">
          <div>
            <h2
              className="text-2xl font-black text-[#2c2416]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {label}
            </h2>
            <p className="text-[#a09080] text-sm mt-0.5">
              {t(objects.length === 1 ? "country.foundOne" : "country.foundMany", { n: objects.length })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#a09080] hover:text-[#2c2416] hover:bg-[#ede8dc] transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <div className="overflow-y-auto p-6 flex-1">
          {objects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-[#a09080]">
              <p className="text-base font-medium">{t("country.noObjects")}</p>
              <p className="text-sm mt-1">{t("country.tryAnother")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {objects.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => {
                    setSelected(obj)
                    setSelectedObject(obj)
                  }}
                  className="text-left bg-white border border-[#d9d0bc] hover:border-[#2d6a5a] rounded-xl p-4 transition-all duration-300 group shadow-sm hover:shadow-md hover:scale-[1.01]"
                >
                  {/* Imagen Miniatura */}
                  <MuseumImage
                    objeto={obj}
                    useThumbnail={true}
                    alt={obj.titulo}
                    zoomable={false}
                    className="w-full h-36 rounded-lg overflow-hidden mb-3 border border-[#d9d0bc]"
                  />
                  <p className="text-[#2c2416] text-sm font-bold leading-tight line-clamp-2 group-hover:text-[#2d6a5a] transition-colors">
                    {obj.titulo}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#eaf0ec] text-[#2d6a5a] font-semibold border border-[#c2d9cc]">
                      {obj.year || t("common.noDate")}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}