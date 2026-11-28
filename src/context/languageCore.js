import { createContext } from "react"

export const SUPPORTED_LANGS = ["es", "en", "de"]
export const DEFAULT_LANG = "es"
export const LANG_STORAGE_KEY = "amatohtli-lang"

export const LanguageContext = createContext(null)
