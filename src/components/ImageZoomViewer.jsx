import { useState, useEffect, useRef, useContext } from "react"
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { getImageUrl, getProxiedImageUrl } from "../api/api"
import { AppContext } from "../context/AppContext"

export default function ImageZoomViewer() {
  const { activeZoomObject, setActiveZoomObject } = useContext(AppContext)
  
  if (!activeZoomObject) return null

  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  const [src, setSrc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  
  const imgRef = useRef(null)
  const containerRef = useRef(null)
  const fallbackRef = useRef(0) // 0 = local, 1 = proxy, 2 = error
  
  // Resolve image URL with fallbacks (same as MuseumImage)
  useEffect(() => {
    fallbackRef.current = 0
    setLoading(true)
    setError(false)
    setZoom(1)
    setPosition({ x: 0, y: 0 })
    
    const url = getImageUrl(activeZoomObject, false)
    setSrc(url)
  }, [activeZoomObject])

  const handleLoad = () => {
    setLoading(false)
  }

  const handleError = () => {
    const level = fallbackRef.current
    if (level === 0 && activeZoomObject?.url) {
      fallbackRef.current = 1
      setSrc(getProxiedImageUrl(activeZoomObject.url))
    } else {
      fallbackRef.current = 2
      setError(true)
      setLoading(false)
    }
  }

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setActiveZoomObject(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [setActiveZoomObject])

  // Zoom controls
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.5, 5))
  const handleZoomOut = () => {
    setZoom(z => {
      const nextZ = Math.max(z - 0.5, 1)
      if (nextZ === 1) setPosition({ x: 0, y: 0 })
      return nextZ
    })
  }
  const handleReset = () => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  // Wheel zoom
  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY < 0 ? 0.1 : -0.1
    setZoom(z => {
      const nextZ = Math.min(Math.max(z + delta, 1), 5)
      if (nextZ === 1) setPosition({ x: 0, y: 0 })
      return nextZ
    })
  }

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    if (zoom <= 1) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e) => {
    if (!isDragging || zoom <= 1) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch handlers (Mobile pinch to zoom and touch pan)
  const initialDistance = useRef(0)
  const initialZoom = useRef(1)
  const touchStart = useRef({ x: 0, y: 0 })

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      // Single finger drag
      touchStart.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      }
      setIsDragging(true)
    } else if (e.touches.length === 2) {
      // Two finger pinch
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      initialDistance.current = dist
      initialZoom.current = zoom
    }
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging && zoom > 1) {
      setPosition({
        x: e.touches[0].clientX - touchStart.current.x,
        y: e.touches[0].clientY - touchStart.current.y
      })
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      const factor = dist / initialDistance.current
      setZoom(z => {
        const nextZ = Math.min(Math.max(initialZoom.current * factor, 1), 5)
        if (nextZ === 1) setPosition({ x: 0, y: 0 })
        return nextZ
      })
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Click outside to close
  const handleBackdropClick = (e) => {
    if (e.target === containerRef.current || e.target.id === "inner-backdrop") {
      setActiveZoomObject(null)
    }
  }

  return (
    <div
      ref={containerRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in"
      style={{ touchAction: "none" }}
    >
      {/* Title Header */}
      <div className="absolute top-0 inset-x-0 p-6 flex items-center justify-between text-white bg-gradient-to-b from-black/60 to-transparent z-10">
        <div className="max-w-[70%]">
          <span className="text-[10px] tracking-wider uppercase text-[#c9830a] font-bold">
            Examinando Objeto
          </span>
          <h3 className="text-base font-bold truncate mt-0.5">
            {activeZoomObject.titulo}
          </h3>
        </div>
        <button
          onClick={() => setActiveZoomObject(null)}
          className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all duration-200 cursor-pointer text-white"
        >
          <X size={20} />
        </button>
      </div>

      {/* Image Container Area */}
      <div
        id="inner-backdrop"
        className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {loading && (
          <div className="absolute flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin mb-4" />
            <p className="text-white/60 text-xs font-semibold">Cargando pieza en alta resolución...</p>
          </div>
        )}
        
        {error ? (
          <div className="text-center text-white/50 p-6">
            <p className="text-sm font-semibold">No se pudo cargar la imagen del objeto.</p>
          </div>
        ) : (
          src && (
            <img
              ref={imgRef}
              src={src}
              alt={activeZoomObject.titulo}
              onLoad={handleLoad}
              onError={handleError}
              draggable={false}
              className={`max-w-[90%] max-h-[80%] object-contain select-none transition-transform duration-100 ease-out origin-center ${
                loading ? "opacity-0" : "opacity-100"
              }`}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              }}
            />
          )
        )}
      </div>

      {/* Controls HUD */}
      {!loading && !error && (
        <div className="absolute bottom-10 px-6 py-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-6 text-white shadow-2xl z-10">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
            title="Alejar"
          >
            <ZoomOut size={18} />
          </button>
          
          <span className="text-xs font-mono font-bold w-12 text-center select-none">
            {Math.round(zoom * 100)}%
          </span>
          
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 5}
            className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
            title="Acercar"
          >
            <ZoomIn size={18} />
          </button>
          
          <div className="w-[1px] h-5 bg-white/20" />
          
          <button
            onClick={handleReset}
            className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="Restablecer"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
