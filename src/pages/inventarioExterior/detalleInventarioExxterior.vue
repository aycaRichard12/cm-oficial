<template>
  <q-card style="min-width: 800px; max-width: 90vw">
    <div class="row col-12 q-mb-md items-center">
      <div class="col-md-8">
        <h4 class="q-ma-none">Detalle de Inventario Externo</h4>
      </div>
      <div class="col-md-4">
        <q-btn label="Salir" color="negative" flat @click="$emit('close')" />
      </div>
    </div>
    <q-card-section v-if="compra.autorizacion == 2">
      <q-form @submit="onSubmit" @reset="onResetForm" class="q-gutter-md">
        <div class="row q-col-gutter-md">
          <div class="col-md-12" style="display: none">
            <q-input type="hidden" name="ver" id="verDINV" v-model="detalleFormData.ver" required />
          </div>
          <div class="col-md-12" style="display: none">
            <q-input
              type="hidden"
              name="idinventarioexterno"
              id="idinvexternoDINV"
              v-model="detalleFormData.idinventarioexterno"
              required
            />
          </div>
          <div class="col-md-12" style="display: none">
            <q-input
              type="hidden"
              name="idproductoalmacen"
              id="idproductoalmacenDINV"
              v-model="detalleFormData.idproductoalmacen"
              required
            />
          </div>
          <div class="col-md-12" style="display: none">
            <q-input type="hidden" name="id" id="idDINV" v-model="detalleFormData.id" />
          </div>

          <div class="col-md-6">
            <q-select
              filled
              v-model="detalleFormData.productos"
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              label="Producto*"
              :options="filteredProductosOptions"
              @filter="filterProductos"
              @update:model-value="selectProductOption"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              required
              :disable="detalleFormData.estado === 1"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey"> No hay resultados </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <div class="col-md-2">
            <q-input
              filled
              type="number"
              name="cantidad"
              id="cantidadDINV"
              v-model="detalleFormData.cantidad"
              label="Cantidad*"
              required
              :disable="detalleFormData.estado === 1"
            />
          </div>

          <div class="col-md-2">
            <q-input
              filled
              type="date"
              name="fecha"
              id="fechaDINV"
              v-model="detalleFormData.fecha"
              label="Fecha*"
              required
              :disable="detalleFormData.estado === 1"
            />
          </div>

          <div class="col-md-2 d-flex items-center" v-if="detalleFormData.estado !== 1">
            <q-btn label="Añadir" type="submit" color="primary" />
          </div>

          <div class="col-md-12 text-center" v-if="detalleFormData.estado !== 1">
            <q-btn
              label="Cancelar"
              type="reset"
              color="negative"
              @click="resetearDetalleFormulario"
              id="atrasform2inventarioexterno-eb160de1de89d9058fcb0b968dbbbd68"
            />
          </div>
        </div>
      </q-form>
    </q-card-section>

    <q-card-section>
      <q-table
        class="q-mt-lg"
        :rows="detalleItems"
        :columns="columnas"
        row-key="id"
        flat
        bordered
        no-data-label="Aún no se han añadido productos a esta compra."
      >
        <template v-slot:body-cell-precio="props">
          <q-td :props="props"> {{ decimas(props.row.precio) }} Bs </q-td>
        </template>

        <template v-slot:body-cell-subtotal="props">
          <q-td :props="props"> {{ (props.row.precio * props.row.cantidad).toFixed(2) }} Bs </q-td>
        </template>

        <template v-slot:body-cell-opciones="props" v-if="compra.autorizacion == 2">
          <q-td align="center">
            <q-btn
              dense
              icon="edit"
              color="primary"
              flat
              @click="iniciarEdicion(props.row)"
              aria-label="Editar"
            />
            <q-btn
              dense
              icon="delete"
              color="negative"
              flat
              @click="confirmarEliminar(props.row)"
              aria-label="Eliminar"
            />
          </q-td>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script setup></script>
