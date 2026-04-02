import { useState, useRef, useEffect } from 'react'
import { createRestaurant, updateRestaurant } from '../api'
import StarRating from './StarRating'
import LocationPicker from './LocationPicker'

const CATEGORIES = ['한식', '중식', '일식', '양식', '카페/디저트', '패스트푸드', '분식', '기타']

export default function RestaurantForm({ initial, onClose, onSave }) {
  const isEdit = !!initial
  const [form, setForm] = useState({
    name: initial?.name || '',
    category: initial?.category || '',
    region: initial?.region || '',
    address: initial?.address || '',
    phone: initial?.phone || '',
    rating: initial?.rating || 0,
    memo: initial?.memo || '',
    lat: initial?.lat || null,
    lng: initial?.lng || null,
    tags: initial?.tags?.join(', ') || '',
  })
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(initial?.photo || null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showMap, setShowMap] = useState(false)
  const fileRef = useRef()

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('맛집 이름을 입력하세요.'); return }
    if (!form.category) { setError('카테고리를 선택하세요.'); return }
    if (!form.region.trim()) { setError('지역을 입력하세요.'); return }

    setSaving(true)
    setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined) fd.append(k, v)
      })
      const tagList = form.tags.split(',').map(t => t.trim()).filter(Boolean)
      fd.set('tags', JSON.stringify(tagList))
      if (photo) fd.append('photo', photo)

      if (isEdit) await updateRestaurant(initial.id, fd)
      else await createRestaurant(fd)

      onSave()
    } catch (err) {
      setError(err.response?.data?.error || '저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-bold">{isEdit ? '맛집 수정' : '맛집 추가'}</h2>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
      </div>

      <div className="p-6 space-y-4">
        {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        {/* 사진 업로드 */}
        <div>
          <label className="label">사진</label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl h-40 flex items-center justify-center cursor-pointer hover:border-orange-400 transition-colors overflow-hidden"
            onClick={() => fileRef.current.click()}
          >
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-gray-400">
                <p className="text-3xl mb-1">📷</p>
                <p className="text-sm">클릭하여 사진 업로드 (최대 5MB)</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          {preview && (
            <button type="button" onClick={() => { setPhoto(null); setPreview(null) }}
              className="text-xs text-red-500 mt-1 hover:underline">사진 제거</button>
          )}
        </div>

        {/* 기본 정보 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="label">맛집 이름 *</label>
            <input className="input" placeholder="예: 진짜 맛있는 삼겹살" value={form.name}
              onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label className="label">카테고리 *</label>
            <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="">선택</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">지역 *</label>
            <input className="input" placeholder="예: 강남, 홍대, 이태원" value={form.region}
              onChange={e => set('region', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="label">주소</label>
            <input className="input" placeholder="예: 서울시 강남구 역삼동 123" value={form.address}
              onChange={e => set('address', e.target.value)} />
          </div>
          <div>
            <label className="label">전화번호</label>
            <input className="input" placeholder="예: 02-1234-5678" value={form.phone}
              onChange={e => set('phone', e.target.value)} />
          </div>
          <div>
            <label className="label">평점</label>
            <div className="mt-1">
              <StarRating value={form.rating} onChange={v => set('rating', v)} />
            </div>
          </div>
        </div>

        {/* 태그 */}
        <div>
          <label className="label">태그 (쉼표로 구분)</label>
          <input className="input" placeholder="예: 데이트, 회식, 주차가능" value={form.tags}
            onChange={e => set('tags', e.target.value)} />
        </div>

        {/* 메모 */}
        <div>
          <label className="label">메모</label>
          <textarea className="input h-24 resize-none" placeholder="특이사항, 추천 메뉴 등..." value={form.memo}
            onChange={e => set('memo', e.target.value)} />
        </div>

        {/* 지도 위치 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">지도 위치</label>
            <button type="button" onClick={() => setShowMap(m => !m)}
              className="text-sm text-orange-500 hover:underline">
              {showMap ? '지도 닫기' : '지도에서 위치 선택'}
            </button>
          </div>
          {form.lat && form.lng && (
            <p className="text-xs text-gray-500 mb-2">📍 위도 {form.lat?.toFixed(5)}, 경도 {form.lng?.toFixed(5)}</p>
          )}
          {showMap && (
            <LocationPicker
              lat={form.lat}
              lng={form.lng}
              onChange={(lat, lng) => { set('lat', lat); set('lng', lng) }}
            />
          )}
        </div>
      </div>

      <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
        <button type="button" onClick={onClose} className="btn-secondary">취소</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? '저장 중...' : (isEdit ? '수정 완료' : '등록')}
        </button>
      </div>
    </form>
  )
}
