<template>
  <nav class="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out" :class="{ 'open': isOpen }">
    <div class="p-6">
      <div class="flex items-center justify-between mb-12">
        <h1 class="text-2xl font-bold">Prompt<span class="text-indigo-500">Folio</span></h1>
        <button @click="closeSidebar" class="lg:hidden text-gray-500 hover:text-gray-800">
          <i class="fa fa-times"></i>
        </button>
      </div>
      
      <ul class="space-y-6">
        <li>
          <router-link to="/" class="nav-link flex items-center space-x-3 text-gray-800 hover:text-indigo-500 transition-colors">
            <i class="fa fa-home w-5 text-center"></i>
            <span>首页</span>
          </router-link>
        </li>
        <li>
          <router-link to="/works" class="nav-link flex items-center space-x-3 text-gray-800 hover:text-indigo-500 transition-colors">
            <i class="fa fa-th w-5 text-center"></i>
            <span>作品展示</span>
          </router-link>
        </li>
        <li>
          <router-link to="/favorites" class="nav-link flex items-center space-x-3 text-gray-800 hover:text-indigo-500 transition-colors">
            <i class="fa fa-heart w-5 text-center"></i>
            <span>收藏</span>
          </router-link>
        </li>
      </ul>
      
      <div class="absolute bottom-8 left-0 right-0 px-6">
        <div class="flex items-center justify-between text-sm text-gray-500">
          <span>© 2026 PromptFolio</span>
          <div class="flex space-x-4">
            <a href="#" class="hover:text-indigo-500 transition-colors">
              <i class="fa fa-instagram"></i>
            </a>
            <a href="#" class="hover:text-indigo-500 transition-colors">
              <i class="fa fa-twitter"></i>
            </a>
            <a href="#" class="hover:text-indigo-500 transition-colors">
              <i class="fa fa-behance"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)

const openSidebar = () => {
  isOpen.value = true
}

const closeSidebar = () => {
  isOpen.value = false
}

defineExpose({
  openSidebar,
  closeSidebar
})
</script>

<style scoped>
.nav-link {
  position: relative;
  padding: 8px 0;
  font-weight: 500;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #6366f1;
  transition: width 0.3s ease;
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  width: 100%;
}

@media (max-width: 1023px) {
  nav {
    transform: translateX(-100%);
  }
  
  nav.open {
    transform: translateX(0);
  }
}
</style>