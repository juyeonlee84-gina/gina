import { useEffect, useRef, useState } from 'react'
import { getRestaurants } from '../api'

let L = null

export default function MapView({ onDetail }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [items, setItems] = useState([])

  useEffect(() => {
    getRestaurants().then(res => setItems(res.data))
  }, [])

  useEffect(() => {
    if (!items.length) return

    const init = async () => {
      if (!L) L = await import('leaflet')

      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      const map = L.map(mapRef.current).setView([37.5665, 126.9780], 11)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)

      const withCoords = items.filter(r => r.lat && r.lng)

      if (withCoords.length > 0) {
        const bounds = L.latLngBounds(withCoords.map(r => [r.lat, r.lng]))
        map.fitBounds(bounds, { padding: [40, 40] })
      }

      withCoords.forEach(r => {
        const stars = '★'.repeat(Math.round(r.rating)) + '☆'.repeat(5 - Math.round(r.rating))
        const popup = L.popup().setContent(`
          <div style="min-width:160px">
            <strong style="font-size:15px">${r.name}</strong>
            <div style="margin:4px 0;color:#f97316">${stars}</div>
            <span style="background:#fff7ed;color:#ea580c;padding:2px 8px;border-radius:9999px;font-size:12px">${r.category}</span>
            <span style="background:#f3f4f6;color:#6b7280;padding:2px 8px;border-radius:9999px;font-size:12px;margin-left:4px">${r.region}</span>
            ${r.address ? `<p style="font-size:12px;color:#6b7280;margin-top:6px">📍 ${r.address}</p>` : ''}
          </div>
        `)

        L.marker([r.lat, r.lng])
          .addTo(map)
          .bindPopup(popup)
          .on('click', () => onDetail(r))
      })

      mapInstanceRef.current = map
    }

    init()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [items])

  const withCoords = items.filter(r => r.lat && r.lng)
  const noCoords = items.filter(r => !r.lat || !r.lng)

  return (
    <div>
      <div ref={mapRef} className="w-full rounded-xl border border-gray-200 shadow-sm" style={{ height: '60vh' }} />

      {noCoords.length > 0 && (
        <div className="mt-4 card p-4">
          <p className="text-sm font-medium text-gray-600 mb-2">📍 위치 미등록 맛집 ({noCoords.length}개)</p>
          <div className="flex flex-wrap gap-2">
            {noCoords.map(r => (
              <button
                key={r.id}
                onClick={() => onDetail(r)}
                className="text-sm bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-600 px-3 py-1 rounded-full transition-colors"
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-2 text-center">
        지도 핀 클릭 시 상세 정보를 볼 수 있습니다. (총 {withCoords.length}개 위치 표시)
      </p>
    </div>
  )
}
