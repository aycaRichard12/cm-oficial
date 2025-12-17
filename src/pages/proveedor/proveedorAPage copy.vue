<template>
  <q-page class="q-pa-md">
    <!-- Header Section -->
    <div class="row justify-between items-center q-mb-md">
      <div>
        <q-btn
          label="Cancelar Registro"
          color="primary"
          @click="toggleForm"
          :icon="formVisible ? 'cancel' : 'add'"
        />
        <q-btn label="Importar de Excel" color="primary" class="q-ml-md" icon="file_upload" />
      </div>

      <div>
        <q-btn label="Imprimir" color="info" icon="picture_as_pdf" @click="generateReport" />
      </div>

      <div>
        <q-input v-model="searchQuery" placeholder="Buscar" dense outlined>
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Registration Form -->
    <q-slide-transition>
      <div v-show="formVisible">
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6">Nuevo Registro</div>

            <q-form @submit="submitForm">
              <div class="row q-col-gutter-md">
                <!-- Hidden Fields -->
                <q-input v-model="formData.ver" type="hidden" />
                <q-input v-model="formData.idempresa" type="hidden" />

                <!-- Visible Fields -->
                <div class="col-md-3">
                  <q-input
                    v-model="formData.nombre"
                    label="Nombre Proveedor*"
                    outlined
                    :rules="[(val) => !!val || 'Campo requerido']"
                  />
                </div>

                <div class="col-md-3">
                  <q-input
                    v-model="formData.codigo"
                    label="Código*"
                    outlined
                    :rules="[(val) => !!val || 'Campo requerido']"
                  />
                </div>

                <div class="col-md-3">
                  <q-input
                    v-model="formData.nit"
                    label="NIT*"
                    outlined
                    :rules="[(val) => !!val || 'Campo requerido']"
                  />
                </div>

                <div class="col-md-3">
                  <q-input v-model="formData.detalle" label="Detalle" outlined />
                </div>

                <div class="col-md-3">
                  <q-input v-model="formData.email" label="Email" outlined type="email" />
                </div>

                <div class="col-md-3">
                  <q-input
                    v-model="formData.direccion"
                    label="Dirección*"
                    outlined
                    :rules="[(val) => !!val || 'Campo requerido']"
                  />
                </div>

                <div class="col-md-3">
                  <q-input v-model="formData.telefono" label="Teléfono" outlined />
                </div>

                <div class="col-md-3">
                  <q-input
                    v-model="formData.movil"
                    label="Móvil*"
                    outlined
                    :rules="[(val) => !!val || 'Campo requerido']"
                  />
                </div>

                <div class="col-md-3">
                  <q-input
                    v-model="formData.pais"
                    label="País*"
                    outlined
                    :rules="[(val) => !!val || 'Campo requerido']"
                  />
                </div>

                <div class="col-md-3">
                  <q-input
                    v-model="formData.ciudad"
                    label="Ciudad*"
                    outlined
                    :rules="[(val) => !!val || 'Campo requerido']"
                  />
                </div>

                <div class="col-md-3">
                  <q-input v-model="formData.zona" label="Zona" outlined />
                </div>

                <div class="col-md-3">
                  <q-input v-model="formData.web" label="Página Web" outlined />
                </div>

                <div class="col-md-3">
                  <q-input v-model="formData.contacto" label="Contacto" outlined />
                </div>

                <div class="col-12 text-center q-mt-md">
                  <q-btn label="Registrar" type="submit" color="primary" />
                </div>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </q-slide-transition>

    <!-- Suppliers Table -->
    <q-table
      :rows="filteredSuppliers"
      :columns="columns"
      row-key="id"
      :pagination="pagination"
      :loading="loading"
      :filter="searchQuery"
      class="my-sticky-table"
    >
      <template v-slot:body-cell-opciones="props">
        <q-td :props="props" class="text-nowrap">
          <q-btn icon="edit" color="info" dense flat @click="editSupplier(props.row)" />
          <q-btn icon="delete" color="negative" dense flat @click="confirmDelete(props.row)" />
        </q-td>
      </template>
    </q-table>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="deleteDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirmar Eliminación</div>
        </q-card-section>

        <q-card-section> ¿Está seguro que desea eliminar este proveedor? </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Eliminar" color="negative" @click="deleteSupplier" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

export default {
  setup() {
    const $q = useQuasar()

    const formVisible = ref(false)
    const searchQuery = ref('')
    const loading = ref(false)
    const deleteDialog = ref(false)
    const supplierToDelete = ref(null)

    const formData = ref({
      ver: 'registrarProveedor',
      idempresa: 'c0c7c76d30bd3dcaefc96f40275bdc0a',
      nombre: '',
      codigo: '',
      nit: '',
      detalle: '',
      email: '',
      direccion: '',
      telefono: '',
      movil: '',
      pais: '',
      ciudad: '',
      zona: '',
      web: '',
      contacto: '',
    })

    const suppliers = ref([
      {
        id: 1,
        nombre: 'Ind_Ferro_odfoadsfdfa',
        codigo: 'Int-001',
        nit: '21215124',
        detalle: 'Fabricación de productosq',
        direccion: 'Av. Paanamericana, salida a Santivañez',
        email: 'julio@icoms.com',
        telefono: '725865566',
        movil: '5917286554',
        ciudad: 'Cercado',
        zona: 'Zona Sud',
        pais: 'Bolivia',
        web: 'www.icoms.coms',
        contacto: 'Carlos Campos',
      },
      // ... other supplier data
    ])

    const columns = [
      { name: 'id', label: 'N°', field: 'id', align: 'center' },
      { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'center' },
      { name: 'codigo', label: 'Código', field: 'codigo', align: 'center' },
      { name: 'nit', label: 'NIT', field: 'nit', align: 'center' },
      { name: 'detalle', label: 'Detalle', field: 'detalle', align: 'center' },
      { name: 'direccion', label: 'Dirección', field: 'direccion', align: 'center' },
      { name: 'email', label: 'Email', field: 'email', align: 'center' },
      { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'center' },
      { name: 'movil', label: 'Movil', field: 'movil', align: 'center' },
      { name: 'ciudad', label: 'Ciudad', field: 'ciudad', align: 'center' },
      { name: 'zona', label: 'Zona', field: 'zona', align: 'center' },
      { name: 'pais', label: 'País', field: 'pais', align: 'center' },
      { name: 'web', label: 'Web', field: 'web', align: 'center' },
      { name: 'contacto', label: 'Contacto', field: 'contacto', align: 'center' },
      { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' },
    ]

    const pagination = ref({
      sortBy: 'nombre',
      descending: false,
      page: 1,
      rowsPerPage: 10,
    })

    const filteredSuppliers = computed(() => {
      if (!searchQuery.value) return suppliers.value

      return suppliers.value.filter((supplier) => {
        return Object.values(supplier).some((value) =>
          String(value).toLowerCase().includes(searchQuery.value.toLowerCase()),
        )
      })
    })

    function toggleForm() {
      formVisible.value = !formVisible.value
    }

    function submitForm() {
      // Form submission logic
      $q.notify({
        message: 'Proveedor registrado exitosamente',
        color: 'positive',
      })

      // Reset form
      formVisible.value = false
      resetForm()
    }

    function resetForm() {
      formData.value = {
        ver: 'registrarProveedor',
        idempresa: 'c0c7c76d30bd3dcaefc96f40275bdc0a',
        nombre: '',
        codigo: '',
        nit: '',
        detalle: '',
        email: '',
        direccion: '',
        telefono: '',
        movil: '',
        pais: '',
        ciudad: '',
        zona: '',
        web: '',
        contacto: '',
      }
    }

    function editSupplier(supplier) {
      formData.value = { ...supplier }
      formVisible.value = true
    }

    function confirmDelete(supplier) {
      supplierToDelete.value = supplier.id
      deleteDialog.value = true
    }

    function deleteSupplier() {
      suppliers.value = suppliers.value.filter((s) => s.id !== supplierToDelete.value)
      deleteDialog.value = false
      $q.notify({
        message: 'Proveedor eliminado exitosamente',
        color: 'positive',
      })
    }

    function generateReport() {
      // PDF generation logic
      $q.notify({
        message: 'Generando reporte...',
        color: 'info',
      })
    }

    return {
      formVisible,
      searchQuery,
      loading,
      deleteDialog,
      formData,
      suppliers,
      columns,
      pagination,
      filteredSuppliers,
      toggleForm,
      submitForm,
      editSupplier,
      confirmDelete,
      deleteSupplier,
      generateReport,
    }
  },
}
</script>

<style scoped>
.my-sticky-table {
  height: calc(100vh - 300px);
}

.q-table__top {
  padding-top: 0;
}
</style>
