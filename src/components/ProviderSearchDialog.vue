<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">Enviar por WhatsApp</div>
      </q-card-section>

      <q-card-section>
        <q-select
          v-model="selectedProvider"
          :options="filteredProviders"
          use-input
          input-debounce="0"
          @filter="filterProviders"
          option-value="value"
          option-label="label"
          emit-value
          map-options
          clearable
          outlined
          label="Buscar y seleccionar proveedor"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> No hay resultados </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" @click="onDialogCancel" />
        <q-btn flat label="Seleccionar" @click="QonDialogOK" :disable="!selectedProvider" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDialogPluginComponent } from 'quasar'

const props = defineProps({
  providers: {
    type: Array,
    required: true,
  },
})

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const selectedProvider = ref(null)
const filteredProviders = ref([])

// Map providers to the format expected by QSelect and add filterable properties
const allProvidersOptions = computed(() =>
  props.providers.map((p) => ({
    label: `${p.nombre} (${p.telefono})`,
    value: p.telefono.replace(/\D/g, ''),
    filterName: p.nombre.toLowerCase(),
    filterPhone: p.telefono,
  })),
)

const filterProviders = (val, update) => {
  if (val === '') {
    update(() => {
      filteredProviders.value = allProvidersOptions.value
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    filteredProviders.value = allProvidersOptions.value.filter(
      (option) => option.filterName.includes(needle) || option.filterPhone.includes(needle),
    )
  })
}

// Initialize filtered providers on component mount
filterProviders('', () => {}) // Call once to populate

function QonDialogOK() {
  onDialogOK(selectedProvider.value)
}
</script>
