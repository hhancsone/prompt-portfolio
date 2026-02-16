<template>
  <section id="favorites" class="py-10 px-4 lg:px-12">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
        <h2 class="text-3xl font-bold" data-section-title>我的收藏</h2>
        <div class="flex flex-col sm:flex-row gap-4 mt-2 md:mt-0">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="搜索收藏作品..." 
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            @keyup.enter="handleSearch"
          >
          <select 
            v-model="selectedCategory"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">全部分类</option>
            <option v-for="category in categories" :key="category.id" :value="category.name">
              {{ category.name }}
            </option>
          </select>
          <button 
            @click="handleSearch"
            class="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            <i class="fa fa-search"></i> 搜索
          </button>
        </div>
      </div>
      
      <div v-if="favoriteWorks.length === 0" class="text-center py-12 text-gray-500 col-span-full">
        <i class="fa fa-heart-o text-4xl mb-4"></i>
        <p>你还没有收藏任何作品</p>
        <p class="text-sm mt-2">浏览作品并点击心形图标来收藏</p>
      </div>
      
      <div v-else class="masonry-grid" id="favorites-grid">
        <div 
          v-for="(work, index) in favoriteWorks" 
          :key="work.id"
          class="work-card"
          @click="openWorkModal(work)"
        >
          <img :src="work.image" :alt="work.title" loading="lazy">
          <div class="work-card-info">
            <h3 class="work-card-title">{{ work.title }}</h3>
            <p class="work-card-category">{{ work.category }}</p>
          </div>
          <button 
            class="favorite-btn active"
            :data-id="work.id"
            @click.stop="toggleFavorite(work.id)"
          >
            <i class="fa fa-heart"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 作品详情模态框 -->
    <div v-if="currentWork" class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center px-4" @click="closeWorkModal">
      <div class="bg-white rounded-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto" @click.stop>
        <div class="relative">
          <button @click="closeWorkModal" class="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-all z-10">
            <i class="fa fa-times"></i>
          </button>
          
          <div class="p-10 flex flex-col md:flex-row gap-6">
            <div class="flex-shrink-0">
              <img :src="currentWork.image" :alt="currentWork.title" class="modal-image">
            </div>
            <div class="flex-1">
              <h2 class="modal-title">{{ currentWork.title }}</h2>
              <span class="modal-category">{{ currentWork.category }}</span>
              <div class="modal-prompt">{{ currentWork.prompt }}</div>
              <div class="modal-actions">
                <button 
                  class="btn btn-primary" 
                  :class="{ active: currentWork.isFavorite }"
                  @click="toggleFavorite(currentWork.id)"
                >
                  <i :class="currentWork.isFavorite ? 'fa fa-heart' : 'fa fa-heart-o'"></i>
                  {{ currentWork.isFavorite ? '已收藏' : '收藏' }}
                </button>
                <button class="btn btn-secondary" @click="copyPrompt(currentWork.prompt)">
                  <i class="fa fa-copy"></i>
                  复制提示词
                </button>
                <button class="btn btn-secondary" @click="downloadImage(currentWork.image, currentWork.title)">
                  <i class="fa fa-download"></i>
                  下载图片
                </button>
                <button class="btn btn-danger" @click="deleteWork(currentWork.id)">
                  <i class="fa fa-trash"></i>
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWorksStore } from '../stores/works'

const store = useWorksStore()
const currentWork = ref(null)
const searchQuery = ref('')
const selectedCategory = ref('')
const categories = computed(() => store.categories)

const favoriteWorks = computed(() => {
  let filteredWorks = store.works.filter(work => work.isFavorite === true)
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filteredWorks = filteredWorks.filter(work => 
      work.title.toLowerCase().includes(query) || 
      work.prompt.toLowerCase().includes(query)
    )
  }
  
  if (selectedCategory.value) {
    filteredWorks = filteredWorks.filter(work => work.category === selectedCategory.value)
  }
  
  return filteredWorks
})

onMounted(async () => {
  await store.loadFavorites()
  await store.loadCategories()
  initAnimations()
})

function handleSearch() {
  console.log('搜索:', searchQuery.value, '分类:', selectedCategory.value)
}

function initAnimations() {
  gsap.utils.toArray('[data-section-title]').forEach(title => {
    gsap.from(title, {
      scrollTrigger: {
        trigger: title,
        start: 'top 80%'
      },
      opacity: 0,
      y: 20,
      duration: 0.8
    })
  })
}

function toggleFavorite(id) {
  store.toggleFavorite(id)
}

function openWorkModal(work) {
  currentWork.value = work
}

function closeWorkModal() {
  currentWork.value = null
}

function copyPrompt(prompt) {
  navigator.clipboard.writeText(prompt).then(() => {
    alert('提示词已复制到剪贴板')
  })
}

function downloadImage(url, filename) {
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.jpg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

async function deleteWork(id) {
  if (confirm('确定要删除这个作品吗？删除后无法恢复。')) {
    try {
      await store.deleteWork(id)
      closeWorkModal()
      alert('作品删除成功')
    } catch (error) {
      alert('删除失败: ' + error.message)
    }
  }
}
</script>

<style scoped>
.masonry-grid {
  column-count: 5;
  column-gap: 0;
}

.work-card {
  position: relative;
  border-radius: 0;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  break-inside: avoid;
  margin-bottom: 0;
  padding: 2px;
  background: white;
}

.work-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.work-card img {
  width: 100%;
  height: auto;
  object-fit: contain;
  transition: transform 0.5s ease;
}

.work-card:hover img {
  transform: scale(1.05);
}

.work-card-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: white;
  transform: translateY(20px);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.work-card:hover .work-card-info {
  transform: translateY(0);
  opacity: 1;
}

.work-card-title {
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 4px;
}

.work-card-category {
  font-size: 14px;
  opacity: 0.8;
}

.favorite-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.favorite-btn:hover {
  background-color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.favorite-btn.active {
  color: #e11d48;
  background-color: white;
}

.modal-image {
  width: 400px;
  height: 400px;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 16px;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.modal-category {
  display: inline-block;
  background-color: #e0e7ff;
  color: #4f46e5;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
}

.modal-prompt {
  background-color: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  margin-bottom: 16px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background-color: #6366f1;
  color: white;
}

.btn-primary:hover {
  background-color: #4f46e5;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover {
  background-color: #dc2626;
}

@media (max-width: 1536px) {
  .masonry-grid {
    column-count: 4;
  }
}

@media (max-width: 1280px) {
  .masonry-grid {
    column-count: 3;
  }
}

@media (max-width: 1024px) {
  .masonry-grid {
    column-count: 2;
  }
}

@media (max-width: 640px) {
  .masonry-grid {
    column-count: 1;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .modal-actions .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 767px) {
  .fixed > div > div > div {
    flex-direction: column !important;
  }
}
</style>