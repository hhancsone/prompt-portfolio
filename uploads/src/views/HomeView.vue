<template>
  <section id="home" class="min-h-screen pt-16 lg:pt-0 flex items-center justify-center px-4">
    <div class="max-w-4xl mx-auto text-center">
      <h1 class="text-4xl md:text-6xl font-bold mb-6" id="hero-title">
        探索<span class="text-indigo-500">AI创作</span>的无限可能
      </h1>
      <p class="text-xl text-gray-600 mb-10" id="hero-subtitle">
        展示由提示词驱动的艺术作品，发现人工智能与创意的完美结合
      </p>
      <router-link to="/works" class="inline-block bg-indigo-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-600 transition-colors" id="hero-cta">
        浏览作品集
      </router-link>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // 初始化动画
  gsap.to('#hero-title', {
    opacity: 1,
    y: 0,
    duration: 1,
    delay: 0.2
  })
  
  gsap.to('#hero-subtitle', {
    opacity: 1,
    y: 0,
    duration: 1,
    delay: 0.5
  })
  
  gsap.to('#hero-cta', {
    opacity: 1,
    y: 0,
    duration: 1,
    delay: 0.8
  })
})
</script>