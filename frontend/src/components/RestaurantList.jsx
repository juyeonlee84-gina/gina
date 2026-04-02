import { useEffect, useState } from 'react'
import { getRestaurants, deleteRestaurant } from '../api'
import StarRating from './StarRating'

const CATEGORIES = ['한식', '중식', '일식', '양식', '카페/디저트', '패스트푸드', '분식', '기타']

export default function RestaurantList({ onDetail, onEdit, onRefresh }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ q: '', category: '', region: '', rating: '', sort: 'created_at', order: 'desc' })
  const [regions, setRegions] = useState([])

  const load = async () => {
    setLoading(true)
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
      const res = await getRestaurants(params)
      setItems(res.data)
      const uniqueRegions = [...new Set(res.data.map(r => r.region).filter(Boolean))]
      setRegions(uniqueRegions)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [JSON.stringify(filters)])

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('정말 삭제하시겠습니까?')) return
    await deleteRestaurant(id)
    load()
    onRefresh()
  }

  return (
    <div>
      {/* 검색/필터 바 */}
      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <input
            className="input flex-1 min-w-48"
            placeholder="🔍 맛집명, 주소, 메모 검색..."
            value={filters.q}
            onChange={e => setFilters(f => ({ ...f, q: e.target.value }))}
          />
          <select
            className="input w-36"
            value={filters.category}
            onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
          >
            <option value="">전체 카테고리</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            className="input w-32"
            value={filters.region}
            onChange={e => setFilters(f => ({ ...f, region: e.target.value }))}
          >
            <option value="">전체 지역</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            className="input w-32"
            value={filters.rating}
            onChange={e => setFilters(f => ({ ...f, rating: e.target.value }))}
          >
            <option value="">전체 평점</option>
            <option value="4">4점 이상</option>
            <option value="3">3점 이상</option>
            <option value="2">2점 이상</option>
          </select>
          <select
            className="input w-36"
            value={`${filters.sort}_${filters.order}`}
            onChange={e => {
              const [sort, order] = e.target.value.split('_')
              setFilters(f => ({ ...f, sort, order }))
            }}
          >
            <option value="created_at_desc">최신 등록순</option>
            <option value="created_at_asc">오래된 순</option>
            <option value="rating_desc">평점 높은순</option>
            <option value="rating_asc">평점 낮은순</option>
            <option value="name_asc">이름 가나다순</option>
          </select>
        </div>
      </div>

      {/* 통계 */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          총 <span className="font-semibold text-orange-500">{items.length}</span>개의 맛집
        </p>
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">불러오는 중...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-3">🍽️</p>
          <p>등록된 맛집이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div
              key={item.id}
              className="card overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onDetail(item)}
            >
              {/* 사진 */}
              <div className="h-40 bg-gray-100 overflow-hidden">
                {item.photo ? (
                  <img src={item.photo} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
                )}
              </div>

              {/* 정보 */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); onEdit(item) }}
                      className="text-gray-400 hover:text-orange-500 text-sm px-1"
                    >✏️</button>
                    <button
                      onClick={e => handleDelete(e, item.id)}
                      className="text-gray-400 hover:text-red-500 text-sm px-1"
                    >🗑️</button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{item.category}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item.region}</span>
                </div>

                <StarRating value={item.rating} size="sm" />

                {item.address && (
                  <p className="text-xs text-gray-500 mt-2 truncate">📍 {item.address}</p>
                )}

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.map((t, i) => (
                      <span key={i} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">#{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
