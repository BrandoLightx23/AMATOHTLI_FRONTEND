import { useState, useEffect, useCallback, useMemo } from "react"
import { translations } from "../i18n/translations"
import { LanguageContext, SUPPORTED_LANGS, DEFAULT_LANG, LANG_STORAGE_KEY as STORAGE_KEY } from "./languageCore"

function getInitialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (SUPPORTED_LANGS.includes(saved)) return saved
  } catch (error) {
    console.warn("Unable to read saved language preference.", error)
  }
  return DEFAULT_LANG
}


const PLACE_ES_TO_EN = [
  ["Perú", "Peru"],
  ["México", "Mexico"],
  ["Brasil", "Brazil"],
  ["Panamá", "Panama"],
  ["Belice", "Belize"],
]


function englishOrdinal(n) {
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`
  switch (n % 10) {
    case 1: return `${n}st`
    case 2: return `${n}nd`
    case 3: return `${n}rd`
    default: return `${n}th`
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang)

  const setLang = useCallback((next) => {
    if (!SUPPORTED_LANGS.includes(next)) return
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch (error) {
      console.warn("Unable to save language preference.", error)
    }
  }, [])


  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const t = useCallback((key, vars) => {
    let text = translations[lang]?.[key] ?? translations[DEFAULT_LANG]?.[key] ?? key
    if (vars) {
      Object.entries(vars).forEach(([name, value]) => {
        text = text.split(`{${name}}`).join(String(value))
      })
    }
    return text
  }, [lang])

  
  const formatCentury = useCallback((centuryStart) => {
    const n = Math.floor(Number(centuryStart) / 100) + 1
    return lang === "en"
      ? `${englishOrdinal(n)} century (${centuryStart} AD)`
      : `Siglo ${n} (${centuryStart} d.C.)`
  }, [lang])

  
  const countryName = useCallback((name) => {
    if (!name) return name
    return translations[lang]?.[`country.${name}`] ?? name
  }, [lang])

  
  const place = useCallback((value) => {
    if (!value || lang !== "en") return value
    return PLACE_ES_TO_EN.reduce((text, [es, en]) => text.split(es).join(en), value)
  }, [lang])


  const formatYear = useCallback((year) => t("common.yearCE", { year }), [t])

  const value = useMemo(
    () => ({ lang, setLang, t, formatCentury, formatYear, countryName, place }),
    [lang, setLang, t, formatCentury, formatYear, countryName, place]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
