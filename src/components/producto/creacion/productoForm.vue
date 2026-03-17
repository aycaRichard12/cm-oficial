<template>
  <q-form @submit.prevent="handleSubmit">
    <!-- Información Básica -->
    <q-card-section>
      <div class="text-subtitle1 text-weight-medium q-mb-md">Información Básica</div>
      <q-separator class="q-mb-md" />
      
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-input
            v-model="localData.codigo"
            label="Código de Producto *"
            dense
            outlined
            hint="Código único del producto"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-input
            v-model="localData.nombre"
            label="Nombre del Producto *"
            dense
            outlined
            hint="Nombre comercial"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-input
            v-model="localData.descripcion"
            label="Descripción *"
            dense
            outlined
            hint="Descripción breve"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-input
            v-model="localData.codigobarras"
            label="Código de Barras"
            dense
            outlined
            hint="Opcional"
          />
        </div>
      </div>
    </q-card-section>

    <!-- Categorización -->
    <q-card-section>
      <div class="text-subtitle1 text-weight-medium q-mb-md">Categorización</div>
      <q-separator class="q-mb-md" />
      
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-select
            v-model="localData.categoria"
            :options="categorias"
            label="Categoría *"
            dense
            outlined
            emit-value
            map-options
            hint="Seleccione la categoría principal"
            @update:model-value="
              (val) => {
                localData.subcategoria = null
                emit('categoria-changed', val)
              }
            "
          />
        </div>
        
        <div class="col-12 col-md-4" v-if="subcategorias.length > 0">
          <q-select
            v-model="localData.subcategoria"
            :options="subcategorias"
            label="Sub Categoría *"
            dense
            outlined
            emit-value
            map-options
            hint="Seleccione la subcategoría"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-select
            v-model="localData.estadoproductos"
            :options="estados"
            label="Estado del Producto *"
            dense
            outlined
            emit-value
            map-options
            hint="Estado actual"
          />
        </div>
      </div>
    </q-card-section>

    <!-- Características -->
    <q-card-section>
      <div class="text-subtitle1 text-weight-medium q-mb-md">Características</div>
      <q-separator class="q-mb-md" />
      
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-select
            v-model="localData.unidad"
            :options="unidades"
            label="Unidad de Medida *"
            dense
            outlined
            emit-value
            map-options
            hint="Ej: Kilo, Unidad, Litro"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-select
            v-model="localData.medida"
            :options="medidas"
            label="Característica *"
            dense
            outlined
            emit-value
            map-options
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-input
            v-model="localData.caracteristica"
            label="Otras Características"
            dense
            outlined
            hint="Opcional"
          />
        </div>
      </div>
    </q-card-section>

    <!-- Información SIN (Facturación) -->
    <q-card-section v-if="tipoFactura">
      <div class="text-subtitle1 text-weight-medium q-mb-md">Información SIN (Facturación)</div>
      <q-separator class="q-mb-md" />
      
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <q-select
            v-model="localData.codigosin"
            :options="FilterProductoSIN"
            label="Producto SIN *"
            dense
            outlined
            emit-value
            map-options
            use-input
            fill-input
            hide-selected
            input-debounce="0"
            @filter="filterFn"
            hint="Busque el código SIN del producto"
          />
        </div>
        
        <div class="col-12 col-md-3">
          <q-select
            v-model="localData.unidadsin"
            :options="FilterUnidadSIN"
            label="Unidad SIN *"
            dense
            outlined
            emit-value
            map-options
            use-input
            fill-input
            hide-selected
            input-debounce="0"
            @filter="filterUnidadFn"
            hint="Unidad según SIN"
          />
        </div>
        
        <div class="col-12 col-md-3">
          <q-input
            v-model="localData.codigoNandina"
            label="Código Nandina"
            dense
            outlined
            hint="Opcional"
          />
        </div>
      </div>
    </q-card-section>

    <!-- Imagen del Producto -->
    <q-card-section>
      <div class="text-subtitle1 text-weight-medium q-mb-md">Imagen del Producto</div>
      <q-separator class="q-mb-md" />
      
      <div class="row q-col-gutter-md">
        <div class="col-12" :class="imagePreview ? 'col-md-8' : ''">
          <q-file
            v-model="localData.imagen"
            label="Seleccionar imagen"
            outlined
            dense
            accept="image/*"
            hint="Formatos admitidos: JPG, PNG. La imagen se optimizará automáticamente."
            counter
            @update:model-value="onImageSelected"
            :loading="isCompressing"
            :disable="isCompressing"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
        </div>
        
        <div class="col-12 col-md-4" v-if="imagePreview">
          <div class="text-caption text-grey-7 q-mb-xs">
            {{ typeof localData.imagen === 'string' ? 'Imagen actual' : 'Vista previa' }}
          </div>
          <q-card flat bordered class="q-pa-sm">
            <q-img
              :src="imagePreview"
              style="max-height: 120px; border-radius: 4px"
              fit="contain"
              class="bg-grey-2"
            >
              <template v-slot:error>
                <div class="absolute-full flex flex-center bg-grey-3 text-grey-7">
                  <div class="text-center">
                    <q-icon name="broken_image" size="md" />
                    <div class="text-caption">Error al cargar imagen</div>
                  </div>
                </div>
              </template>
            </q-img>
            <div class="text-caption text-grey-7 q-mt-xs text-center" v-if="typeof localData.imagen !== 'string'">
              {{ localData.imagen?.name }}
            </div>
          </q-card>
        </div>
      </div>
    </q-card-section>

    <!-- Botones de Acción -->
    <q-separator />
    
    <q-card-actions align="right" class="q-pa-md">
      <q-btn
        label="Cancelar"
        flat
        color="grey-7"
        @click="$emit('cancel')"
        class="q-mr-sm"
      />
      <q-btn
        label="Guardar"
        type="submit"
        color="primary"
        unelevated
        :disable="isCompressing"
      />
    </q-card-actions>
  </q-form>
</template>

<script setup>
import { ref, watch, computed, onUnmounted } from 'vue'
import { TipoFactura } from 'src/composables/FuncionesGenerales'
import imageCompression from 'browser-image-compression'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const tipoFactura = TipoFactura()
console.log('Tipo de factura en productoForm.vue:', tipoFactura)

let objectUrl = null
const isCompressing = ref(false)
let isProgrammaticUpdate = false // Flag to prevent infinite loop

const props = defineProps({
  isEditing: Boolean,
  modelValue: Object,
  categorias: {
    type: Array,
    default: () => [],
  },
  estados: {
    type: Array,
    default: () => [],
  },
  subcategorias: {
    type: Array,
    default: () => [],
  },
  unidades: {
    type: Array,
    default: () => [],
  },
  medidas: {
    type: Array,
    default: () => [],
  },
  productoSIN: {
    type: Array,
    default: () => [],
  },
  unidadSIN: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['submit', 'cancel'])
const FilterProductoSIN = ref([...props.productoSIN])
const FilterUnidadSIN = ref([...props.unidadSIN])
const localData = ref({ ...props.modelValue })

// Computed property for image preview
const imagePreview = computed(() => {
  if (!localData.value.imagen) return null
  
  // If it's a File object (newly selected), create object URL
  if (localData.value.imagen instanceof File) {
    // Clean up old object URL if exists
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
    }
    objectUrl = URL.createObjectURL(localData.value.imagen)
    return objectUrl
  }
  
  // If it's a string (existing image from database), use vista URL
  if (typeof localData.value.imagen === 'string') {
    return localData.value.vista
  }
  
  return null
})

// Handler for image selection and compression
const onImageSelected = async (file) => {
  // Prevent infinite loop if we are just updating the model programmatically
  if (isProgrammaticUpdate) {
    isProgrammaticUpdate = false
    return
  }

  // Prevent infinite loop if the file is already a webp or undefined
  if (!file) {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      objectUrl = null
    }
    return
  }
  
  // If it's a string (existing image)
  if (!(file instanceof File)) {
    return
  }

  try {
    isCompressing.value = true
    
    // We use a simple notification without trying to store its ID and update it later
    // because doing so causes "trying to update a grouped one which is forbidden" error in Quasar.
    $q.notify({
      message: 'Optimizando imagen...',
      color: 'info',
      textColor: 'white',
      icon: 'cloud_upload',
      timeout: 1500, // Short timeout, the real indicator is the loading spinner on the input
    })

    const options = {
      maxSizeMB: 1, // Compress to less than 1MB
      maxWidthOrHeight: 1920, // Max resolution 1920px
      useWebWorker: true,
      fileType: 'image/jpeg', // Convert to JPEG format for backend compatibility (JPG/PNG only)
      initialQuality: 0.9, // Maintain high visual quality
    }

    // Attempt to compress the image
    const compressedBlob = await imageCompression(file, options)
    
    // Create a new File from the Blob to keep the original name (but with .jpg extension)
    const newFileName = file.name.replace(/\.[^/.]+$/, "") + '.jpg'
    const compressedFile = new File([compressedBlob], newFileName, {
      type: 'image/jpeg',
      lastModified: Date.now()
    })

    console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)} MB`)
    console.log(`Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`)

    // This flag prevents the @update:model-value from triggering this function again and causing an infinite loop
    isProgrammaticUpdate = true
    
    // Update the v-model with the compressed file
    // Note: This triggers the `imagePreview` computed properly
    localData.value.imagen = compressedFile

    // Show a success notification
    $q.notify({
      message: 'Imagen optimizada con éxito',
      color: 'positive',
      icon: 'check_circle',
      timeout: 2500,
    })

  } catch (error) {
    console.error('Error compressing image:', error)
    $q.notify({
      message: 'Hubo un error al optimizar la imagen',
      color: 'negative',
      icon: 'warning',
    })
    
    isProgrammaticUpdate = true
    // If compression fails, we fallback to the original file
    // The imagePreview will still handle the display
    localData.value.imagen = file
  } finally {
    isCompressing.value = false
  }
}

// Cleanup object URL on unmount
onUnmounted(() => {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
  }
})
function filterFn(val, update) {
  console.log(val)
  if (val === '') {
    update(() => {
      FilterProductoSIN.value = [...props.productoSIN]
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    FilterProductoSIN.value = props.productoSIN.filter((v) =>
      v.label.toLowerCase().includes(needle),
    )
  })
}
function filterUnidadFn(val, update) {
  console.log(val)
  if (val === '') {
    update(() => {
      FilterUnidadSIN.value = [...props.unidadSIN]
    })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    FilterUnidadSIN.value = props.unidadSIN.filter((v) => v.label.toLowerCase().includes(needle))
  })
}
console.log(props.modelValue)
watch(
  () => props.modelValue,
  (val) => {
    localData.value = { ...val }
  },
  { deep: true },
)

const handleSubmit = () => {
  console.log('=== FORM SUBMIT DEBUG ===')
  console.log('localData.categoria:', localData.value.categoria)
  console.log('localData.subcategoria:', localData.value.subcategoria)
  console.log('Full localData:', JSON.stringify(localData.value, null, 2))
  emit('submit', localData.value)
}
</script>
