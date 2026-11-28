const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const API = `${BACKEND_URL}/api`
const IMAGES_BASE = BACKEND_URL

export const getObjects = async (collectionId = null, filters = {}, language = "es") => {
  const params = new URLSearchParams()
  if (collectionId != null) params.set("coleccion_id", collectionId)
  if (filters.cultura) params.set("cultura", filters.cultura)
  if (filters.material) params.set("material", filters.material)
  if (filters.region) params.set("region", filters.region)
  if (filters.year_min != null && filters.year_min !== "") params.set("year_min", filters.year_min)
  if (filters.year_max != null && filters.year_max !== "") params.set("year_max", filters.year_max)
  if (filters.sin_fecha) params.set("sin_fecha", "true")
  if (filters.q) params.set("q", filters.q)
  params.set("idioma", language)
  const qs = params.toString()
  const response = await fetch(`${API}/objects?${qs}`)
  if (!response.ok) throw new Error(`Unable to load objects (${response.status})`)
  const data = await response.json()
  return data.archivos || []
}

export const getFilters = async (collectionId) => {
  const query = collectionId == null ? "" : `?coleccion_id=${encodeURIComponent(collectionId)}`
  const response = await fetch(`${API}/filters${query}`)
  if (!response.ok) throw new Error(`Unable to load filters (${response.status})`)
  return response.json()
}

export const getCollections = async (language = "es") => {
  const response = await fetch(`${API}/colecciones?idioma=${encodeURIComponent(language)}`)
  if (!response.ok) throw new Error(`Unable to load collections (${response.status})`)
  const data = await response.json()
  return Array.isArray(data) ? data : data.colecciones || []
}

export const getObjectsByYear = async (year) => {
  const response = await fetch(`${API}/objects/anio/${year}`)
  const data = await response.json()
  return data.archivos || []
}

export const getUnknownObjects = async () => {
  const response = await fetch(`${API}/objects/desconocidos`)
  const data = await response.json()
  return data.archivos || []
}

export const searchObjects = async (search) => {
  const response = await fetch(`${API}/objects/buscar?q=${encodeURIComponent(search)}`)
  const data = await response.json()
  return data.archivos || []
}

export const getWikiImage = async (title) => {
  const response = await fetch(`${API}/wiki/${encodeURIComponent(title)}`)
  return response.json()
}

export const getImageUrl = (objeto, useThumbnail = false) => {
  if (!objeto) return null

  if (useThumbnail && objeto.thumbnail) {
    if (objeto.thumbnail.startsWith("http://") || objeto.thumbnail.startsWith("https://")) {
      return objeto.thumbnail
    }
    return `${IMAGES_BASE}${objeto.thumbnail}`
  }

  if (objeto.localImage) {
    if (objeto.localImage.startsWith("http://") || objeto.localImage.startsWith("https://")) {
      return objeto.localImage
    }
    return `${IMAGES_BASE}${objeto.localImage}`
  }

  if (objeto.url) {
    return objeto.url
  }

  return null
}

export const getProxiedImageUrl = (url) => {
  if (!url) return null
  return `${API}/proxy?url=${encodeURIComponent(url)}`
}

export const getRegions = async () => {
  const response = await fetch(`${API}/regions`)
  const data = await response.json()
  return data.regions || []
}
