import { deleteRestaurant } from '../api'
import StarRating from './StarRating'

export default function RestaurantDetail({ item, onClose, onEdit, onDelete }) {
  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    await deleteRestaurant(item.id)
    onDelete()
  }

  return (
    <div>
      {/* 사진 */}
      <div className="relative h-56 bg-gray-100 rounded-t-2xl overflow-hidden">
        {item.photo ? (
          <img src={item.photo} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
        )}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/40 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/60"
        >✕</button>
      </div>

      <div className="p-6">
        {/* 제목 + 배지 */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <h2 className="text-2xl font-bold">{item.name}</h2>
          <div className="flex gap-2 shrink-0">
            <button onClick={onEdit} className="btn-secondary text-sm">✏️ 수정</button>
            <button onClick={handleDelete} className="btn-danger text-sm">🗑️ 삭제</button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">{item.category}</span>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">{item.region}</span>
        </div>

        <StarRating value={item.rating} />

        {/* 상세 정보 */}
        <div className="mt-4 space-y-2 text-sm text-gray-600">
          {item.address && (
            <div className="flex gap-2">
              <span>📍</span>
              <span>{item.address}</span>
            </div>
          )}
          {item.phone && (
            <div className="flex gap-2">
              <span>📞</span>
              <a href={`tel:${item.phone}`} className="text-blue-500 hover:underline">{item.phone}</a>
            </div>
          )}
          {item.lat && item.lng && (
            <div className="flex gap-2">
              <span>🗺️</span>
              <span>위도 {Number(item.lat).toFixed(5)}, 경도 {Number(item.lng).toFixed(5)}</span>
            </div>
          )}
        </div>

        {/* 태그 */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {item.tags.map((t, i) => (
              <span key={i} className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-sm">#{t}</span>
            ))}
          </div>
        )}

        {/* 메모 */}
        {item.memo && (
          <div className="mt-4 bg-yellow-50 border border-yellow-100 rounded-xl p-4">
            <p className="text-sm font-medium text-yellow-700 mb-1">📝 메모</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.memo}</p>
          </div>
        )}

        {/* 등록일 */}
        <p className="text-xs text-gray-400 mt-4">
          등록: {item.created_at} {item.updated_at !== item.created_at && `· 수정: ${item.updated_at}`}
        </p>
      </div>
    </div>
  )
}
