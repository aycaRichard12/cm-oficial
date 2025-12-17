<template>
  <q-card>
    <q-form @submit.prevent="onSubmit">
      <q-card-section class="row q-col-gutter-x-md">
        <div class="col-12 col-md-4 q-mb-lg">
          <label for="nombre">Razón Social *</label>
          <q-input
            outlined
            v-model="localData.nombre"
            id="nombre"
            dense
            :rules="[(val) => !!val || 'Campo Obligatorio']"
          />
        </div>
        <div class="col-12 col-md-4 q-mb-lg">
          <label for="nomcomercial">Nombre Comercial *</label>
          <q-input
            outlined
            v-model="localData.nombrecomercial"
            id="nomcomercial"
            dense
            :rules="[(val) => !!val || 'Campo Obligatorio']"
          />
        </div>
        <div class="col-12 col-md-4 q-mb-lg">
          <label for="tipocliente">Tipo de Cliente *</label>
          <q-select
            outlined
            dense
            v-model="localData.tipocliente"
            :options="tipoClienteOptions"
            id="tipocliente"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            :rules="[(val) => !!val || 'Seleccione un tipo']"
          />
        </div>
        <div class="col-12 col-md-3 q-mb-lg">
          <label for="canalventa">Canal de venta *</label>
          <q-select
            outlined
            v-model="localData.canalventa"
            :options="canalVentaOptions"
            id="canalventa"
            option-label="label"
            option-value="value"
            dense
            emit-value
            map-options
            :rules="[(val) => !!val || 'Seleccione un canal']"
          />
        </div>
        <div class="col-12 col-md-2 q-mb-lg">
          <label for="tipodoc">Tipo de Documentos *</label>
          <q-select
            outlined
            v-model="localData.tipodocumento"
            :options="tipoDocumetosOptions"
            id="tipodoc"
            dense
            option-label="label"
            option-value="value"
            emit-value
            map-options
            :rules="[(val) => !!val || 'Seleccione un tipo']"
          />
        </div>
        <div class="col-12 col-md-3 q-mb-lg">
          <label for="nrodoc">Nro De Documento</label>
          <q-input
            outlined
            dense
            v-model="localData.nrodocumento"
            id="nrodoc"
            :rules="[(val) => !!val || 'Campo obligatorio']"
          />
        </div>
        <div class="col-12 col-md-4 q-mb-lg">
          <label for="email">Email</label>
          <q-input outlined v-model="localData.email" id="email" dense />
        </div>
        <div class="col-12 col-md-4 q-mb-lg">
          <label for="direccion">Dirección</label>
          <q-input outlined v-model="localData.direccion" id="direccion" dense />
        </div>
        <div class="col-12 col-md-2 q-mb-lg">
          <label for="telefono">Teléfono</label>
          <q-input outlined v-model="localData.telefono" id="telefono" dense />
        </div>
        <div class="col-12 col-md-3 q-mb-lg">
          <label for="movil">Movil *</label>
          <q-input
            outlined
            v-model="localData.movil"
            id="movil"
            dense
            :rules="[(val) => !!val || 'Campo obligatorio']"
          />
        </div>
        <div class="col-12 col-md-3 q-mb-lg">
          <label for="pais">País*</label>
          <q-input
            outlined
            dense
            v-model="localData.pais"
            id="pais"
            :rules="[(val) => !!val || 'Campo obligatorio']"
          />
        </div>
        <div class="col-12 col-md-4 q-mb-lg">
          <label for="ciudad">Ciudad *</label>
          <q-input
            outlined
            dense
            v-model="localData.ciudad"
            id="ciudad"
            :rules="[(val) => !!val || 'Campo obligatorio']"
          />
        </div>
        <div class="col-12 col-md-3 q-mb-lg">
          <label for="zona">Zona</label>
          <q-input outlined v-model="localData.zona" id="zona" dense />
        </div>
        <div class="col-12 col-md-5 q-mb-lg">
          <label for="pagina">Página Web</label>
          <q-input outlined v-model="localData.web" label="pagina" dense />
        </div>
        <div class="col-12 col-md-6 q-mb-lg">
          <label for="contacto">Contacto</label>
          <q-input outlined v-model="localData.contacto" id="contacto" dense />
        </div>
        <div class="col-12 col-md-6 q-mb-lg">
          <label for="detalle">Detalle</label>

          <q-input outlined v-model="localData.detalle" id="detalle" dense />
        </div>
      </q-card-section>

      <q-card-actions class="flex justify-start">
        <q-btn label="Guardar" type="submit" color="primary" />
        <q-btn label="Cancelar" flat color="negative" @click="$emit('cancel')" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>
<script setup>
import { ref } from 'vue'
const props = defineProps({
  editing: Boolean,
  modalValue: Object,
  tipoClienteOptions: Array,
  canalVentaOptions: Array,
  tipoDocumetosOptions: Array,
})
const emit = defineEmits(['submit', 'cancel'])
const localData = ref({ ...props.modalValue })
const onSubmit = () => {
  emit('submit', localData.value)
}
</script>
