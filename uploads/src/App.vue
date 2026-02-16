<template>
  <div class="app">
    <Sidebar ref="sidebarRef" />
    <main class="lg:ml-64 min-h-screen">
      <Header @open-sidebar="openSidebar" />
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'

const sidebarRef = ref(null)

const openSidebar = () => {
  sidebarRef.value.openSidebar()
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>