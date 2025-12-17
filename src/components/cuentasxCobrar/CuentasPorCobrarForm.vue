<template>
  <div class="q-pa-md">
    <q-form @submit="onSubmit" id="areascuentasporcobrar">
      <q-card-section class="text-h6 text-primary">
        Registro de Pago de Cuenta por Cobrar
      </q-card-section>
      <div class="row q-col-gutter-md">
        <div class="col-md-6 col-sm-12 col-xs-12">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input v-model="formData.cliente" label="Cliente" outlined dense disable />
            </div>
            <div class="col-12">
              <q-input v-model="formData.sucursal" label="Sucursal" outlined dense disable />
            </div>
            <div class="col-md-6 col-sm-12 col-xs-12">
              <q-input v-model="formData.deudatotal" label="Total venta" outlined dense disable>
                <template v-slot:append>
                  <span class="text-grey-7">P$</span>
                </template>
              </q-input>
            </div>
            <div class="col-md-6 col-sm-12 col-xs-12">
              <q-input v-model="formData.saldopendiente" label="Saldo" outlined dense disable>
                <template v-slot:append>
                  <span class="text-grey-7">P$</span>
                </template>
              </q-input>
            </div>
            <div class="col-md-6 col-sm-12 col-xs-12">
              <q-input
                v-model="formData.cobrospendiente"
                label="Cuotas pendiente"
                outlined
                dense
                disable
              />
            </div>
            <div class="col-md-6 col-sm-12 col-xs-12">
              <q-input
                v-model="formData.valorcuotas"
                label="Cuota individual"
                outlined
                dense
                disable
              >
                <template v-slot:append>
                  <span class="text-grey-7">P$</span>
                </template>
              </q-input>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-sm-12 col-xs-12">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="formData.fecha"
                label="Fecha*"
                type="date"
                outlined
                dense
                required
              />
            </div>
            <div class="col-md-6 col-sm-12 col-xs-12">
              <q-input
                v-model="formData.ncuotas"
                label="N°.Cobros*"
                type="number"
                outlined
                dense
                required
                class="validar-entero"
              />
            </div>
            <div class="col-md-6 col-sm-12 col-xs-12">
              <q-input
                v-model="formData.total"
                label="Total a Cobrar*"
                type="number"
                step="0.01"
                outlined
                dense
                required
                class="validar-decimal"
              >
                <template v-slot:append>
                  <span class="text-grey-7">P$</span>
                </template>
              </q-input>
            </div>
            <div class="col-md-6 col-sm-12 col-xs-12">
              <q-input v-model="saldoPorCobrar" label="Saldo por Cobrar" outlined dense disable>
                <template v-slot:append>
                  <span class="text-grey-7">P$</span>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-file
                v-model="formData.comprobante"
                label="Comprobante (.JPG, .JPEG, .PNG)"
                outlined
                dense
                accept=".png, .jpg, .jpeg"
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>
            </div>
          </div>
        </div>
      </div>

      <q-card-actions align="right">
        <q-btn label="Cancelar" flat color="negative" @click="$emit('cancel')" />
        <q-btn label="Guardar" type="submit" color="primary" />
      </q-card-actions>
    </q-form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
// import { useQuasar } from 'quasar'
// import { api } from 'src/boot/axios' // Ajusta la ruta según tu proyecto Quasar
// const $q = useQuasar()

// Define the form data structure using reactive for multiple properties

const props = defineProps({
  editing: Boolean,
  modalValue: Object,
})
const formData = ref({ ...props.modalValue })
// const formData = reactive({
//   ver: 'registroPagoCuentaxCobrar', // Hidden input value
//   idestadocobro: 1753, // Hidden input value
//   cliente: '',
//   sucursal: '',
//   deudatotal: '0.00',
//   saldopendiente: '0.00',
//   cobrospendiente: '',
//   valorcuotas: '0.00',
//   montopago: '0.00', // Hidden input value, assuming it might be dynamically set
//   fecha: '',
//   ncuotas: '',
//   total: '',
//   comprobante: null, // For q-file component
// })

// Computed property for "Saldo por Cobrar"
// Assuming it's `saldopendiente` - `total`
const saldoPorCobrar = computed(() => {
  const saldoPendiente = parseFloat(formData.value.saldopendiente) || 0
  const totalACobrar = parseFloat(formData.value.total) || 0
  const result = saldoPendiente - totalACobrar
  return result.toFixed(2) // Format to two decimal places
})

// Function to handle form submission
const onSubmit = () => {
  console.log('Form Submitted!', formData)

  // Here you would typically send formData to your API
  // Example using Axios (assuming 'api' is configured)
  /*
  import api from 'src/boot/axios'; // Make sure to import if needed

  const payload = new FormData();
  for (const key in formData) {
    if (key === 'comprobante' && formData[key]) {
      payload.append(key, formData[key]); // Append the File object
    } else if (formData[key] !== null && formData[key] !== undefined) {
      payload.append(key, formData[key]);
    }
  }

  try {
    const response = await api.post('/your-api-endpoint', payload, {
      headers: {
        'Content-Type': 'multipart/form-data' // Important for file uploads
      }
    });
    console.log('API Response:', response.data);
    // Handle success notification, reset form, etc.
  } catch (error) {
    console.error('Error submitting form:', error);
    // Handle error notification
  }
  */
}

// You might want to pre-fill the form with data when the component mounts
// or when a specific record is selected.
// This is an example of how you might fetch initial data or set a default date.
onMounted(() => {
  // Set current date as default for the 'fecha' field
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0') // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0')
  formData.value.fecha = `${year}-${month}-${day}`
})
</script>

<style scoped>
/* You can add custom styles here if needed */
/* For example, if you want specific styling for the input group text */
.text-grey-7 {
  color: #757575; /* Quasar's default grey-7 color */
}
/* You can also define custom classes like your original `validar-entero` or `validar-decimal`
   if they had specific visual styles, but Quasar's `type="number"` and `step` handle validation logic */
</style>
