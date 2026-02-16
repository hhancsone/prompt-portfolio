<template>
  <section id="works" class="py-10 px-4 lg:px-12">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
        <h2 class="text-3xl font-bold" data-section-title>精选作品</h2>
        <div class="flex flex-col sm:flex-row gap-4 mt-2 md:mt-0">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="搜索作品标题或提示词..." 
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
          <button 
            @click="openCreateModal"
            class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <i class="fa fa-plus"></i> 新增作品
          </button>
        </div>
      </div>
      
      <div class="masonry-grid" id="works-grid">
        <div 
          v-for="(work, index) in works" 
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
            class="favorite-btn" 
            :class="{ active: work.isFavorite }"
            :data-id="work.id"
            @click.stop="toggleFavorite(work.id)"
          >
            <i :class="work.isFavorite ? 'fa fa-heart' : 'fa fa-heart-o'"></i>
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

    <!-- 创建作品模态框 -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center px-4" @click="closeCreateModal">
      <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="relative">
          <button @click="closeCreateModal" class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 rounded-full w-10 h-10 flex items-center justify-center transition-all z-10">
            <i class="fa fa-times"></i>
          </button>
          
          <div class="p-8">
            <h2 class="text-2xl font-bold mb-6">创建新作品</h2>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">作品标题</label>
              <input 
                v-model="createTitle" 
                type="text"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="给你的作品起个名字"
              >
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">输入你的提示词</label>
              <textarea 
                v-model="createPrompt" 
                rows="4" 
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="描述你想要创建的图像，例如：'极简主义风格的城市天际线，蓝色调，清晰的线条'"
              ></textarea>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">作品分类</label>
              <select 
                v-model="createCategory" 
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
              >
                <option value="">请选择分类</option>
                <option v-for="category in categories" :key="category.id" :value="category.name">
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">上传作品图片</label>
              <div 
                class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 transition-colors"
                @click="triggerFileInput"
                @dragover.prevent
                @drop.prevent="handleFileDrop"
              >
                <input 
                  ref="fileInput" 
                  type="file" 
                  accept="image/*" 
                  class="hidden" 
                  @change="handleFileSelect"
                >
                <div v-if="!createImagePreview" class="space-y-2">
                  <i class="fa fa-cloud-upload text-2xl text-gray-400"></i>
                  <p class="text-gray-600 text-sm">点击或拖拽图片到此处上传</p>
                  <p class="text-xs text-gray-400">支持 JPG、PNG、GIF 格式</p>
                </div>
                <div v-else class="relative">
                  <img :src="createImagePreview" alt="预览" class="max-h-40 mx-auto rounded-lg">
                  <button 
                    @click.stop="removeImage"
                    class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <i class="fa fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div class="flex gap-4">
              <button 
                @click="handleCreateWork"
                :disabled="isCreating"
                class="flex-1 bg-indigo-500 text-white py-3 rounded-lg font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{{ isCreating ? '创建中...' : '创建作品' }}</span>
                <i v-if="!isCreating" class="fa fa-magic"></i>
              </button>
              
              <button 
                @click="resetCreateForm"
                class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <i class="fa fa-refresh"></i>
                重置
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useWorksStore } from '../stores/works'

const store = useWorksStore()
const currentWork = ref(null)
const searchQuery = ref('')
const selectedCategory = ref('')
const categories = computed(() => store.categories)

const showCreateModal = ref(false)
const createTitle = ref('')
const createPrompt = ref('')
const createCategory = ref('')
const isCreating = ref(false)
const createImagePreview = ref('')
const createSelectedFile = ref(null)
const fileInput = ref(null)

const works = computed(() => {
  let filteredWorks = store.works
  
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
  await store.loadWorks()
  await store.loadCategories()
  initAnimations()
})

function openCreateModal() {
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
  resetCreateForm()
}

function handleSearch() {
  console.log('搜索:', searchQuery.value, '分类:', selectedCategory.value)
}

function triggerFileInput() {
  fileInput.value.click()
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

function handleFileDrop(event) {
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    processFile(file)
  }
}

function processFile(file) {
  createSelectedFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    createImagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

function removeImage() {
  createImagePreview.value = ''
  createSelectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function resetCreateForm() {
  createTitle.value = ''
  createPrompt.value = ''
  createCategory.value = ''
  createImagePreview.value = ''
  createSelectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function uploadImage(file) {
  const formData = new FormData()
  formData.append('image', file)
  const workTitle = createTitle.value.trim() || 'untitled'
  formData.append('title', workTitle)
  
  const categoryId = categories.value.find(c => c.name === createCategory.value)?.id
  
  console.log('Uploading image with title:', workTitle, 'category_id:', categoryId)
  
  const response = await fetch(`http://localhost:3001/api/upload?category_id=${categoryId}`, {
    method: 'POST',
    body: formData
  })
  
  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text()
    console.error('服务器返回非JSON响应:', text)
    throw new Error('服务器错误，请检查后端服务是否正常运行')
  }
  
  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.error)
  }
  
  console.log('Upload result:', result)
  return result.imageUrl
}

async function handleCreateWork() {
  if (!createTitle.value.trim()) {
    alert('请输入作品标题')
    return
  }
  
  if (!createPrompt.value.trim()) {
    alert('请输入提示词')
    return
  }
  
  if (!createCategory.value.trim()) {
    alert('请选择作品分类')
    return
  }
  
  isCreating.value = true
  
  try {
    let imageUrl = 'https://p9-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/419154639f3d449485da0e5e12e9074a~tplv-a9rns2rl98-image.image?lk3s=8e244e95&rcl=20260215203808AFE803D775AA553FC04E&rrcfp=f06b921b&x-expires=1773751102&x-signature=Zxp1xvtS%2FQhQgyojQS%2BQvYG0C8M%3D'
    
    if (createSelectedFile.value) {
      imageUrl = await uploadImage(createSelectedFile.value)
    }
    
    const newWork = {
      title: createTitle.value.trim(),
      category: createCategory.value.trim(),
      image: imageUrl,
      prompt: createPrompt.value.trim(),
      isFavorite: false
    }
    
    console.log('Creating work with category:', createCategory.value.trim())
    await store.addWork(newWork)
    
    resetCreateForm()
    isCreating.value = false
    closeCreateModal()
    
    alert('作品创建成功！已保存到作品展示页面。')
  } catch (error) {
    isCreating.value = false
    alert('创建作品失败: ' + error.message)
  }
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
  width: 100%;
  max-width: 500px;
  height: auto;
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
  word-break: break-word;
  max-height: 300px;
  overflow-y: auto;
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