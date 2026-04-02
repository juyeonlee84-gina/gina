export default function StarRating({ value, onChange, size = 'md' }) {
  const stars = [1, 2, 3, 4, 5]
  const sz = size === 'sm' ? 'text-lg' : 'text-2xl'

  if (!onChange) {
    return (
      <span className="flex gap-0.5">
        {stars.map(s => (
          <span key={s} className={`${sz} ${s <= value ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
        ))}
      </span>
    )
  }

  return (
    <span className="flex gap-0.5">
      {stars.map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={`${sz} transition-colors ${s <= value ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
        >
          ★
        </button>
      ))}
    </span>
  )
}
