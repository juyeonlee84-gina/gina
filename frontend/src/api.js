import axios from 'axios'

// 개발: vite proxy → localhost:4000
// 프로덕션: 같은 서버에서 서빙되므로 /api 그대로 사용
const api = axios.create({ baseURL: '/api' })

export const getRestaurants = (params) => api.get('/restaurants', { params })
export const getRestaurant = (id) => api.get(`/restaurants/${id}`)
export const createRestaurant = (data) => api.post('/restaurants', data)
export const updateRestaurant = (id, data) => api.put(`/restaurants/${id}`, data)
export const deleteRestaurant = (id) => api.delete(`/restaurants/${id}`)
export const getCategories = () => api.get('/restaurants/meta/categories')
export const getRegions = () => api.get('/restaurants/meta/regions')
