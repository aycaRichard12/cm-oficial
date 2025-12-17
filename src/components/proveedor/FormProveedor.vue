<template>
  <q-card>
    <q-form @submit.prevent="onSubmit">
      <q-card-section class="row q-col-gutter-x-md">
        <div class="col-12 col-md-4">
          <label for="nombre">Nombre Proveedor*</label>
          <q-input
            v-model="localData.nombre"
            id="nombre"
            outlined
            dense
            :rules="[(val) => !!val || 'Campo obligatorio']"
          />
        </div>
        <div class="col-12 col-md-2">
          <label for="codigo">Código*</label>

          <q-input
            v-model="localData.codigo"
            id="codigo"
            outlined
            required
            dense
            :rules="[(val) => !!val || 'Campo obligatorio']"
          />
        </div>
        <div class="col-12 col-md-2">
          <label for="nit">NIT*</label>

          <q-input
            v-model="localData.nit"
            id="nit"
            outlined
            required
            dense
            :rules="[(val) => !!val || 'Campo obligatorio']"
          />
        </div>
        <div class="col-12 col-md-4">
          <label for="detalle">Detalle</label>

          <q-input v-model="localData.detalle" id="detalle" outlined dense />
        </div>
        <div class="col-12 col-md-4">
          <label for="email">Email</label>

          <q-input v-model="localData.email" id="email" outlined dense />
        </div>
        <div class="col-12 col-md-4">
          <label for="direccion">Dirección*</label>

          <q-input
            v-model="localData.direccion"
            id="direccion"
            outlined
            required
            dense
            :rules="[(val) => !!val || 'Campo obligatorio']"
          />
        </div>
        <div class="col-12 col-md-2">
          <label for="telefono">Teléfono</label>

          <q-input v-model="localData.telefono" id="telefono" outlined dense />
        </div>
        <div class="col-12 col-md-2">
          <label for="movil">Movil*</label>

          <q-input
            v-model="localData.movil"
            id="movil"
            outlined
            required
            dense
            :rules="[(val) => !!val || 'Campo obligatorio']"
          />
        </div>
        <div class="col-12 col-md-4">
          <label for="pais">País*</label>

          <q-input
            v-model="localData.pais"
            id="pais"
            outlined
            required
            dense
            :rules="[(val) => !!val || 'Campo obligatorio']"
          />
        </div>
        <div class="col-12 col-md-4">
          <label for="ciudad">Ciudad*</label>

          <q-input
            v-model="localData.ciudad"
            id="ciudad"
            outlined
            required
            dense
            :rules="[(val) => !!val || 'Campo obligatorio']"
          />
        </div>
        <div class="col-12 col-md-4">
          <label for="zona">Zona</label>

          <q-input v-model="localData.zona" label="zona" outlined dense />
        </div>
        <div class="col-12 col-md-6">
          <label for="web">Página Web</label>

          <q-input v-model="localData.web" label="web" outlined dense />
        </div>
        <div class="col-12 col-md-6">
          <label for="contacto">Contacto</label>

          <q-input v-model="localData.contacto" label="contacto" outlined dense />
        </div>
      </q-card-section>

      <!-- Hidden inputs -->
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
})
const emit = defineEmits(['submit', 'cancel'])
const localData = ref({ ...props.modalValue })
const onSubmit = () => {
  emit('submit', localData.value)
}
</script>

<style scoped>
.q-form .q-input {
  width: 100%;
}
</style>
