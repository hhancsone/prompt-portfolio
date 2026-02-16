<template>
  <section id="create" class="py-20 px-4 lg:px-12 bg-gray-100">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-3xl font-bold mb-12" data-section-title>创建新作品</h2>
      
      <div class="bg-white rounded-xl shadow-sm p-8" data-section-content>
        <div class="mb-8">
          <label for="title-input" class="block text-sm font-medium text-gray-700 mb-2">作品标题</label>
          <input 
            id="title-input" 
            v-model="title" 
            type="text"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="给你的作品起个名字"
          >
        </div>

        <div class="mb-8">
          <label for="prompt-input" class="block text-sm font-medium text-gray-700 mb-2">输入你的提示词</label>
          <textarea 
            id="prompt-input" 
            v-model="prompt" 
            rows="4" 
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="描述你想要创建的图像，例如：'极简主义风格的城市天际线，蓝色调，清晰的线条'"
          ></textarea>
        </div>

        <div class="mb-8">
          <label for="category-select" class="block text-sm font-medium text-gray-700 mb-2">作品分类</label>
          <select 
            id="category-select" 
            v-model="category" 
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
          >
            <option value="">请选择分类</option>
            <option value="P图">P图</option>
            <option value="写真">写真</option>
            <option value="视频">视频</option>
            <option value="萌宠">萌宠</option>
            <option value="宝宝">宝宝</option>
            <option value="头像">头像</option>
            <option value="海报">海报</option>
            <option value="手抄报">手抄报</option>
            <option value="插画">插画</option>
            <option value="Logo">Logo</option>
          </select>
        </div>

        <div class="mb-8">
          <label class="block text-sm font-medium text-gray-700 mb-2">上传作品图片</label>
          <div 
            class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition-colors"
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
            <div v-if="!imagePreview" class="space-y-2">
              <i class="fa fa-cloud-upload text-4xl text-gray-400"></i>
              <p class="text-gray-600">点击或拖拽图片到此处上传</p>
              <p class="text-sm text-gray-400">支持 JPG、PNG、GIF 格式</p>
            </div>
            <div v-else class="relative">
              <img :src="imagePreview" alt="预览" class="max-h-64 mx-auto rounded-lg">
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
            id="generate-btn" 
            @click="generateImage"
            :class="{ loading: isLoading }"
            class="flex-1 bg-indigo-500 text-white py-3 rounded-lg font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center space-x-2"
          >
            <span>{{ isLoading ? '生成中...' : '生成图像' }}</span>
            <i v-if="!isLoading" class="fa fa-magic"></i>
          </button>
          
          <button 
            @click="resetForm"
            class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <i class="fa fa-refresh"></i>
            重置
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useWorksStore } from '../stores/works'
import { useRouter } from 'vue-router'

const store = useWorksStore()
const router = useRouter()

const title = ref('')
const prompt = ref('')
const category = ref('')
const isLoading = ref(false)
const imagePreview = ref('')
const uploadedImage = ref(null)
const fileInput = ref(null)
const selectedFile = ref(null)

onMounted(async () => {
  await store.loadCategories()
  initAnimations()
})

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
  
  gsap.utils.toArray('[data-section-content]').forEach(content => {
    gsap.from(content, {
      scrollTrigger: {
        trigger: content,
        start: 'top 80%'
      },
      opacity: 0,
      y: 30,
      duration: 0.8,
      delay: 0.2
    })
  })
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
  selectedFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

function removeImage() {
  imagePreview.value = ''
  uploadedImage.value = null
  selectedFile.value = null
  fileInput.value.value = ''
}

function resetForm() {
  title.value = ''
  prompt.value = ''
  category.value = ''
  imagePreview.value = ''
  uploadedImage.value = null
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function uploadImage(file) {
  const formData = new FormData()
  formData.append('image', file)
  const workTitle = title.value.trim() || 'untitled'
  formData.append('title', workTitle)
  console.log('Uploading image with title:', workTitle)
  
  const response = await fetch('http://localhost:3001/api/upload', {
    method: 'POST',
    body: formData
  })
  
  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.error)
  }
  
  console.log('Upload result:', result)
  return result.imageUrl
}

async function generateImage() {
  if (!title.value.trim()) {
    alert('请输入作品标题')
    return
  }
  
  if (!prompt.value.trim()) {
    alert('请输入提示词')
    return
  }
  
  if (!category.value.trim()) {
    alert('请输入作品分类')
    return
  }
  
  isLoading.value = true
  
  try {
    let imageUrl = uploadedImage.value
    
    if (selectedFile.value) {
      imageUrl = await uploadImage(selectedFile.value)
      uploadedImage.value = imageUrl
    }
    
    const newWork = {
      title: title.value.trim(),
      category: category.value.trim(),
      image: imageUrl || 'https://p9-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/419154639f3d449485da0e5e12e9074a~tplv-a9rns2rl98-image.image?lk3s=8e244e95&rcl=20260215203808AFE803D775AA553FC04E&rrcfp=f06b921b&x-expires=1773751102&x-signature=Zxp1xvtS%2FQhQgyojQS%2BQvYG0C8M%3D',
      prompt: prompt.value.trim(),
      isFavorite: false
    }
    
    await store.addWork(newWork)
    
    resetForm()
    isLoading.value = false
    
    alert('作品创建成功！已保存到作品展示页面。')
    router.push('/works')
  } catch (error) {
    isLoading.value = false
    alert('创建作品失败: ' + error.message)
  }
}
</script>

<style scoped>
#generate-btn {
  position: relative;
  overflow: hidden;
}

#generate-btn.loading {
  pointer-events: none;
  opacity: 0.7;
}

#generate-btn.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid transparent;
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>