<template>
  <div class="signature-pad-container">
    <canvas
      ref="canvas"
      class="signature-canvas"
      @mousedown="startDrawing"
      @mousemove="draw"
      @mouseup="stopDrawing"
      @mouseleave="stopDrawing"
      @touchstart.prevent="startDrawing"
      @touchmove.prevent="draw"
      @touchend.prevent="stopDrawing"
    ></canvas>
    <div class="row justify-between q-mt-sm">
      <q-btn flat color="negative" label="Limpiar" @click="clearCanvas" />
      <!-- El botón de guardar se manejará desde el padre accediendo al método save -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineExpose } from 'vue'

const canvas = ref(null)
const ctx = ref(null)
const isDrawing = ref(false)

onMounted(() => {
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
})

const resizeCanvas = () => {
  if (canvas.value) {
    const parent = canvas.value.parentElement
    canvas.value.width = parent.clientWidth
    canvas.value.height = 200 // Altura fija o prop
    ctx.value = canvas.value.getContext('2d')
    ctx.value.strokeStyle = '#000'
    ctx.value.lineWidth = 2
    ctx.value.lineCap = 'round'
  }
}

const getPos = (e) => {
  const rect = canvas.value.getBoundingClientRect()
  if (e.touches && e.touches.length > 0) {
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top,
    }
  }
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  }
}

const startDrawing = (e) => {
  isDrawing.value = true
  const pos = getPos(e)
  ctx.value.beginPath()
  ctx.value.moveTo(pos.x, pos.y)
}

const draw = (e) => {
  if (!isDrawing.value) return
  const pos = getPos(e)
  ctx.value.lineTo(pos.x, pos.y)
  ctx.value.stroke()
}

const stopDrawing = () => {
  if (isDrawing.value) {
    isDrawing.value = false
    ctx.value.closePath()
  }
}

const clearCanvas = () => {
  if (canvas.value && ctx.value) {
    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
  }
}

const saveSignature = () => {
  if (canvas.value) {
    // Verificar si está vacío
    const blank = document.createElement('canvas')
    blank.width = canvas.value.width
    blank.height = canvas.value.height
    if (canvas.value.toDataURL() === blank.toDataURL()) {
      return null
    }
    return canvas.value.toDataURL('image/png')
  }
  return null
}

defineExpose({
  saveSignature,
  clearCanvas,
})
</script>

<style scoped>
.signature-pad-container {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px;
  background: white;
}

.signature-canvas {
  width: 100%;
  height: 200px;
  background-color: #f9f9f9;
  cursor: crosshair;
  touch-action: none;
}
</style>
