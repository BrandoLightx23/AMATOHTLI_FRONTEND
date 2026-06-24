import { useState, useContext, memo } from "react"
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"
import { AppContext } from "../context/AppContext"
import CountryModal from "./CountryModal"
import { Plus, Minus, Crosshair } from "lucide-react"

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

const PAISES = {
  "Mexico":      { color: "#b8c9a0", hover: "#a0b888", label: "México",      markerPos: [-102, 23]    },
  "Guatemala":   { color: "#4a8a6a", hover: "#3d7a5a", label: "Guatemala",   markerPos: [-90.2, 15.5] },
  "Belize":      { color: "#2d6a5a", hover: "#226050", label: "Belice",      markerPos: [-88.5, 17.2] },
  "Honduras":    { color: "#5b9abf", hover: "#4a8aaf", label: "Honduras",    markerPos: [-86.5, 15.0] },
  "El Salvador": { color: "#e07060", hover: "#d06050", label: "El Salvador", markerPos: [-89.2, 13.7] },
  "Nicaragua":   { color: "#e8a840", hover: "#d89830", label: "Nicaragua",   markerPos: [-85.0, 12.9] },
  "Costa Rica":  { color: "#f0c050", hover: "#e0b040", label: "Costa Rica",  markerPos: [-84.0, 10.0] },
  "Panama":      { color: "#a0c0d0", hover: "#90b0c0", label: "Panamá",      markerPos: [-80.5, 9.0]  },
  "Colombia":    { color: "#b89080", hover: "#a88070", label: "Colombia",    markerPos: [-73.0, 4.0]  },
  "Ecuador":     { color: "#80b8a2", hover: "#70a892", label: "Ecuador",     markerPos: [-78.0, -1.8] },
  "Peru":        { color: "#a280b8", hover: "#9270a8", label: "Perú",        markerPos: [-75.0, -9.1] },
  "Bolivia":     { color: "#b8a280", hover: "#a89270", label: "Bolivia",     markerPos: [-64.0, -16.0]},
  "Brazil":      { color: "#80a2b8", hover: "#7092a8", label: "Brasil",      markerPos: [-55.0, -10.0]},
}


// Componente separado y memoizado — evita que React intente reconciliar
// nodos SVG que react-simple-maps ya manipuló directamente en el DOM
const PaisMarker = memo(({ name, config, count, isHovered, onEnter, onLeave, onClick }) => (
  <Marker
    coordinates={config.markerPos}
    onMouseEnter={onEnter}
    onMouseLeave={onLeave}
    onClick={onClick}
  >
    <g style={{ cursor: "pointer" }} transform="translate(-10,-24)">
      <path
        d="M10,0 C4.5,0 0,4.5 0,10 C0,17.5 10,24 10,24 C10,24 20,17.5 20,10 C20,4.5 15.5,0 10,0 Z"
        fill={isHovered ? "#1e4d40" : "#2d6a5a"}
        stroke="white"
        strokeWidth="1.5"
      />
      <circle cx="10" cy="10" r="4" fill="white" />
    </g>
    <text
      y={-30}
      textAnchor="middle"
      fontSize="9"
      fontWeight="700"
      fill={isHovered ? "#1e4d40" : "#2c2416"}
      stroke="white"
      strokeWidth="3"
      paintOrder="stroke"
      style={{ fontFamily: "Inter, sans-serif", pointerEvents: "none" }}
    >
      {config.label}{count > 0 ? ` (${count})` : ""}
    </text>
  </Marker>
))

const PAISES_ENTRIES = Object.entries(PAISES)

export default function MesoMap() {
  const { objects } = useContext(AppContext)
  const [hoveredCountry, setHoveredCountry] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(380)

  const objectsByCountry = objects.reduce((acc, obj) => {
    const region = obj.region || "Mesoamérica"
    const pais = Object.keys(PAISES).find(p =>
      region.toLowerCase().includes(p.toLowerCase()) ||
      region.toLowerCase().includes(PAISES[p].label.toLowerCase())
    ) || "Mexico"
    if (!acc[pais]) acc[pais] = []
    acc[pais].push(obj)
    return acc
  }, {})

  return (
    <div
      className="w-full md:w-[70%] relative overflow-hidden bg-[#b8d8e8]"
      style={{ height: "calc(100vh - 180px)", minHeight: "450px" }}
      onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
    >
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale, center: [-80, 5] }}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const name = geo.properties.name
              const config = PAISES[name]
              const isMeso = !!config
              const isHovered = hoveredCountry === name
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => isMeso && setHoveredCountry(name)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={() => {
                    if (!isMeso) return
                    setSelectedCountry({ name, label: config.label, objects: objectsByCountry[name] || [] })
                  }}
                  fill={isMeso ? (isHovered ? config.hover : config.color) : "#ddd8c8"}
                  stroke={isMeso ? "#fff" : "#ccc8b8"}
                  strokeWidth={isMeso ? 1.5 : 0.3}
                  style={{
                    default: { outline: "none", cursor: isMeso ? "pointer" : "default" },
                    hover:   { outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              )
            })
          }
        </Geographies>

        {/* Markers removed for a cleaner and more minimal map view */}
      </ComposableMap>

      {/* Controles de zoom */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1">
        <button onClick={() => setScale(s => Math.min(s + 100, 1400))}
          className="w-8 h-8 bg-white border border-[#d9d0bc] rounded flex items-center justify-center text-[#2c2416] hover:bg-[#f5f0e8] hover:border-[#2d6a5a] transition-all shadow-sm">
          <Plus size={14} />
        </button>
        <button onClick={() => setScale(s => Math.max(s - 100, 400))}
          className="w-8 h-8 bg-white border border-[#d9d0bc] rounded flex items-center justify-center text-[#2c2416] hover:bg-[#f5f0e8] hover:border-[#2d6a5a] transition-all shadow-sm">
          <Minus size={14} />
        </button>
        <button onClick={() => setScale(380)}
          className="w-8 h-8 bg-white border border-[#d9d0bc] rounded flex items-center justify-center text-[#2c2416] hover:bg-[#f5f0e8] hover:border-[#2d6a5a] transition-all shadow-sm">
          <Crosshair size={14} />
        </button>
      </div>

      {/* Leyenda */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/90 border border-[#d9d0bc] rounded-xl p-4 shadow-md">
        <p className="text-[#2c2416] font-bold text-xs mb-3 tracking-wide">Regiones de Mesoamérica</p>
        {PAISES_ENTRIES.map(([name, config]) => (
          <div
            key={name}
            className="flex items-center gap-2 text-[#7a6e5f] text-xs mb-1.5 cursor-pointer hover:text-[#2d6a5a] transition-colors"
            onClick={() => setSelectedCountry({ name, label: config.label, objects: objectsByCountry[name] || [] })}
          >
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: config.color }} />
            {config.label}
            {objectsByCountry[name]?.length > 0 && (
              <span className="ml-auto pl-2 text-[#2d6a5a] font-semibold">{objectsByCountry[name].length}</span>
            )}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {hoveredCountry && (
        <div
          className="fixed z-50 pointer-events-none px-3 py-2 rounded-xl bg-white border border-[#d9d0bc] text-[#2c2416] text-sm shadow-lg"
          style={{ left: tooltipPos.x + 14, top: tooltipPos.y - 36 }}
        >
          <span className="font-bold">{PAISES[hoveredCountry]?.label}</span>
          <span className="ml-2 text-[#7a6e5f]">
            {objectsByCountry[hoveredCountry]?.length || 0} objetos — clic para ver
          </span>
        </div>
      )}

      {selectedCountry && (
        <CountryModal
          country={selectedCountry}
          onClose={() => setSelectedCountry(null)}
        />
      )}
    </div>
  )
}