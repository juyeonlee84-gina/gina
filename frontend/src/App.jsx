import { useState } from 'react'
import RestaurantList from './components/RestaurantList'
import RestaurantForm from './components/RestaurantForm'
import RestaurantDetail from './components/RestaurantDetail'
import MapView from './components/MapView'

export default function App() {
  const [view, setView] = useState('list') // list | map
  const [modal, setModal] = useState(null) // null | { type: 'add' | 'edit' | 'detail', data? }
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = () => setRefreshKey(k => k + 1)

  const openAdd = () => setModal({ type: 'add' })
  const openEdit = (item) => setModal({ type: 'edit', data: item })
  const openDetail = (item) => setModal({ type: 'detail', data: item })
  const closeModal = () => setModal(null)

  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍽️</span>
            <h1 className="text-xl font-bold text-orange-500">맛집 정보 관리</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg overflow-hidden border border-gray-200">
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  view === 'list' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                📋 목록
              </button>
              <button
                onClick={() => setView('map')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  view === 'map' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                🗺️ 지도
              </button>
            </div>
            <button onClick={openAdd} className="btn-primary flex items-center gap-1">
              <span>+</span> 맛집 추가
            </button>
          </div>
        </div>
      </header>

      {/* 메인 */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {view === 'list' ? (
          <RestaurantList
            key={refreshKey}
            onDetail={openDetail}
            onEdit={openEdit}
            onRefresh={refresh}
          />
        ) : (
          <MapView
            key={refreshKey}
            onDetail={openDetail}
          />
        )}
      </main>

      {/* 모달 */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {modal.type === 'add' && (
              <RestaurantForm
                onClose={closeModal}
                onSave={() => { closeModal(); refresh(); }}
              />
            )}
            {modal.type === 'edit' && (
              <RestaurantForm
                initial={modal.data}
                onClose={closeModal}
                onSave={() => { closeModal(); refresh(); }}
              />
            )}
            {modal.type === 'detail' && (
              <RestaurantDetail
                item={modal.data}
                onClose={closeModal}
                onEdit={() => { closeModal(); openEdit(modal.data); }}
                onDelete={() => { closeModal(); refresh(); }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
