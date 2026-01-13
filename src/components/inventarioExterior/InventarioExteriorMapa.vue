<template>
  <div class="map-container relative-position">
    <div ref="mapContainer" class="map-view"></div>

    <div class="map-controls absolute-bottom-right q-ma-md column q-gutter-sm">
      <q-btn
        v-if="!readonly"
        round
        color="primary"
        icon="my_location"
        @click="usarMiUbicacion"
        :loading="cargando"
        tooltip="Usar mi ubicación"
      />
      <div v-if="cargando" class="text-white bg-dark q-pa-xs rounded-borders text-caption">
        Obteniendo GPS...
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useGeolocalizacion } from 'src/composables/useGeolocalizacion'

// Corrección para los iconos de marcadores faltantes en Leaflet al empaquetar
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const props = defineProps({
  latitud: [Number, String],
  longitud: [Number, String],
  readonly: Boolean,
})

const emit = defineEmits(['update:latitud', 'update:longitud'])

const { obtenerPosicion, cargando } = useGeolocalizacion()

const mapContainer = ref(null)
let map = null
let marker = null

const initialLat = -16.5 // Fallback por defecto (aprox. La Paz)
const initialLng = -68.15
const defaultZoom = 18

onMounted(() => {
  // Pequeño retraso para asegurar que el contenedor tenga dimensiones (útil en diálogos)
  setTimeout(() => {
    initMap()
  }, 100)
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})

function initMap() {
  if (!mapContainer.value) return

  const lat = props.latitud ? Number(props.latitud) : initialLat
  const lng = props.longitud ? Number(props.longitud) : initialLng

  map = L.map(mapContainer.value).setView([lat, lng], defaultZoom)
  map.attributionControl.setPrefix('')

  L.tileLayer('http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    //attribution: '© Google Maps'
  }).addTo(map)

  // Manejador de clics en el mapa
  map.on('click', (e) => {
    if (props.readonly) return
    updateLocation(e.latlng.lat, e.latlng.lng)
  })

  // Asegurar que el mapa se renderice bien y agregue marcador si hay coordenadas
  setTimeout(() => {
    if (!map) return
    map.invalidateSize()

    // Siempre verificar si hay coordenadas válidas después de invalidateSize
    const currentLat = props.latitud ? Number(props.latitud) : null
    const currentLng = props.longitud ? Number(props.longitud) : null

    if (currentLat && currentLng) {
      map.setView([currentLat, currentLng], defaultZoom)
      addMarker(currentLat, currentLng)
    }
  }, 350)
}

const redIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,

  // 🔥 Un poco más grande
  iconSize: [32, 52],
  iconAnchor: [16, 52],
  popupAnchor: [1, -42],
  shadowSize: [50, 50],
})

function addMarker(lat, lng) {
  if (marker) {
    marker.setLatLng([lat, lng])
  } else {
    marker = L.marker([lat, lng], {
      draggable: !props.readonly,
      icon: redIcon,
    }).addTo(map)

    marker.on('dragend', (event) => {
      if (props.readonly) return
      const position = event.target.getLatLng()
      updateLocation(position.lat, position.lng)
    })
  }

  // Actualiza si el marcador es arrastrable según cambie readonly
  if (marker.dragging) {
    if (props.readonly) marker.dragging.disable()
    else marker.dragging.enable()
  }
}

function updateLocation(lat, lng) {
  emit('update:latitud', lat)
  emit('update:longitud', lng)
  addMarker(lat, lng)
}

async function usarMiUbicacion() {
  try {
    if (!map) {
      console.warn('Mapa no inicializado aún')
      return
    }
    const pos = await obtenerPosicion()

    // Asegurar que el mapa esté listo antes de hacer setView
    setTimeout(() => {
      if (map) {
        map.setView([pos.lat, pos.lng], 18)
        updateLocation(pos.lat, pos.lng)
      }
    }, 100)
  } catch (e) {
    console.error('Error GPS', e)
    // El componente padre puede manejar errores vía el composable compartido
    // o emitir un evento. Por ahora, fallo silencioso y el estado de carga informa.
  }
}

// Watchers
watch(
  () => [props.latitud, props.longitud],
  ([newLat, newLng]) => {
    // Solo actualizar si el mapa ya está inicializado y las coordenadas son válidas
    if (newLat && newLng && map) {
      const lat = Number(newLat)
      const lng = Number(newLng)
      map.setView([lat, lng], defaultZoom)
      addMarker(lat, lng)
    }
  },
)

watch(
  () => props.readonly,
  (val) => {
    if (marker && marker.dragging) {
      if (val) marker.dragging.disable()
      else marker.dragging.enable()
    }
  },
)

defineExpose({
  usarMiUbicacion,
  setMarkerLocation: (lat, lng) => {
    if (map) {
      map.setView([lat, lng], map.getZoom())
      addMarker(lat, lng)
    } else {
      // Si el mapa no está listo, esperar un poco más
      setTimeout(() => {
        if (map) {
          map.setView([lat, lng], defaultZoom)
          addMarker(lat, lng)
        }
      }, 300)
    }
  },
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ccc;
}
.map-view {
  width: 100%;
  height: 100%;
  z-index: 1;
}
.map-controls {
  z-index: 2;
}
</style>
