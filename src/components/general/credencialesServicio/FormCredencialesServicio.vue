<template>
  <q-card-section>
    <q-form @submit.prevent="onSubmit">
      <div class="row q-col-gutter-md">
        <!-- Service Selection (shown in both create and edit modes) -->
        <div class="col-12">
          <label for="id_soft_externo">{{ t('configuracion.credencialesServicio.dialog.servicio') }}</label>
          <q-select
            v-model="localFormData.id_soft_externo"
            :options="filteredServices"
            outlined
            dense
            id="id_soft_externo"
            use-input
            input-debounce="300"
            @filter="filterServices"
            :loading="loadingServices"
            :rules="validationRules.id_soft_externo"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            :hint="t('configuracion.credencialesServicio.dialog.servicioHint')"
          >
            <template v-slot:prepend>
              <q-icon name="design_services" color="primary" />
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  {{ t('configuracion.servicios.messages.loadError') }}
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon name="extension" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption v-if="scope.opt.description">
                    {{ scope.opt.description }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!-- App ID -->
        <div class="col-12 col-md-6">
          <label for="app_id">{{ t('configuracion.credencialesServicio.dialog.appId') }}</label>
          <q-input
            v-model="localFormData.credenciales.app_id"
            outlined
            dense
            id="app_id"
            :rules="validationRules.app_id"
            :placeholder="$t('ui.ej-2092889-50d73a')"
          />
        </div>

        <!-- Key -->
        <div class="col-12 col-md-6">
          <label for="key">{{ t('configuracion.credencialesServicio.dialog.key') }}</label>
          <q-input
            v-model="localFormData.credenciales.key"
            outlined
            dense
            id="key"
            :rules="validationRules.key"
            :placeholder="$t('ui.ej-0bc643ef8d66124dac64-fdc449')"
          />
        </div>

        <!-- Secret -->
        <div class="col-12 col-md-6">
          <label for="secret">{{ t('configuracion.credencialesServicio.dialog.secret') }}</label>
          <q-input
            v-model="localFormData.credenciales.secret"
            outlined
            dense
            id="secret"
            :type="showSecret ? 'text' : 'password'"
            :rules="validationRules.secret"
            :placeholder="$t('ui.ej-97c2543c35b16e66b006-6caba8')"
          >
            <template v-slot:append>
              <q-icon
                :name="showSecret ? 'visibility' : 'visibility_off'"
                class="cursor-pointer"
                @click="showSecret = !showSecret"
              />
            </template>
          </q-input>
        </div>

        <!-- Cluster -->
        <div class="col-12 col-md-6">
          <label for="cluster">{{ t('configuracion.credencialesServicio.dialog.cluster') }}</label>
          <q-input
            v-model="localFormData.credenciales.cluster"
            outlined
            dense
            id="cluster"
            :rules="validationRules.cluster"
            :placeholder="$t('ui.ej-sa1-daf135')"
          />
        </div>
      </div>

      <q-card-actions class="flex justify-end q-mt-md">
        <q-btn 
          :label="t('configuracion.credencialesServicio.dialog.cancel')" 
          flat 
          color="negative" 
          @click="$emit('cancel')" 
          :disable="loading"
        />
        <q-btn 
          :label="isEditMode ? t('configuracion.credencialesServicio.dialog.update') : t('configuracion.credencialesServicio.dialog.save')" 
          type="submit" 
          color="primary"
          :loading="loading"
        />
      </q-card-actions>
    </q-form>
  </q-card-section>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCredencialesServicioForm } from 'src/composables/useCredencialesServicioForm'

const { t } = useI18n()

const props = defineProps({
  editing: {
    type: Boolean,
    default: false
  },
  modalValue: {
    type: Object,
    default: () => null
  }
})

const emit = defineEmits(['submit', 'cancel'])

// Use the composable
const {
  formData,
  loading,
  loadingServices,
  availableServices,
  validationRules,
  isEditMode,
  loadServices,
  initializeForm,
  submitForm
} = useCredencialesServicioForm()

// Local reference to form data
const localFormData = formData
const showSecret = ref(false)

// Filtered services for search
const filteredServices = ref([])

// Filter services based on search input
const filterServices = (val, update) => {
  update(() => {
    if (val === '') {
      filteredServices.value = availableServices.value
    } else {
      const needle = val.toLowerCase()
      filteredServices.value = availableServices.value.filter(
        service => service.label.toLowerCase().includes(needle) ||
                   (service.slug && service.slug.toLowerCase().includes(needle))
      )
    }
  })
}

// Initialize form when modalValue changes
watch(
  () => props.modalValue,
  (newValue) => {
    initializeForm(newValue)
  },
  { immediate: true }
)

// Watch for changes in available services
watch(availableServices, (newServices) => {
  filteredServices.value = newServices
})

// Handle form submission
const onSubmit = async () => {
  const result = await submitForm()
  if (result.success) {
    emit('submit', result.data)
  }
}

// Load services on component mount
onMounted(() => {
  loadServices()
})
</script>
