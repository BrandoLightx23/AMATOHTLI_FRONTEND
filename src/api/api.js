const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const API = `${BACKEND_URL}/api`
const IMAGES_BASE = BACKEND_URL

export const getObjects = async () => {
  const response = await fetch(`${API}/objects`)
  const data = await response.json()
  return data.archivos || []
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