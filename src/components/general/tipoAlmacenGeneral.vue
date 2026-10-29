<template>
  <div class="q-pa-md">
    <!-- Form Section -->
    <q-card class="q-mb-md" v-if="showForm">
      <q-card-section>
        <div class="text-h6">{{ $t('ui.nuevo-registro-02abe0') }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="submitForm">
          <div class="row q-col-gutter-md">
            <!-- Hidden fields -->
            <input type="hidden" name="ver" v-model="formData.ver" />
            <input type="hidden" name="idempresa" v-model="formData.idempresa" />

            <!-- Visible fields -->
            <div class="col-12">
              <q-input
                v-model="formData.nombre"
                :label="$t('ui.tipo-de-almacen-083e60')"
                outlined
                dense
                :rules="[(val) => !!val || $t('configProducto.estadoProducto.form.required')]"
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="formData.descripcion"
                :label="$t('ui.descripcion-del-tipo-de-almacen-4250f1')"
                outlined
                dense
                :rules="[(val) => !!val || $t('configProducto.estadoProducto.form.required')]"
              />
            </div>

            <div class="col-12 text-center">
              <q-btn :label="$t('ui.registrar-caacc6')" type="submit" color="primary" class="q-mt-md" />
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn :label="$t('ui.cancelar-registro-2dee20')" color="negative" @click="toggleForm" flat />
      </q-card-actions>
    </q-card>

    <!-- Table Section -->
    <div class="row table-topper q-mb-md">
      <div class="col flex items-center">
        <q-btn v-if="!showForm" :label="$t('ui.nuevo-registro-02abe0')" color="primary" @click="toggleForm" />
      </div>

      <!-- <div class="col flex items-center justify-end">
        <q-input v-model="search" placeholder="Buscar" dense outlined class="q-ml-md">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div> -->
    </div>

    <q-table
      :rows="filteredRows"
      :columns="columns"
      row-key="id"
      :pagination="pagination"
      :filter="search"
      class="my-sticky-header-table"
    >
      <template v-slot:top-right>
        <q-input
          v-model="search"
          :placeholder="$t('common.search')"
          dense
          outlined
          debounce="300"
          class="q-mb-md"
          style="background-color: var(--cm-surface)"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-btn icon="thumb_up" color="primary" dense @click="changeStatus(props.row)" />
        </q-td>
      </template>

      <template v-slot:body-cell-opciones="props">
        <q-td :props="props" class="text-nowrap">
          <q-btn icon="edit" color="info" dense class="q-mr-sm" @click="editItem(props.row)" />
          <q-btn icon="delete" color="negative" dense @click="deleteItem(props.row)" />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
const $q = useQuasar()
export default {
  setup() {
    const showForm = ref(false)
    const search = ref('')

    const formData = ref({
      ver: 'registrarTipoAlmacen',
      idempresa: 'c0c7c76d30bd3dcaefc96f40275bdc0a',
      nombre: '',
      descripcion: '',
    })

    const rows = ref([
      { id: 83, numero: 1, tipo: 'Generals', descripcion: 'SD', estado: 2 },
      { id: 82, numero: 2, tipo: 'General', descripcion: '12', estado: 2 },
      { id: 80, numero: 3, tipo: 'consumo1', descripcion: '12', estado: 2 },
      { id: 78, numero: 4, tipo: 'eliminar', descripcion: 'weqw', estado: 2 },
      {
        id: 34,
        numero: 5,
        tipo: 'Consumo',
        descripcion: 'Productos o insumos existentes en la fábrica central para industrializacion.',
        estado: 2,
      },
    ])

    const columns = [
      { name: 'numero', label: i18nT('cotizacion.table.number'), field: 'numero', align: 'center' },
      { name: 'tipo', label: i18nT('ui.tipos-3a3df0'), field: 'tipo', align: 'center' },
      { name: 'descripcion', label: i18nT('configuracion.servicios.table.descripcion'), field: 'descripcion', align: 'center' },
      { name: 'estado', label: i18nT('cotizacion.table.status'), field: 'estado', align: 'center' },
      { name: 'opciones', label: i18nT('configGeneral.divisas.table.options'), field: 'opciones', align: 'center' },
    ]

    const pagination = ref({
      rowsPerPage: 10,
    })

    const filteredRows = computed(() => {
      return rows.value.map((row) => ({
        ...row,
        estadoText: row.estado === 2 ? 'Activo' : 'Inactivo',
      }))
    })

    function toggleForm() {
      showForm.value = !showForm.value
      if (!showForm.value) {
        resetForm()
      }
    }

    function resetForm() {
      formData.value = {
        ver: 'registrarTipoAlmacen',
        idempresa: 'c0c7c76d30bd3dcaefc96f40275bdc0a',
        nombre: '',
        descripcion: '',
      }
    }

    function submitForm() {
      // Here you would typically make an API call
      console.log('Form submitted:', formData.value)
      // Add to rows array
      const newId = Math.max(...rows.value.map((r) => r.id)) + 1
      rows.value.unshift({
        id: newId,
        numero: rows.value.length + 1,
        tipo: formData.value.nombre,
        descripcion: formData.value.descripcion,
        estado: 2,
      })
      toggleForm()
    }

    function editItem(item) {
      showForm.value = true
      formData.value = {
        ver: 'actualizarTipoAlmacen',
        idempresa: 'c0c7c76d30bd3dcaefc96f40275bdc0a',
        nombre: item.tipo,
        descripcion: item.descripcion,
        id: item.id,
      }
    }

    function deleteItem(item) {
      // Confirm before deleting
      confirmDelete(item)
    }

    function confirmDelete(item) {
      $q.dialog({
        title: i18nT('configGeneral.divisas.messages.deleteTitle'),
        message: `¿Estás seguro de eliminar el tipo de almacén "${item.tipo}"?`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        rows.value = rows.value.filter((r) => r.id !== item.id)
        // Here you would typically make an API call to delete
      })
    }

    function changeStatus(item) {
      item.estado = item.estado === 2 ? 0 : 2
      // Here you would typically make an API call to update status
    }

    return {
      showForm,
      search,
      formData,
      columns,
      rows,
      filteredRows,
      pagination,
      toggleForm,
      submitForm,
      editItem,
      deleteItem,
      changeStatus,
    }
  },
}
</script>

<style>
.my-sticky-header-table {
  height: calc(100vh - 300px);
}

.table-topper {
  margin-bottom: 16px;
}
</style>
