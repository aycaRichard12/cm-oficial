<template>
  <q-page class="q-pa-md">
    <!-- Header Section -->
    <div class="row justify-between items-center q-mb-md">
      <div>
        <q-btn
          :label="$t('ui.cancelar-registro-2dee20')"
          color="primary"
          @click="toggleForm"
          :icon="formVisible ? 'cancel' : 'add'"
        />
        <q-btn :label="$t('ui.importar-de-excel-063de9')" color="primary" class="q-ml-md" icon="file_upload" />
      </div>

      <div>
        <q-btn :label="$t('ui.imprimir-6d7683')" color="info" icon="picture_as_pdf" @click="generateReport" />
      </div>

      <div>
        <q-input v-model="searchQuery" :placeholder="$t('ui.buscar-a62405')" dense outlined>
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
            <div class="text-h6">{{ $t('ui.nuevo-registro-02abe0') }}</div>

            <q-form @submit="submitForm">
              <div class="row q-col-gutter-md">
                <!-- Hidden Fields -->
                <q-input v-model="formData.ver" type="hidden" />
                <q-input v-model="formData.idempresa" type="hidden" />

                <!-- Visible Fields -->
                <div class="col-md-3">
                  <q-input
                    v-model="formData.nombre"
                    :label="$t('ui.nombre-proveedor-a696b4')"
                    outlined
                    :rules="[(val) => !!val || $t('configProducto.estadoProducto.form.required')]"
                  />
                </div>

                <div class="col-md-3">
                  <q-input
                    v-model="formData.codigo"
                    :label="$t('ui.codigo-b30667')"
                    outlined
                    :rules="[(val) => !!val || $t('configProducto.estadoProducto.form.required')]"
                  />
                </div>

                <div class="col-md-3">
                  <q-input
                    v-model="formData.nit"
                    label="NIT*"
                    outlined
                    :rules="[(val) => !!val || $t('configProducto.estadoProducto.form.required')]"
                  />
                </div>

                <div class="col-md-3">
                  <q-input v-model="formData.detalle" :label="$t('ui.detalle-be605b')" outlined />
                </div>

                <div class="col-md-3">
                  <q-input v-model="formData.email" :label="$t('configuracion.servicios.table.email')" outlined type="email" />
                </div>

                <div class="col-md-3">
                  <q-input
                    v-model="formData.direccion"
                    :label="$t('ui.direccion-648431')"
                    outlined
                    :rules="[(val) => !!val || $t('configProducto.estadoProducto.form.required')]"
                  />
                </div>

                <div class="col-md-3">
                  <q-input v-model="formData.telefono" :label="$t('ui.telefono-99af37')" outlined />
                </div>

                <div class="col-md-3">
                  <q-input
                    v-model="formData.movil"
                    :label="$t('ui.movil-3393f9')"
                    outlined
                    :rules="[(val) => !!val || $t('configProducto.estadoProducto.form.required')]"
                  />
                </div>

                <div class="col-md-3">
                  <q-input
                    v-model="formData.pais"
                    :label="$t('ui.pais-923e87')"
                    outlined
                    :rules="[(val) => !!val || $t('configProducto.estadoProducto.form.required')]"
                  />
                </div>

                <div class="col-md-3">
                  <q-input
                    v-model="formData.ciudad"
                    :label="$t('ui.ciudad-35324d')"
                    outlined
                    :rules="[(val) => !!val || $t('configProducto.estadoProducto.form.required')]"
                  />
                </div>

                <div class="col-md-3">
                  <q-input v-model="formData.zona" :label="$t('ui.zona-27288b')" outlined />
                </div>

                <div class="col-md-3">
                  <q-input v-model="formData.web" :label="$t('ui.pagina-web-804748')" outlined />
                </div>

                <div class="col-md-3">
                  <q-input v-model="formData.contacto" :label="$t('ui.contacto-d8a53e')" outlined />
                </div>

                <div class="col-12 text-center q-mt-md">
                  <q-btn :label="$t('ui.registrar-caacc6')" type="submit" color="primary" />
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
          <div class="text-h6">{{ $t('configGeneral.tipoAlmacen.messages.deleteTitle') }}</div>
        </q-card-section>

        <q-card-section> {{ $t('ui.esta-seguro-que-desea-eliminar-este-proveedor-34c94e') }} </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup />
          <q-btn flat :label="$t('common.delete')" color="negative" @click="deleteSupplier" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { t as i18nT } from 'src/i18n/runtime'
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
      { name: 'id', label: i18nT('cotizacion.table.number'), field: 'id', align: 'center' },
      { name: 'nombre', label: i18nT('configGeneral.tipoAlmacen.form.name'), field: 'nombre', align: 'center' },
      { name: 'codigo', label: i18nT('ui.codigo-c35510'), field: 'codigo', align: 'center' },
      { name: 'nit', label: 'NIT', field: 'nit', align: 'center' },
      { name: 'detalle', label: i18nT('ui.detalle-be605b'), field: 'detalle', align: 'center' },
      { name: 'direccion', label: i18nT('ui.direccion-04f478'), field: 'direccion', align: 'center' },
      { name: 'email', label: i18nT('configuracion.servicios.table.email'), field: 'email', align: 'center' },
      { name: 'telefono', label: i18nT('ui.telefono-99af37'), field: 'telefono', align: 'center' },
      { name: 'movil', label: i18nT('ui.movil-c46a8d'), field: 'movil', align: 'center' },
      { name: 'ciudad', label: i18nT('ui.ciudad-c6fbe2'), field: 'ciudad', align: 'center' },
      { name: 'zona', label: i18nT('ui.zona-27288b'), field: 'zona', align: 'center' },
      { name: 'pais', label: i18nT('ui.pais-0c664f'), field: 'pais', align: 'center' },
      { name: 'web', label: i18nT('ui.web-a8323a'), field: 'web', align: 'center' },
      { name: 'contacto', label: i18nT('ui.contacto-d8a53e'), field: 'contacto', align: 'center' },
      { name: 'opciones', label: i18nT('configGeneral.divisas.table.options'), field: 'opciones', align: 'center' },
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
        message: i18nT('ui.proveedor-registrado-exitosamente-75c81a'),
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
        message: i18nT('ui.proveedor-eliminado-exitosamente-01574e'),
        color: 'positive',
      })
    }

    function generateReport() {
      // PDF generation logic
      $q.notify({
        message: i18nT('ui.generando-reporte-f36ceb'),
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
