<script setup lang="ts">
import PdfViewer from './components/PdfViewer.vue';
</script>

<template>
    <div>
        <h1>在线 PDF 预览</h1>
        <PdfViewer />
    </div>
</template>

<style scoped>
.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
}
.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
