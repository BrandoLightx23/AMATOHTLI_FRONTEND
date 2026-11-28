export default function ColeccionSelector({ collections, total, selectedSlug, onChange, t }) {
  const options = [
    { slug: "", nombre: t("col.allCollections", { n: total }) },
    ...collections.map(collection => ({
      slug: collection.slug,
      nombre: `${collection.nombre} (${collection.total})`,
    })),
  ]

  return (
    <div>
      <label htmlFor="collection-selector" className="sr-only">
        {t("col.collectionSelector")}
      </label>
      <select
        id="collection-selector"
        value={selectedSlug}
        onChange={event => onChange(event.target.value)}
        className="md:hidden w-full bg-white border border-[#d9d0bc] rounded-xl px-3 py-2.5 text-xs text-[#2c2416] outline-none focus-visible:ring-2 focus-visible:ring-[#2d6a5a]"
      >
        {options.map(option => (
          <option key={option.slug || "all"} value={option.slug}>{option.nombre}</option>
        ))}
      </select>

      <div className="hidden md:flex flex-wrap gap-2" role="group" aria-label={t("col.collectionSelector")}>
        {options.map(option => (
          <button
            key={option.slug || "all"}
            type="button"
            aria-pressed={selectedSlug === option.slug}
            onClick={() => onChange(option.slug)}
            className={`px-3 py-2 rounded-full border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d6a5a] ${
              selectedSlug === option.slug
                ? "bg-[#2d6a5a] border-[#2d6a5a] text-white"
                : "bg-white border-[#d9d0bc] text-[#2c2416] hover:bg-[#f9f8f6]"
            }`}
          >
            {option.nombre}
          </button>
        ))}
      </div>
    </div>
  )
}
