import { defineStore } from 'pinia'

const API_BASE = 'http://localhost:3001/api'

export const useWorksStore = defineStore('works', {
  state: () => ({
    works: [],
    currentWork: null,
    categories: []
  }),
  getters: {
    favoriteWorks: (state) => {
      return state.works.filter(work => work.isFavorite === true)
    }
  },
  actions: {
    async loadWorks() {
      try {
        const response = await fetch(`${API_BASE}/works`)
        const result = await response.json()
        if (result.success) {
          this.works = result.data.map(work => ({
            id: work.id,
            title: work.title,
            category: work.category_name,
            categoryIcon: work.category_icon,
            image: work.image_url,
            prompt: work.prompt,
            isFavorite: work.is_favorite === 1,
            createdAt: work.created_at
          }))
        }
      } catch (error) {
        console.error('加载作品失败:', error)
      }
    },
    
    async loadFavorites() {
      try {
        const response = await fetch(`${API_BASE}/works/favorites`)
        const result = await response.json()
        if (result.success) {
          this.works = result.data.map(work => ({
            id: work.id,
            title: work.title,
            category: work.category_name,
            categoryIcon: work.category_icon,
            image: work.image_url,
            prompt: work.prompt,
            isFavorite: work.is_favorite === 1,
            createdAt: work.created_at
          }))
          console.log(`加载了 ${this.works.length} 个收藏作品`)
        }
      } catch (error) {
        console.error('加载收藏作品失败:', error)
      }
    },
    
    async loadCategories() {
      try {
        const response = await fetch(`${API_BASE}/categories`)
        const result = await response.json()
        if (result.success) {
          this.categories = result.data
        }
      } catch (error) {
        console.error('加载分类失败:', error)
      }
    },
    
    async toggleFavorite(id) {
      const work = this.works.find(work => work.id === id)
      if (work) {
        const newFavoriteStatus = !work.isFavorite
        try {
          const response = await fetch(`${API_BASE}/works/${id}/favorite`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ is_favorite: newFavoriteStatus })
          })
          const result = await response.json()
          if (result.success) {
            work.isFavorite = newFavoriteStatus
            console.log(`作品 ${id} 收藏状态已更新为: ${newFavoriteStatus}`)
          } else {
            console.error('更新收藏状态失败:', result.error)
          }
        } catch (error) {
          console.error('更新收藏状态失败:', error)
        }
      }
    },
    
    async addWork(workData) {
      try {
        const categoryId = this.categories.find(c => c.name === workData.category)?.id
        if (!categoryId) {
          alert('分类不存在')
          return
        }
        
        const response = await fetch(`${API_BASE}/works`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: workData.title,
            category_id: categoryId,
            image_url: workData.image,
            prompt: workData.prompt
          })
        })
        const result = await response.json()
        if (result.success) {
          const newWork = {
            id: result.data.id,
            title: result.data.title,
            category: result.data.category_name,
            categoryIcon: result.data.category_icon,
            image: result.data.image_url,
            prompt: result.data.prompt,
            isFavorite: result.data.is_favorite === 1,
            createdAt: result.data.created_at
          }
          this.works.unshift(newWork)
          return newWork
        }
      } catch (error) {
        console.error('创建作品失败:', error)
        throw error
      }
    },
    
    setCurrentWork(work) {
      this.currentWork = work
    },
    
    async deleteWork(id) {
      try {
        const response = await fetch(`${API_BASE}/works/${id}`, {
          method: 'DELETE'
        })
        const result = await response.json()
        if (result.success) {
          const index = this.works.findIndex(work => work.id === id)
          if (index !== -1) {
            this.works.splice(index, 1)
          }
        }
      } catch (error) {
        console.error('删除作品失败:', error)
        throw error
      }
    }
  }
})