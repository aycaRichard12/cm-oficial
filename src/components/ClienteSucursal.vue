<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-x-md">
      <div class="col-12 col-md-8">
        <label for="cliente">Cliente*</label>
        <q-select
          v-model="selectedClient"
          id="cliente"
          dense
          outlined
          :options="filteredClients"
          option-label="label"
          option-value="value"
          use-input
          @filter="filterClientes"
          @update:model-value="handleClientChange"
          :rules="[(val) => !!val || 'Seleccione un cliente']"
          clearable
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> No hay resultados </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <div class="col-12 col-md-4">
        <label for="sucursal">Sucursal*</label>
        <q-select
          v-model="selectedBranch"
          id="sucursal"
          dense
          outlined
          :options="branchOptions"
          option-label="label"
          option-value="value"
          :disable="!selectedClient"
          required
        >
        </q-select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { api } from 'src/boot/axios' // Assuming you have axios configured
import { useQuasar } from 'quasar'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
const idempresa = idempresa_md5()
const emit = defineEmits(['update:client', 'update:branch'])
const props = defineProps({
  client: Object,
  branch: Object,
})

const $q = useQuasar()

const clients = ref([])
const branches = ref([])
const filteredClients = ref([])

const selectedClient = ref(props.client)
const selectedBranch = ref(props.branch)

// Watch for changes in the props and update internal refs
watch(
  () => props.client,
  (newVal) => {
    selectedClient.value = newVal
  },
)

watch(
  () => props.branch,
  (newVal) => {
    selectedBranch.value = newVal
  },
)

watch(selectedClient, (newVal) => {
  emit('update:client', newVal)
})

watch(selectedBranch, (newVal) => {
  emit('update:branch', newVal)
})

const showError = (message, error) => {
  console.error(message, error)
  $q.notify({
    type: 'negative',
    message: message,
    caption: error?.message || 'Ha ocurrido un error',
  })
}

const filterClientes = (val, update) => {
  update(() => {
    const needle = val ? val.toLowerCase().trim() : ''
    if (val === '') {
      filteredClients.value = clients.value
    } else {
      filteredClients.value = clients.value.filter((client) => {
        const clientLabel = (client.label ?? '').toLowerCase().trim()
        const clientNombreComercial = (client.originalData?.nombrecomercial ?? '')
          .toLowerCase()
          .trim()
        return clientLabel.includes(needle) || clientNombreComercial.includes(needle)
      })
    }
  })
}

const branchOptions = computed(() => {
  return selectedClient.value
    ? branches.value.filter((b) => b.clientId === selectedClient.value.value)
    : []
})

const fetchClients = async () => {
  try {
    // Replace with your actual user validation logic
    // For demonstration, let's assume a fixed idempresa or get it from a global store/auth

    if (idempresa) {
      const response = await api.get(`listaCliente/${idempresa}`)
      console.log(response)
      clients.value = response.data.map((cliente) => ({
        label: `${cliente.codigo} - ${cliente.nombre} - ${cliente.nit}`,
        value: cliente.id,
        originalData: cliente,
      }))
      filteredClients.value = clients.value // Initialize filtered clients
    }
  } catch (error) {
    showError('Error al cargar clientes', error)
  }
}

const fetchBranches = async (clientId) => {
  try {
    const { data } = await api.get(`listaSucursal/${clientId}`)
    branches.value = data.map((sucursal) => ({
      label: sucursal.nombre,
      value: sucursal.id,
      clientId: clientId,
    }))
  } catch (error) {
    showError('Error al cargar sucursales', error)
  }
}

const handleClientChange = async (client) => {
  selectedBranch.value = null // Reset branch when client changes
  if (client) {
    await fetchBranches(client.value)
    // Optionally set the first branch as default if desired
    if (branches.value.length > 0) {
      selectedBranch.value = branches.value.find((b) => b.clientId === client.value) || null
    }
  } else {
    branches.value = [] // Clear branches if no client is selected
  }
}

onMounted(() => {
  fetchClients()
})
</script>
