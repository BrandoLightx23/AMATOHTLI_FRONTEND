import { useContext } from "react"
import { AppContext } from "../context/AppContext"
import { Lightbulb } from "lucide-react"
import MuseumImage from "./MuseumImage"
import Timeline from "./Timeline"

// ─────────────────────────────────────────────────────────────────────────────
// Panel principal de información del objeto seleccionado
// ─────────────────────────────────────────────────────────────────────────────
export default function InfoPanel() {
  const { selectedObject } = useContext(AppContext)

  return (
    <div
      className="w-full md:w-[30%] bg-[#f5f0e8] border-t md:border-t-0 md:border-l border-[#d9d0bc] p-6 overflow-y-auto flex flex-col"
      style={{ height: "calc(100vh - 180px)", minHeight: "350px" }}
    >
      <div className="flex-1">
        {!selectedObject ? (
          // ── Estado vacío: rosa de los vientos ──────────────────────────────
          <div className="h-full flex flex-col items-center justify-center text-center gap-6 pb-6">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <circle cx="60" cy="60" r="55" fill="none" stroke="#d9d0bc" strokeWidth="1" />
                <circle cx="60" cy="60" r="45" fill="none" stroke="#d9d0bc" strokeWidth="0.5" />
                <polygon points="60,5 55,30 60,25 65,30" fill="#2d6a5a" />
                <polygon points="60,115 55,90 60,95 65,90" fill="#a09080" />
                <polygon points="115,60 90,55 95,60 90,65" fill="#a09080" />
                <polygon points="5,60 30,55 25,60 30,65" fill="#a09080" />
                <line x1="60" y1="60" x2="22" y2="22" stroke="#d9d0bc" strokeWidth="0.8" />
                <line x1="60" y1="60" x2="98" y2="22" stroke="#d9d0bc" strokeWidth="0.8" />
                <line x1="60" y1="60" x2="22" y2="98" stroke="#d9d0bc" strokeWidth="0.8" />
                <line x1="60" y1="60" x2="98" y2="98" stroke="#d9d0bc" strokeWidth="0.8" />
                <text x="60" y="18" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#2d6a5a" fontFamily="serif">N</text>
                <text x="60" y="112" textAnchor="middle" fontSize="9" fill="#a09080" fontFamily="serif">S</text>
                <text x="107" y="64" textAnchor="middle" fontSize="9" fill="#a09080" fontFamily="serif">E</text>
                <text x="13" y="64" textAnchor="middle" fontSize="9" fill="#a09080" fontFamily="serif">O</text>
                <ellipse cx="60" cy="70" rx="6" ry="3" fill="#2d6a5a" opacity="0.2" />
                <path d="M60,40 C52,40 46,46 46,54 C46,64 60,76 60,76 C60,76 74,64 74,54 C74,46 68,40 60,40 Z" fill="#2d6a5a" />
                <circle cx="60" cy="54" r="5" fill="white" />
              </svg>
            </div>

            <div>
              <h2
                className="text-2xl font-black text-[#2d6a5a] tracking-wider"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                AMATOHTLI
              </h2>
              <div className="w-8 h-0.5 bg-[#2d6a5a] mx-auto my-3" />
              <p className="text-[#7a6e5f] text-sm leading-relaxed max-w-[200px] mx-auto">
                Selecciona un marcador en el mapa para ver información sobre la cultura, región u objeto.
              </p>
            </div>

            <div className="w-full bg-[#eaf0ec] border border-[#c2d9cc] rounded-xl p-4 text-left mt-2">
              <p className="flex items-center gap-2 text-[#2d6a5a] font-semibold text-sm mb-2">
                <Lightbulb size={14} /> Consejo
              </p>
              <p className="text-[#2d6a5a] text-xs leading-relaxed">
                Explora diferentes períodos para descubrir cómo cambió el arte precolombino a lo largo del tiempo.
              </p>
            </div>
          </div>
        ) : (
          // ── Detalle del objeto seleccionado ────────────────────────────────
          <div className="pb-6">
            <MuseumImage
              objeto={selectedObject}
              alt={selectedObject.titulo || "Objeto del museo"}
              className="w-full h-[220px]"
            />

            <h2
              className="mt-5 text-2xl font-black text-[#2c2416] leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {selectedObject.titulo}
            </h2>

            <div className="flex gap-2 mt-3 flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-[#eaf0ec] text-[#2d6a5a] text-xs font-bold border border-[#c2d9cc]">
                {selectedObject.yearRaw || (selectedObject.year ? `${selectedObject.year} d.C.` : "Fecha desconocida")}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#ede8dc] text-[#7a6e5f] text-xs font-bold border border-[#d9d0bc]">
                {selectedObject.pais || "Mesoamérica"}
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-4 text-xs border-t border-[#d9d0bc]/50 pt-4">
              <div>
                <span className="text-[#a09080] font-bold uppercase tracking-wider text-[10px]">Cultura / Estilo:</span>
                <p className="text-[#2c2416] font-medium mt-0.5">{selectedObject.estilo_cultura || "Desconocida"}</p>
              </div>
              <div>
                <span className="text-[#a09080] font-bold uppercase tracking-wider text-[10px]">Región / Procedencia:</span>
                <p className="text-[#2c2416] font-medium mt-0.5">{selectedObject.lugar_origen || "Desconocida"}</p>
              </div>
              <div>
                <span className="text-[#a09080] font-bold uppercase tracking-wider text-[10px]">Material / Técnica:</span>
                <p className="text-[#2c2416] font-medium mt-0.5">{selectedObject.material_tecnica || "N/A"}</p>
              </div>
              {selectedObject.dimensiones && selectedObject.dimensiones !== 'N/A' && (
                <div>
                  <span className="text-[#a09080] font-bold uppercase tracking-wider text-[10px]">Dimensiones:</span>
                  <p className="text-[#2c2416] font-medium mt-0.5">{selectedObject.dimensiones}</p>
                </div>
              )}
              {selectedObject.numero_inventario && selectedObject.numero_inventario !== 'N/A' && (
                <div>
                  <span className="text-[#a09080] font-bold uppercase tracking-wider text-[10px]">Número de Inventario:</span>
                  <p className="text-[#2c2416] font-medium mt-0.5">{selectedObject.numero_inventario}</p>
                </div>
              )}
              {selectedObject.creditos && (
                <div className="border-t border-[#d9d0bc]/20 pt-2 mt-2">
                  <span className="text-[#a09080] font-bold uppercase tracking-wider text-[10px]">Créditos:</span>
                  <p className="text-[#7a6e5f] text-[11px] leading-relaxed italic mt-0.5">{selectedObject.creditos}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-auto pt-6 border-t border-[#d9d0bc]/50">
        <Timeline />
      </div>
    </div>
  )
}