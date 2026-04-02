import { useEffect, useRef } from 'react'

// 동적으로 Leaflet 로드 (SSR 방지)
let L = null

export default function LocationPicker({ lat, lng, onChange }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    const init = async () => {
      if (!L) L = await import('leaflet')

      // 기본 마커 아이콘 fix
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (mapInstanceRef.current) return

      const defaultLat = lat || 37.5665
      const defaultLng = lng || 126.9780

      const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 15)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)

      if (lat && lng) {
        markerRef.current = L.marker([lat, lng]).addTo(map)
      }

      map.on('click', (e) => {
        const { lat: newLat, lng: newLng } = e.latlng
        if (markerRef.current) {
          markerRef.current.setLatLng([newLat, newLng])
        } else {
          markerRef.current = L.marker([newLat, newLng]).addTo(map)
        }
        onChange(newLat, newLng)
      })

      mapInstanceRef.current = map
    }
    init()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
  }, [])

  return (
    <div>
      <div ref={mapRef} className="w-full h-56 rounded-xl border border-gray-200" />
      <p className="text-xs text-gray-400 mt-1">지도를 클릭하면 위치가 저장됩니다.</p>
    </div>
  )
}
