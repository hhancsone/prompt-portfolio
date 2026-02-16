<template>
  <header class="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-40">
    <div class="flex items-center justify-between p-4">
      <button @click="$emit('open-sidebar')" class="text-gray-500 hover:text-gray-800">
        <i class="fa fa-bars"></i>
      </button>
      <h1 class="text-xl font-bold">Prompt<span class="text-indigo-500">Folio</span></h1>
      <div class="w-5"></div>
    </div>
  </header>
</template>

<script setup>
defineEmits(['open-sidebar'])
</script>