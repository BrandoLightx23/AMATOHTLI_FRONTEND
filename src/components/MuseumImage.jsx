import { useRef, useState, useEffect, useContext } from "react"
import { getImageUrl, getProxiedImageUrl } from "../api/api"
import { ImageOff, ZoomIn } from "lucide-react"
import { AppContext } from "../context/AppContext"

// SVG estático de respaldo
const PLACEHOLDER_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#f0ece2"/>
  <rect x="150" y="90" width="100" height="80" rx="8" fill="#d9d0bc" opacity="0.6"/>
  <circle cx="175" cy="115" r="12" fill="#a09080" opacity="0.5"/>
  <polygon points="150,170 200,120 250,170" fill="#a09080" opacity="0.4"/>
  <text x="200" y="215" text-anchor="middle" font-family="serif" font-size="13" fill="#7a6e5f">Imagen no disponible</text>
  <text x="200" y="235" text-anchor="middle" font-family="serif" font-size="10" fill="#a09080">Museo Rietberg</text>
</svg>
`)}`

export default function MuseumImage({ objeto, alt, className, style, zoomable = true, useThumbnail = false }) {
  const { setActiveZoomObject } = useContext(AppContext)
  const fallbackRef = useRef(0) // 0=local, 1=proxy, 2=placeholder
  const [src, setSrc] = useState(null)
  const [status, setStatus] = useState("loading") // loading | loaded | error

  useEffect(() => {
    fallbackRef.current = 0
    setStatus("loading")
    const localUrl = getImageUrl(objeto, useThumbnail)
    setSrc(localUrl || PLACEHOLDER_SVG)
  }, [objeto?.id, useThumbnail])

  const handleLoad = () => setStatus("loaded")

  const handleError = () => {
    const level = fallbackRef.current

    if (level === 0 && objeto?.url) {
      fallbackRef.current = 1
      setSrc(getProxiedImageUrl(objeto.url))
    } else if (level <= 1) {
      fallbackRef.current = 2
      setSrc(PLACEHOLDER_SVG)
      setStatus("error")
    } else {
      setStatus("error")
    }
  }

  if (!src) {
    return (
      <div className={`${className} flex items-center justify-center bg-[#f0ece2] rounded-2xl border border-[#d9d0bc]`} style={style}>
        <div className="text-center text-[#a09080]">
          <ImageOff size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-xs">Sin imagen</p>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={(e) => {
        if (zoomable && objeto && status === "loaded") {
          e.stopPropagation()
          setActiveZoomObject(objeto)
        }
      }}
      className={`relative ${className} rounded-2xl overflow-hidden border border-[#d9d0bc] ${zoomable && objeto && status === "loaded" ? "cursor-zoom-in group/img" : ""
        }`}
      style={style}
    >
      {status === "loading" && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#ede8dc] via-[#f5f0e8] to-[#ede8dc] animate-pulse rounded-2xl" />
      )}

      <img
        src={src || "/placeholder.jpg"}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover rounded-2xl transition-all duration-500 ${status === "loaded" ? "opacity-100 scale-100" : "opacity-0 scale-95"
          } ${zoomable && objeto && status === "loaded" ? "group-hover/img:scale-[1.03]" : ""}`}
        style={{ minHeight: "100%" }}
      />

      {zoomable && objeto && status === "loaded" && (
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <div className="p-2.5 bg-white/90 rounded-full shadow-md text-[#2d6a5a] transform scale-90 group-hover/img:scale-100 transition-transform duration-300">
            <ZoomIn size={16} />
          </div>
        </div>
      )}

      {status === "error" && fallbackRef.current >= 2 && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#f0ece2] rounded-2xl">
          <div className="text-center text-[#a09080] p-4">
            <ImageOff size={28} className="mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">Imagen no disponible</p>
          </div>
        </div>
      )}
    </div>
  )
}
export { PLACEHOLDER_SVG }
