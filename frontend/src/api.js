import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const api = axios.create({ baseURL })

export const getRestaurants = (params) => api.get('/restaurants', { params })
export const getRestaurant = (id) => api.get(`/restaurants/${id}`)
export const createRestaurant = (data) => api.post('/restaurants', data)
export const updateRestaurant = (id, data) => api.put(`/restaurants/${id}`, data)
export const deleteRestaurant = (id) => api.delete(`/restaurants/${id}`)
export const getCategories = () => api.get('/restaurants/meta/categories')
export const getRegions = () => api.get('/restaurants/meta/regions')
