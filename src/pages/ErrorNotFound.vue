<template>
  <div class="fullscreen bg-gradient text-white text-center q-pa-md flex flex-center">
    <div class="construction-container">
      <!-- Icono de engranaje animado -->
      <div class="gear-wrapper">
        <q-icon name="settings" size="80px" class="gear-icon" color="amber-3" />
      </div>

      <!-- Imagen principal con animación de flotación -->
      <transition appear enter-active-class="animated fadeInUp">
        <img
          src="../assets/yfcontruccion.jpg"
          alt="Página en construcción"
          class="construction-image"
        />
      </transition>

      <!-- Texto principal -->
      <transition appear enter-active-class="animated fadeInUp delay-1">
        <div class="text-h2 text-weight-bolder main-title">Página en construcción</div>
      </transition>

      <!-- Barra de progreso animada -->
      <transition appear enter-active-class="animated fadeIn delay-2">
        <div class="progress-wrapper q-mt-md">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <span class="progress-text text-caption q-mt-xs">{{ progress }}% completado</span>
        </div>
      </transition>

      <!-- Subtítulo -->
      <transition appear enter-active-class="animated fadeInUp delay-3">
        <div class="text-subtitle1 q-mt-md subtitle">
          Estamos trabajando para brindarte la mejor experiencia
        </div>
      </transition>

      <!-- Botón con efecto glow -->
      <transition appear enter-active-class="animated fadeInUp delay-4">
        <q-btn
          class="q-mt-xl btn-glow"
          color="white"
          text-color="amber-8"
          unelevated
          to="/"
          label="Volver al inicio"
          no-caps
          size="lg"
          rounded
        />
      </transition>

      <!-- Partículas decorativas -->
      <div class="particles">
        <span v-for="i in 6" :key="i" class="particle" :style="particleStyle(i)"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const progress = ref(0)
let interval = null

// Simular progreso de carga
onMounted(() => {
  interval = setInterval(() => {
    if (progress.value < 85) {
      progress.value += Math.floor(Math.random() * 5) + 1
      if (progress.value > 85) progress.value = 85
    }
  }, 300)
})

onBeforeUnmount(() => {
  clearInterval(interval)
})

// Estilos aleatorios para partículas decorativas
const particleStyle = (i) => ({
  left: `${Math.random() * 100}%`,
  animationDelay: `${i * 0.6}s`,
  animationDuration: `${3 + Math.random() * 4}s`,
  width: `${4 + Math.random() * 8}px`,
  height: `${4 + Math.random() * 8}px`,
  opacity: 0.15 + Math.random() * 0.25,
})
</script>

<style scoped>
/* Fondo con gradiente animado */
.bg-gradient {
  background: linear-gradient(135deg, #00695c, #00838f, #00695c);
  background-size: 400% 400%;
  animation: gradientShift 8s ease infinite;
}

@keyframes gradientShift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.construction-container {
  position: relative;
  z-index: 1;
  max-width: 600px;
  width: 100%;
}

/* Imagen con animación de flotación */
.construction-image {
  width: 50%;
  height: auto;
  max-width: 100%;
  margin: 0 auto 20px auto;
  border-radius: 20px;
  filter: drop-shadow(0 10px 25px rgba(0, 0, 0, 0.3));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}

/* Engranaje giratorio */
.gear-wrapper {
  position: absolute;
  top: -30px;
  right: 10px;
  opacity: 0.4;
}

.gear-icon {
  animation: spin 8s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Título con efecto de texto */
.main-title {
  letter-spacing: 2px;
  text-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
}

/* Barra de progreso */
.progress-wrapper {
  max-width: 300px;
  margin: 0 auto;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd54f, #ffb300);
  border-radius: 10px;
  transition: width 0.4s ease;
  position: relative;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    box-shadow: 0 0 5px rgba(255, 193, 7, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 193, 7, 0.8);
  }
  100% {
    box-shadow: 0 0 5px rgba(255, 193, 7, 0.5);
  }
}

.progress-text {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

/* Subtítulo */
.subtitle {
  opacity: 0.85;
  font-weight: 400;
  letter-spacing: 0.5px;
}

/* Botón con efecto glow */
.btn-glow {
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.25);
}

.btn-glow:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 8px 30px rgba(255, 255, 255, 0.45);
}

/* Partículas flotantes decorativas */
.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  pointer-events: none;
}

.particle {
  position: absolute;
  bottom: -20px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: rise linear infinite;
}

@keyframes rise {
  0% {
    transform: translateY(0) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) scale(1.5);
    opacity: 0;
  }
}

/* Clases de delay para animaciones secuenciales */
.delay-1 {
  animation-delay: 0.2s;
}
.delay-2 {
  animation-delay: 0.4s;
}
.delay-3 {
  animation-delay: 0.6s;
}
.delay-4 {
  animation-delay: 0.8s;
}

/* Aseguramos que los elementos estén ocultos antes de la animación */
.animated {
  animation-duration: 0.8s;
  animation-fill-mode: both;
}

.fadeInUp {
  animation-name: fadeInUp;
}

.fadeIn {
  animation-name: fadeIn;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
