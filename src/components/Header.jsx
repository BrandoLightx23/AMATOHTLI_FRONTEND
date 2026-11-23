import { useState, useRef, useEffect, useContext } from "react"
import { ChevronDown, Gamepad2 } from "lucide-react"
import { AppContext } from "../context/AppContext"
import { useLanguage } from "../context/useLanguage"
import { SUPPORTED_LANGS } from "../context/languageCore"

const JUEGOS = [
  { id: "memorama" },
  { id: "match_piece" },
  { id: "museo_match" }
]

// SVG estático para evitar el error de removeChild con arrays dentro de SVG
function LogoSVG() {
  return (
    <svg viewBox="0 0 56 56" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="26" fill="#ede8dc" stroke="#2d6a5a" strokeWidth="2" />
      <circle cx="28" cy="28" r="10" fill="none" stroke="#c9830a" strokeWidth="2" />
      <circle cx="28" cy="28" r="4" fill="#c9830a" />
      {/* Flechas principales — enumeradas estáticamente */}
      <g transform="rotate(0 28 28)">
        <line x1="28" y1="18" x2="28" y2="12" stroke="#2d6a5a" strokeWidth="1.5" strokeLinecap="round" />
        <polygon points="28,8 26,13 30,13" fill="#2d6a5a" />
      </g>
      <g transform="rotate(45 28 28)">
        <line x1="28" y1="18" x2="28" y2="12" stroke="#2d6a5a" strokeWidth="1.5" strokeLinecap="round" />
        <polygon points="28,8 26,13 30,13" fill="#2d6a5a" />
      </g>
      <g transform="rotate(90 28 28)">
        <line x1="28" y1="18" x2="28" y2="12" stroke="#2d6a5a" strokeWidth="1.5" strokeLinecap="round" />
        <polygon points="28,8 26,13 30,13" fill="#2d6a5a" />
      </g>
      <g transform="rotate(135 28 28)">
        <line x1="28" y1="18" x2="28" y2="12" stroke="#2d6a5a" strokeWidth="1.5" strokeLinecap="round" />
        <polygon points="28,8 26,13 30,13" fill="#2d6a5a" />
      </g>
      <g transform="rotate(180 28 28)">
        <line x1="28" y1="18" x2="28" y2="12" stroke="#2d6a5a" strokeWidth="1.5" strokeLinecap="round" />
        <polygon points="28,8 26,13 30,13" fill="#2d6a5a" />
      </g>
      <g transform="rotate(225 28 28)">
        <line x1="28" y1="18" x2="28" y2="12" stroke="#2d6a5a" strokeWidth="1.5" strokeLinecap="round" />
        <polygon points="28,8 26,13 30,13" fill="#2d6a5a" />
      </g>
      <g transform="rotate(270 28 28)">
        <line x1="28" y1="18" x2="28" y2="12" stroke="#2d6a5a" strokeWidth="1.5" strokeLinecap="round" />
        <polygon points="28,8 26,13 30,13" fill="#2d6a5a" />
      </g>
      <g transform="rotate(315 28 28)">
        <line x1="28" y1="18" x2="28" y2="12" stroke="#2d6a5a" strokeWidth="1.5" strokeLinecap="round" />
        <polygon points="28,8 26,13 30,13" fill="#2d6a5a" />
      </g>
      {/* Líneas intermedias */}
      <g transform="rotate(22.5 28 28)">
        <line x1="28" y1="18" x2="28" y2="14" stroke="#c9830a" strokeWidth="1" strokeLinecap="round" />
      </g>
      <g transform="rotate(67.5 28 28)">
        <line x1="28" y1="18" x2="28" y2="14" stroke="#c9830a" strokeWidth="1" strokeLinecap="round" />
      </g>
      <g transform="rotate(112.5 28 28)">
        <line x1="28" y1="18" x2="28" y2="14" stroke="#c9830a" strokeWidth="1" strokeLinecap="round" />
      </g>
      <g transform="rotate(157.5 28 28)">
        <line x1="28" y1="18" x2="28" y2="14" stroke="#c9830a" strokeWidth="1" strokeLinecap="round" />
      </g>
      <g transform="rotate(202.5 28 28)">
        <line x1="28" y1="18" x2="28" y2="14" stroke="#c9830a" strokeWidth="1" strokeLinecap="round" />
      </g>
      <g transform="rotate(247.5 28 28)">
        <line x1="28" y1="18" x2="28" y2="14" stroke="#c9830a" strokeWidth="1" strokeLinecap="round" />
      </g>
      <g transform="rotate(292.5 28 28)">
        <line x1="28" y1="18" x2="28" y2="14" stroke="#c9830a" strokeWidth="1" strokeLinecap="round" />
      </g>
      <g transform="rotate(337.5 28 28)">
        <line x1="28" y1="18" x2="28" y2="14" stroke="#c9830a" strokeWidth="1" strokeLinecap="round" />
      </g>
    </svg>
  )
}

export default function Header() {
  const { activeTab, setActiveTab, setActiveGame } = useContext(AppContext)
  const { t, lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectTab = (tab) => {
    setActiveTab(tab)
    setActiveGame(null)
  }

  const selectJuego = (juegoId) => {
    setActiveTab("juegos")
    setActiveGame(juegoId)
    setOpen(false)
  }

  return (
    <header className="relative px-4 sm:px-8 py-3 sm:py-4 bg-[#f5f0e8] border-b border-[#d9d0bc] flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      {/* Logo + título */}
      <div className="order-1 flex-1 lg:flex-none min-w-0 flex items-center gap-3 sm:gap-4 cursor-pointer" onClick={() => selectTab("inicio")}>
        <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full border-2 border-[#2d6a5a] overflow-hidden flex items-center justify-center bg-[#ede8dc] shadow-sm">
          <LogoSVG />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2d6a5a] tracking-wider" style={{ fontFamily: "'Playfair Display', serif" }}>
            AMATOHTLI
          </h1>
          <p className="text-[10px] sm:text-xs text-[#7a6e5f] mt-0.5 font-semibold">{t("header.subtitle")}</p>
        </div>
      </div>

      {/* Selector de idioma ES | EN */}
      <div
        className="flex items-center order-2 lg:order-3 rounded-xl border border-[#d9d0bc] bg-white overflow-hidden"
        role="group"
        aria-label={t("lang.label")}
      >
        {SUPPORTED_LANGS.map((code) => (
          <button
            key={code}
            onClick={() => setLang(code)}
            aria-pressed={lang === code}
            title={code === "es" ? "Español" : "English"}
            className={`px-2.5 py-2 text-[11px] font-bold uppercase transition-all cursor-pointer ${lang === code
              ? "bg-[#2d6a5a] text-white"
              : "text-[#7a6e5f] hover:bg-[#ede8dc] hover:text-[#2c2416]"
              }`}
          >
            {code}
          </button>
        ))}
      </div>

      {/* Menú de Navegación por Pestañas */}
      <nav className="order-3 lg:order-2 w-full lg:w-auto flex flex-wrap items-center justify-center gap-1 md:gap-3">
        <button
          onClick={() => selectTab("inicio")}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "inicio"
            ? "bg-[#2d6a5a] text-white shadow-sm"
            : "text-[#7a6e5f] hover:bg-[#ede8dc] hover:text-[#2c2416]"
            }`}
        >
          {t("nav.home")}
        </button>
        <button
          onClick={() => selectTab("coleccion")}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "coleccion"
            ? "bg-[#2d6a5a] text-white shadow-sm"
            : "text-[#7a6e5f] hover:bg-[#ede8dc] hover:text-[#2c2416]"
            }`}
        >
          {t("nav.collection")}
        </button>
        <button
          onClick={() => selectTab("mapa")}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "mapa"
            ? "bg-[#2d6a5a] text-white shadow-sm"
            : "text-[#7a6e5f] hover:bg-[#ede8dc] hover:text-[#2c2416]"
            }`}
        >
          {t("nav.map")}
        </button>
        <button
          onClick={() => selectTab("linea_temporal")}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "linea_temporal"
            ? "bg-[#2d6a5a] text-white shadow-sm"
            : "text-[#7a6e5f] hover:bg-[#ede8dc] hover:text-[#2c2416]"
            }`}
        >
          {t("nav.timeline")}
        </button>

        {/* Botón JUEGOS con dropdown */}
        <div className="lg:relative" ref={menuRef}>
          <button
            onClick={() => setOpen(!open)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "juegos"
              ? "bg-[#2d6a5a] text-white shadow-sm"
              : "text-[#7a6e5f] hover:bg-[#ede8dc] hover:text-[#2c2416]"
              }`}
          >
            <Gamepad2 size={13} />
            {t("nav.games")}
            <ChevronDown
              size={12}
              style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
            />
          </button>

          {open && (
            <div className="absolute left-4 right-4 top-full mt-1 lg:mt-2 lg:left-auto lg:right-0 lg:w-56 bg-white border border-[#d9d0bc] rounded-xl shadow-lg overflow-hidden z-50">
              <button
                onClick={() => { selectTab("juegos"); setOpen(false) }}
                className="w-full text-left px-4 py-2.5 text-xs text-[#7a6e5f] hover:bg-[#f5f0e8] transition-colors font-bold border-b border-[#f0ece4] block cursor-pointer"
              >
                {t("nav.gamesPanel")}
              </button>
              {JUEGOS.map((juego, i) => (
                <button
                  key={juego.id}
                  onClick={() => selectJuego(juego.id)}
                  className="w-full text-left px-4 py-3 text-xs text-[#2c2416] hover:bg-[#eaf0ec] hover:text-[#2d6a5a] transition-colors font-bold flex items-center gap-3 border-b border-[#f0ece4] last:border-0 cursor-pointer"
                >
                  <span className="w-5 h-5 rounded-full bg-[#eaf0ec] text-[#2d6a5a] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  {t(`game.${juego.id}.name`)}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}