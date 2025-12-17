<template>
  <q-card style="width: 100%">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">REPORTE</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-card-section>
      <div class="invoice overflow-auto">
        <div style="min-width: 600px">
          <header>
            <div class="row">
              <div class="col company-details">
                <h6 class="name">
                  <p><strong>Comercio e Inversiones YF SRL</strong></p>
                </h6>
                <div><strong>Av. Ayacucho N° 218 esq. Gral Achá</strong></div>
                <div><strong>+591 12345678</strong></div>
              </div>

              <div class="col text-center">
                <h6 class="text-center"><strong>PRODUCTOS EN ALMACEN</strong></h6>
                <h6 class="text-center">{{ reportData.warehouseName }}</h6>
              </div>

              <div class="col text-right">
                <img src="logo.png" width="130" height="130" />
              </div>
            </div>
          </header>

          <main>
            <div class="row contacts">
              <div class="col invoice-to">
                <div class="text-grey"><strong>DATOS DEL REPORTE:</strong></div>
                <div class="to text-grey">
                  <strong>Nombre del almacén</strong>: {{ reportData.warehouseName }}
                </div>
                <div class="date"><strong>Fecha de Impresion:</strong> {{ currentDate }}</div>
              </div>
              <div class="col invoice-details">
                <div class="text-grey"><strong>DATOS DEL ENCARGADO:</strong></div>
                <div class="text-grey">Usuario Actual</div>
                <div class="date">Rol del Usuario</div>
              </div>
            </div>

            <q-markup-table separator="cell" class="q-mt-md">
              <thead>
                <tr class="bg-grey-4">
                  <th>N°</th>
                  <th>Código</th>
                  <th>Código barra</th>
                  <th>Categoría</th>
                  <th>Sub categoría</th>
                  <th>Descripción</th>
                  <th>País</th>
                  <th>Unidad</th>
                  <th>Característica</th>
                  <th>Otras características</th>
                  <th>Estado</th>
                  <th>Stock</th>
                  <th>Stock mínimo</th>
                  <th>Stock maximo</th>
                  <th>Fecha registro</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(product, index) in reportData.products" :key="product.id">
                  <td>{{ index + 1 }}</td>
                  <td>{{ product.code }}</td>
                  <td>{{ product.barcode }}</td>
                  <td>{{ product.category }}</td>
                  <td>{{ product.subcategory }}</td>
                  <td>{{ product.description }}</td>
                  <td>{{ product.country }}</td>
                  <td>{{ product.unit }}</td>
                  <td>{{ product.characteristic }}</td>
                  <td>{{ product.otherCharacteristics }}</td>
                  <td>{{ product.status }}</td>
                  <td>{{ product.stock }}</td>
                  <td>{{ product.minStock }}</td>
                  <td>{{ product.maxStock }}</td>
                  <td>{{ product.creationDate }}</td>
                  <td>{{ product.active ? 'Activo' : 'Inactivo' }}</td>
                </tr>
              </tbody>
            </q-markup-table>
          </main>
        </div>
      </div>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Cerrar" color="negative" v-close-popup />
      <q-btn label="Descargar en PDF" color="primary" @click="$emit('download')" />
    </q-card-actions>
  </q-card>
</template>

<script>
import { computed } from 'vue'
import { date } from 'quasar'

export default {
  props: {
    reportData: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const currentDate = computed(() => {
      return date.formatDate(Date.now(), 'DD/MM/YYYY')
    })

    return {
      currentDate,
    }
  },
}
</script>

<style scoped>
.invoice {
  background: #fff;
  border: 1px solid #eee;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
  font-size: 16px;
  line-height: 24px;
  font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
  color: #555;
}

.invoice table {
  width: 100%;
  line-height: inherit;
  text-align: left;
}

.invoice table td {
  padding: 5px;
  vertical-align: top;
}

.invoice table tr td:nth-child(2) {
  text-align: right;
}

.invoice table tr.top table td {
  padding-bottom: 20px;
}

.invoice table tr.top table td.title {
  font-size: 45px;
  line-height: 45px;
  color: #333;
}

.invoice table tr.information table td {
  padding-bottom: 40px;
}

.invoice table tr.heading td {
  background: #eee;
  border-bottom: 1px solid #ddd;
  font-weight: bold;
}

.invoice table tr.details td {
  padding-bottom: 20px;
}

.invoice table tr.item td {
  border-bottom: 1px solid #eee;
}

.invoice table tr.item.last td {
  border-bottom: none;
}

.invoice table tr.total td:nth-child(2) {
  border-top: 2px solid #eee;
  font-weight: bold;
}

@media only screen and (max-width: 600px) {
  .invoice table tr.top table td {
    width: 100%;
    display: block;
    text-align: center;
  }

  .invoice table tr.information table td {
    width: 100%;
    display: block;
    text-align: center;
  }
}
</style>
