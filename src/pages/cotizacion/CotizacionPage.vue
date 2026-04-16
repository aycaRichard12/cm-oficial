<template>
  <q-page class="q-pa-lg bg-fondo" style="min-height: 100vh">
    <!-- Encabezado de la Página -->
    <div class="row items-center q-mb-lg animate__animated animate__fadeInDown">
      <div class="col-12 flex items-center">
        <div class="q-pa-md bg-white rounded-borders q-mr-md shadow-2" style="border-radius: 12px">
          <q-icon name="request_quote" size="36px" color="primary" />
        </div>
        <div>
          <h1
            class="text-h4 text-weight-bolder q-my-none text-primary"
            style="letter-spacing: -0.5px"
          >
            Emisión de Cotización
          </h1>
          <div class="text-subtitle1 text-grey-7 q-mt-xs">
            Registre los detalles de la nueva cotización y añada productos
          </div>
        </div>
      </div>
    </div>

    <!-- Primera Sección: Datos Generales (Card) -->
    <q-card
      class="my-card q-mb-xl shadow-3"
      style="border-radius: 16px; overflow: hidden; border: 1px solid rgba(0, 0, 0, 0.05)"
    >
      <q-card-section
        class="bg-primary text-white q-py-md q-px-lg flex justify-between items-center"
        style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%)"
      >
        <div class="flex items-center">
          <q-icon name="manage_accounts" size="sm" class="q-mr-sm" />
          <div class="text-subtitle1 text-weight-bold" style="font-family: 'Inter', sans-serif">
            Datos del Cliente y Configuración
          </div>
        </div>

        <!-- Toggle Venta sin Stock incorporado al header para ahorrar espacio y lucir elegante -->
        <div
          class="flex items-center bg-white text-primary q-px-sm q-py-xs shadow-2"
          style="border-radius: 20px"
          id="ventaSinStockCotizacion"
        >
          <q-icon name="inventory_2" size="xs" class="q-mr-xs" />
          <div class="text-caption text-weight-bold q-mr-sm">Venta sin stock</div>
          <q-btn
            :icon="permitirStock ? 'toggle_on' : 'toggle_off'"
            dense
            flat
            :color="permitirStock ? 'positive' : 'grey'"
            size="md"
            :title="permitirStock ? 'Desactivar venta sin stock' : 'Activar venta sin stock'"
            @click="permitirStockvacio()"
            class="q-pa-none"
            style="transition: all 0.3s"
          />
        </div>
      </q-card-section>

      <q-card-section class="q-pa-lg">
        <!-- Sección: Datos del cliente -->
        <q-form ref="formClientes" class="q-mb-md">
          <div class="row q-col-gutter-lg q-mb-md">
            <div class="col-12 col-md-3" id="tipoOperacionCotizacion">
              <label
                class="text-weight-bold text-grey-9 q-mb-sm block"
                style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px"
                for="tipooperacion"
                >Tipo de Operación <span class="text-negative">*</span></label
              >
              <q-select
                v-model="tipoOperacion"
                :options="optionOperacion"
                id="tipooperacion"
                map-options
                :rules="[(val) => !!val || 'Campo requerido']"
                @update:model-value="handleTipoOperacionChange"
                outlined
                dense
                bg-color="white"
                hide-bottom-space
                class="premium-input"
              />
            </div>
            <div class="col-12 col-md-3" id="fechaCotizacion">
              <label
                class="text-weight-bold text-grey-9 q-mb-sm block"
                style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px"
                for="fecha"
                >Fecha <span class="text-negative">*</span></label
              >
              <q-input
                v-model="fecha"
                id="fecha"
                type="date"
                map-options
                :rules="[(val) => !!val || 'Campo requerido']"
                @update:model-value="cambioFecha"
                outlined
                dense
                bg-color="white"
                hide-bottom-space
                class="premium-input"
              />
            </div>
            <div class="col-12 col-md-6" id="clienteCotizacion">
              <label
                class="text-weight-bold text-grey-9 q-mb-sm block"
                style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px"
                for="cliente"
                >Cliente <span class="text-negative">*</span></label
              >
              <div class="row no-wrap">
                <q-select
                  class="col premium-input"
                  v-model="selectedClient"
                  use-input
                  hide-selected
                  fill-input
                  input-debounce="0"
                  id="cliente"
                  :options="filteredClients"
                  @filter="filterClient"
                  @input-value="setClientInputValue"
                  @update:model-value="elegirUnCliente"
                  option-value="id"
                  option-label="display"
                  :rules="[(val) => !!val || 'Campo requerido']"
                  outlined
                  dense
                  bg-color="white"
                  hide-bottom-space
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey"> No hay resultados </q-item-section>
                    </q-item>
                  </template>
                </q-select>
                <div class="q-ml-md" id="botonRegistrarCliente">
                  <q-btn
                    color="primary"
                    unelevated
                    class="full-height shadow-2"
                    style="border-radius: 8px; width: 44px"
                    icon="person_add"
                    @click="RegistrarCliente"
                  >
                    <q-tooltip class="bg-primary text-caption shadow-4"
                      >Registrar Nuevo Cliente</q-tooltip
                    >
                  </q-btn>
                </div>
              </div>
              <input type="hidden" v-model="idclienteCO" name="idcliente" />
            </div>
          </div>
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-6" id="sucursalCotizacion">
              <label
                class="text-weight-bold text-grey-9 q-mb-sm block"
                style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px"
                for="sucursal"
                >Sucursal <span class="text-negative">*</span></label
              >
              <q-select
                v-model="selectedSucursal"
                use-input
                hide-selected
                fill-input
                input-debounce="0"
                id="sucursal"
                :options="filteredSucursales"
                @filter="filterSucursal"
                @input-value="setSucursalInputValue"
                @update:model-value="elegirUnaSucursal"
                option-value="id"
                option-label="nombre"
                :rules="[(val) => !!val || 'Campo requerido']"
                outlined
                dense
                bg-color="white"
                hide-bottom-space
                class="premium-input"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey"> No hay resultados </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <input type="hidden" v-model="idsucursalCOS" name="idsucursal" />
            </div>
          </div>
          <ModalfirmaPage
            v-model="modalfirmaActivo"
            :id-entidad="selectedClient"
            tipo-operacion="CLIENTE"
            @onSuccess="alTerminarFirma"
            @onError="alFallarFirma"
          />
        </q-form>

        <q-separator class="q-my-xl bg-grey-3" style="height: 2px" />

        <!-- Sección: Configuración inicial -->
        <q-form ref="cotizacionFormRef">
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-4" id="almacenCotizacion">
              <label
                class="text-weight-bold text-grey-9 q-mb-sm block"
                style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px"
                for="almacen"
                >Almacén origen <span class="text-negative">*</span></label
              >
              <q-select
                v-model="filtroAlmacenCO"
                :options="almacenesOptions"
                id="almacen"
                emit-value
                map-options
                option-value="idalmacen"
                option-label="almacen"
                :rules="[(val) => !!val || 'Campo requerido']"
                @update:model-value="listaCategoria"
                outlined
                dense
                bg-color="white"
                hide-bottom-space
                class="premium-input"
              />
            </div>
            <div class="col-12 col-md-4" id="categoriaCotizacion">
              <label
                class="text-weight-bold text-grey-9 q-mb-sm block"
                style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px"
                for="categoria"
                >Categoría de precio <span class="text-negative">*</span></label
              >
              <q-select
                v-model="filtroCategoriaCO"
                :options="categoriasOptions"
                id="categoria"
                emit-value
                map-options
                option-value="id"
                option-label="nombre"
                :rules="[(val) => !!val || 'Campo requerido']"
                outlined
                dense
                bg-color="white"
                hide-bottom-space
                class="premium-input"
              />
            </div>
            <div class="col-12 col-md-4" id="puntoVentaCotizacion">
              <label
                class="text-weight-bold text-grey-9 q-mb-sm block"
                style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px"
                for="puntoventa"
                >Punto Venta <span class="text-negative">*</span></label
              >
              <q-select
                v-model="puntoVenta"
                :options="puntosVenta"
                id="puntoventa"
                emit-value
                map-options
                option-value="value"
                option-label="label"
                :rules="[(val) => !!val || 'Campo requerido']"
                outlined
                dense
                bg-color="white"
                hide-bottom-space
                class="premium-input"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <!-- Segunda Sección: Añadir Productos -->
    <q-card
      class="my-card q-mb-xl shadow-3"
      style="border-radius: 16px; overflow: hidden; border: 1px solid rgba(0, 0, 0, 0.05)"
    >
      <q-card-section
        class="bg-secondary text-white q-py-md q-px-lg flex items-center"
        style="background: linear-gradient(135deg, #26a69a 0%, #00897b 100%)"
      >
        <q-icon name="shopping_cart_checkout" size="sm" class="q-mr-sm" />
        <div class="text-subtitle1 text-weight-bold" style="font-family: 'Inter', sans-serif">
          Añadir Productos
        </div>
      </q-card-section>

      <q-card-section class="q-pa-lg bg-grey-1" style="border-bottom: 1px solid #e0e0e0">
        <div class="row q-col-gutter-lg items-end">
          <div class="col-12 col-md-6" id="productoCotizacion">
            <div class="flex justify-between items-center q-mb-sm">
              <label
                class="text-weight-bold text-grey-9 block"
                style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px"
                for="producto"
                >Producto o Servicio <span class="text-negative">*</span></label
              >
              <q-checkbox
                v-if="esProductoUnico"
                v-model="registrarComoProductoUnico"
                size="xs"
                label="Producto Único"
                color="secondary"
                class="text-caption text-weight-bold text-secondary q-mb-none"
              />
            </div>
            <q-select
              id="producto"
              v-model="selectedProduct"
              :options="filteredProducts"
              option-value="id"
              option-label="display"
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              outlined
              dense
              bg-color="white"
              class="premium-input"
              @filter="filterProduct"
              @input-value="setProductInputValue"
              @update:model-value="elegirUnProducto"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey"> No hay resultados </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-2" id="cantidadCotizacion">
            <label
              class="text-weight-bold text-grey-9 q-mb-sm block"
              style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px"
              for="cantidad"
              >Cantidad <span class="text-negative">*</span></label
            >
            <q-input
              id="cantidad"
              v-model.number="cantidadCO"
              type="number"
              :rules="[(val) => val > 0 || 'Debe ser mayor a 0']"
              :readonly="esProductoUnico && registrarComoProductoUnico"
              required
              outlined
              dense
              bg-color="white"
              hide-bottom-space
              class="premium-input text-center"
            />
          </div>

          <div class="col-12 col-md-3" id="precioCotizacion">
            <label
              class="text-weight-bold text-grey-9 q-mb-sm block"
              style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px"
              for="precio"
              >Precio unitario <span class="text-negative">*</span></label
            >
            <q-input
              id="precio"
              v-model.number="precioCO"
              type="number"
              :rules="[(val) => val > 0 || 'Debe ser mayor a 0']"
              required
              outlined
              dense
              bg-color="white"
              hide-bottom-space
              class="premium-input"
            >
              <template v-slot:append>
                <div
                  class="bg-grey-2 text-primary text-weight-bolder text-subtitle2 q-px-sm rounded-borders"
                  style="height: 28px; line-height: 28px"
                >
                  {{ divisaActiva.tipo }}
                </div>
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-1 flex justify-center" id="botonAnadirProductoCotizacion">
            <q-btn
              icon="add_shopping_cart"
              color="secondary"
              unelevated
              class="full-width shadow-3"
              style="border-radius: 12px; height: 40px; transition: all 0.3s"
              :disable="!canAddProduct"
              @click="anadirProductoACarrito"
            >
              <q-tooltip
                class="bg-secondary text-subtitle2 shadow-4"
                anchor="top middle"
                self="bottom middle"
                >Añadir al carrito</q-tooltip
              >
            </q-btn>
          </div>
        </div>

        <UniqueProductSelector
          :product-id="idproductoalmacenCO"
          :is-unique="esProductoUnico && registrarComoProductoUnico"
          :cantidad-requerida="cantidadCO"
          @update:selection="(codigos) => guardarCodigosEnVenta(codigos)"
          class="q-mt-md"
        />
      </q-card-section>

      <!-- Tercera Sección: Resumen de cotización (Table inside the same parent or separate) -->
      <q-card-section
        class="bg-white q-py-sm q-px-lg flex items-center justify-between"
        style="border-bottom: 1px solid #e0e0e0"
      >
        <div class="flex items-center text-primary">
          <q-icon name="receipt_long" size="sm" class="q-mr-sm" />
          <div class="text-subtitle1 text-weight-bold" style="font-family: 'Inter', sans-serif">
            Resumen de Cotización
          </div>
        </div>
      </q-card-section>

      <q-table
        id="tablaResumenCotizacion"
        :rows="carritoCO.listaProductos"
        :columns="carritoColumns"
        row-key="idproductoalmacen"
        flat
        hide-bottom
        class="custom-table q-pt-md"
        table-header-class="bg-grey-1 text-weight-bolder text-grey-9 text-uppercase"
        :pagination="{ rowsPerPage: 0 }"
      >
        <template v-slot:body="props">
          <q-tr
            :props="props"
            :class="props.expand ? 'bg-blue-50' : 'hover-row'"
            style="transition: background 0.3s"
          >
            <q-td auto-width>
              <q-btn
                v-if="props.row.codigosUnicos?.length > 0"
                size="sm"
                color="primary"
                flat
                round
                @click="props.expand = !props.expand"
                :icon="props.expand ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
              />
            </q-td>

            <q-td key="num" :props="props" class="text-left">
              <q-chip
                color="grey-2"
                text-color="grey-9"
                label-slot
                dense
                square
                style="border-radius: 6px; border: 1px solid #e0e0e0"
              >
                <span class="text-weight-bolder">{{ props.row.num }}</span>
              </q-chip>
            </q-td>
            <q-td key="codigo" :props="props" class="text-left">
              <q-chip
                outline
                color="primary"
                label-slot
                dense
                square
                style="border-radius: 6px; font-weight: 600"
              >
                {{ props.row.codigo }}
              </q-chip>
            </q-td>

            <q-td key="descripcion" :props="props" style="vertical-align: middle">
              <div
                class="text-weight-bolder text-grey-10 text-subtitle2"
                style="font-family: 'Inter', sans-serif"
              >
                {{ props.row.descripcion }}
              </div>

              <div
                class="flex items-center text-primary cursor-pointer q-mt-xs"
                style="
                  font-size: 0.85em;
                  padding: 4px 10px;
                  background: rgba(25, 118, 210, 0.08);
                  border-radius: 6px;
                  display: inline-flex;
                  border: 1px dashed rgba(25, 118, 210, 0.3);
                  transition: all 0.2s;
                "
                v-ripple
              >
                <q-icon name="edit_note" size="16px" class="q-mr-xs" />
                <span class="text-weight-medium">{{
                  props.row.descripcionAdicional || 'Añadir nota adicional...'
                }}</span>

                <q-popup-edit
                  v-model="props.row.descripcionAdicional"
                  v-slot="scope"
                  buttons
                  label-set="Guardar"
                  label-cancel="Cancelar"
                >
                  <q-input
                    v-model="scope.value"
                    outlined
                    dense
                    autofocus
                    counter
                    @keyup.enter="validarDescripcion(scope, props.row)"
                  />
                </q-popup-edit>
              </div>
            </q-td>

            <q-td key="cantidad" :props="props" class="text-right">
              <q-badge
                color="secondary"
                text-color="white"
                label-slot
                class="q-px-md q-py-xs text-weight-bolder text-subtitle2 shadow-1"
                style="border-radius: 8px"
              >
                {{ props.row.cantidad }}
              </q-badge>
            </q-td>

            <q-td key="precio" :props="props" class="text-right text-weight-bold text-subtitle2">
              {{ decimas(props.row.precio) }}
              <span class="text-caption text-grey-5 q-ml-xs text-weight-regular">{{
                divisaActiva.tipo
              }}</span>
            </q-td>

            <q-td
              key="total"
              :props="props"
              class="text-right text-weight-bolder text-primary text-subtitle1"
            >
              {{ decimas(props.row.cantidad * props.row.precio) }}
              <span class="text-caption text-grey-5 q-ml-xs text-weight-regular">{{
                divisaActiva.tipo
              }}</span>
            </q-td>

            <q-td key="options" :props="props" class="text-center">
              <q-btn
                icon="delete_outline"
                color="negative"
                flat
                round
                dense
                size="sm"
                @click="eliminarProductoCarrito(props.row.idproductoalmacen)"
                class="hover-shake"
              >
                <q-tooltip class="bg-negative text-weight-medium shadow-3"
                  >Quitar producto</q-tooltip
                >
              </q-btn>
            </q-td>
          </q-tr>

          <q-tr v-show="props.expand" :props="props" class="expanded-row bg-blue-50">
            <q-td colspan="100%" class="q-pa-lg">
              <TableCodigosUnicos
                v-model="props.row.codigosUnicos"
                :parent-row="props.row"
                :can-delete="true"
                :can-edit="true"
                :api-mode="false"
                @update-parent-quantity="
                  (nuevaCant) => {
                    props.row.cantidad = nuevaCant
                    calcularTotalesCarrito()
                  }
                "
              />
            </q-td>
          </q-tr>
        </template>

        <template v-slot:bottom-row>
          <q-tr class="bg-grey-1">
            <q-td
              colspan="6"
              class="text-right text-subtitle2 text-grey-8"
              style="letter-spacing: 0.5px"
              >SUBTOTAL:</q-td
            >
            <q-td class="text-right text-subtitle1 text-grey-10 text-weight-bolder">
              {{ decimas(carritoCO.subtotal) }}
              <span class="text-caption text-grey-6 text-weight-medium">{{
                divisaActiva.tipo
              }}</span>
            </q-td>
            <q-td />
          </q-tr>

          <q-tr class="bg-grey-1" id="descuentoCotizacion">
            <q-td
              colspan="6"
              class="text-right text-subtitle2 text-grey-8"
              style="vertical-align: middle; letter-spacing: 0.5px"
              >DESCUENTO:</q-td
            >
            <q-td class="text-right">
              <q-input
                v-model.number="carritoCO.descuento"
                type="number"
                min="0"
                :max="carritoCO.subtotal"
                @change="aplicarDescuento"
                dense
                outlined
                bg-color="white"
                input-class="text-right text-weight-bolder text-negative"
                style="max-width: 140px; margin-left: auto"
                class="premium-input"
              >
                <template v-slot:append>
                  <div
                    class="bg-negative text-white text-weight-bold text-caption q-px-sm rounded-borders"
                    style="height: 24px; line-height: 24px"
                  >
                    {{ divisaActiva.tipo }}
                  </div>
                </template>
              </q-input>
            </q-td>
            <q-td />
          </q-tr>

          <q-tr
            class="bg-primary text-white"
            style="background: linear-gradient(90deg, #1976d2 0%, #1e88e5 100%)"
          >
            <q-td
              colspan="6"
              class="text-right text-h6 text-weight-bolder text-uppercase"
              style="letter-spacing: 1px"
              >TOTAL GENERAL:</q-td
            >
            <q-td
              class="text-right text-h5 text-weight-bolder"
              style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2)"
            >
              {{ decimas(carritoCO.ventatotal) }}
              <span class="text-subtitle1 text-white text-weight-medium" style="opacity: 0.9">{{
                divisaActiva.tipo
              }}</span>
            </q-td>
            <q-td />
          </q-tr>
        </template>
      </q-table>

      <q-card-section class="bg-grey-2 q-pa-lg" style="border-top: 1px solid #e0e0e0">
        <div class="row justify-end items-center q-gutter-x-lg">
          <q-btn
            outline
            color="primary"
            icon="draw"
            @click="RegistrarFirma"
            label="Firma del Cliente"
            class="q-px-lg bg-white shadow-1"
            style="border-radius: 8px; font-weight: 600"
          />
          <q-btn
            label="Registrar Cotización"
            color="primary"
            icon="task_alt"
            size="lg"
            :disable="carritoCO.listaProductos.length === 0"
            @click="cotizacion_proforma"
            class="q-px-xl text-weight-bolder shadow-4"
            style="
              border-radius: 12px;
              background: linear-gradient(45deg, #1976d2, #42a5f5);
              transition: transform 0.2s;
            "
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Diálogo: metodo de pago -->
    <q-dialog v-model="modalmetodopago" backdrop-filter="blur(4px)">
      <q-card
        class="responsive-dialog shadow-10"
        style="min-width: 500px; max-width: 750px; border-radius: 16px; overflow: hidden"
      >
        <q-card-section
          class="bg-primary text-white q-py-md flex justify-between items-center"
          style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%)"
        >
          <div class="flex items-center">
            <div class="bg-white q-pa-xs rounded-borders q-mr-md shadow-1">
              <q-icon name="payments" class="text-primary" size="24px" />
            </div>
            <span class="text-h6 text-weight-bold" style="font-family: 'Inter', sans-serif"
              >Método de Pago</span
            >
          </div>
          <q-btn
            icon="close"
            v-close-popup
            flat
            round
            dense
            class="bg-white text-primary shadow-1"
            size="sm"
          />
        </q-card-section>

        <q-card-section class="q-pt-xl q-pb-lg bg-grey-1">
          <div class="row justify-center q-mb-xl">
            <q-btn-toggle
              v-model="carritoCO.credito"
              toggle-color="primary"
              color="white"
              text-color="primary"
              unelevated
              rounded
              padding="10px 40px"
              class="shadow-3 text-weight-bolder"
              style="border: 1px solid #e0e0e0; font-family: 'Inter', sans-serif"
              @update:model-value="handleTipoPagoGeneralChange"
              :options="[
                { label: 'Pago Efectivo', value: false, icon: 'payments' },
                { label: 'Pago a Crédito', value: true, icon: 'credit_score' },
              ]"
            />
          </div>

          <!-- SECCIÓN EFECTIVO -->
          <div v-if="!carritoCO.credito" class="animate__animated animate__fadeIn">
            <div
              class="text-subtitle1 text-weight-bold q-mb-lg text-primary flex items-center q-px-md bg-blue-50 q-py-sm rounded-borders shadow-1"
              style="width: fit-content; border-left: 4px solid #1976d2"
            >
              MODALIDAD: EFECTIVO
            </div>

            <div class="q-gutter-x-xl q-mb-xl row justify-center">
              <q-radio
                v-model="variablePago"
                val="directo"
                color="positive"
                label="Pago Único"
                class="text-weight-bolder text-subtitle2"
              >
              </q-radio>
              <q-radio
                v-model="variablePago"
                val="dividido"
                color="orange-8"
                label="Pago Dividido"
                class="text-weight-bolder text-subtitle2"
              >
              </q-radio>
            </div>

            <div v-if="variablePago === 'directo'" class="row q-col-gutter-lg q-pt-sm">
              <div class="col-12">
                <label
                  for="metodopago"
                  class="text-weight-bold text-grey-9 q-mb-sm block"
                  style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px"
                  >Método de pago <span class="text-negative">*</span></label
                >
                <q-select
                  v-model="metodoPago"
                  id="metodopago"
                  dense
                  outlined
                  bg-color="white"
                  :options="metodosPagos"
                  option-label="label"
                  option-value="value"
                  :rules="[(val) => !!val || 'Seleccione un método de pago']"
                  class="premium-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="account_balance_wallet" color="primary" />
                  </template>
                </q-select>
              </div>
            </div>

            <div v-else-if="variablePago === 'dividido'" class="q-pt-sm">
              <div
                v-for="(payment, index) in pagosDivididos"
                :key="index"
                class="row q-col-gutter-md q-mb-md items-start bg-white q-pa-sm shadow-1 rounded-borders"
                style="border: 1px solid #eee"
              >
                <div class="col-12 col-md-5">
                  <label class="text-weight-bold text-grey-9 q-mb-xs block text-caption"
                    >Método <span class="text-negative">*</span></label
                  >
                  <q-select
                    v-model="payment.metodoPago"
                    dense
                    outlined
                    bg-color="grey-1"
                    :options="metodosPagos"
                    option-label="label"
                    option-value="value"
                    :rules="[(val) => !!val || 'Requerido']"
                    hide-bottom-space
                  />
                </div>
                <div class="col-12 col-md-3">
                  <label class="text-weight-bold text-grey-9 q-mb-xs block text-caption"
                    >Monto ({{ divisaActiva.tipo }})</label
                  >
                  <q-input
                    v-model="payment.monto"
                    type="number"
                    min="0"
                    step="0.01"
                    dense
                    outlined
                    bg-color="grey-1"
                    @update:model-value="calculateRemainingAmount(index)"
                    :rules="[(val) => !!val || 'Requerido']"
                    hide-bottom-space
                  />
                </div>
                <div class="col-12 col-md-3">
                  <label class="text-weight-bold text-grey-9 q-mb-xs block text-caption"
                    >Porcentaje (%)</label
                  >
                  <q-input
                    v-model="payment.porcentaje"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    dense
                    outlined
                    bg-color="grey-1"
                    @update:model-value="calculateAmountFromPercentage(index)"
                    :rules="[(val) => !!val || 'Requerido']"
                    hide-bottom-space
                  />
                </div>
                <div class="col-12 col-md-1 flex flex-center" style="padding-top: 26px">
                  <q-btn
                    v-if="pagosDivididos.length > 1"
                    icon="close"
                    color="negative"
                    flat
                    round
                    size="sm"
                    class="bg-red-1"
                    @click="removePaymentMethod(index)"
                  />
                </div>
              </div>

              <div class="flex justify-end q-mt-md">
                <q-btn
                  label="Agregar Otro Pago"
                  icon="add"
                  color="positive"
                  outline
                  dense
                  class="q-px-md bg-white shadow-1 text-weight-bold"
                  style="border-radius: 8px"
                  @click="addPaymentMethod"
                />
              </div>

              <q-banner
                v-if="remainingAmount !== 0"
                dense
                rounded
                class="bg-orange-1 text-orange-10 q-mt-lg shadow-2 text-weight-bold"
                style="border-left: 4px solid #f57f17"
              >
                <template v-slot:avatar>
                  <q-icon name="warning" color="warning" size="md" />
                </template>
                <div class="row q-col-gutter-x-xl text-subtitle2">
                  <div>
                    <span class="text-grey-8 text-caption uppercase block">Total Pagado:</span>
                    <span class="text-h6">{{ totalPaidAmount.toFixed(2) }}</span>
                  </div>
                  <div>
                    <span class="text-grey-8 text-caption uppercase block">Monto Restante:</span>
                    <span class="text-h6">{{ remainingAmount.toFixed(2) }}</span>
                  </div>
                </div>
              </q-banner>
            </div>
            <div
              v-if="!carritoCO.credito"
              class="col-12 col-md-6 animate__animated animate__zoomIn"
            >
              <label
                for="cajaBanco"
                class="text-weight-bold text-grey-9 q-mb-sm block"
                style="font-size: 13px; text-transform: uppercase"
                >Seleccione Caja o Banco <span class="text-negative">*</span></label
              >
              <q-select
                v-model="idcajaBancoSeleccionada"
                :options="listaCajaBancos"
                id="cajaBanco"
                dense
                outlined
                bg-color="white"
                emit-value
                map-options
                class="premium-input"
                hide-bottom-space
                :rules="[(val) => !!val || 'Campo requerido']"
              >
                <template v-slot:prepend>
                  <q-icon name="account_balance" color="positive" />
                </template>
              </q-select>
            </div>
          </div>

          <!-- SECCIÓN CRÉDITO -->
          <div v-else class="animate__animated animate__fadeIn">
            <div
              class="text-subtitle1 text-weight-bold q-mb-lg text-primary flex items-center q-px-md bg-blue-50 q-py-sm rounded-borders shadow-1"
              style="width: fit-content; border-left: 4px solid #1976d2"
            >
              MODALIDAD: CRÉDITO
            </div>
            <div class="row q-col-gutter-lg q-px-sm">
              <div class="col-12 col-md-6">
                <label
                  for="cantidadpagos"
                  class="text-weight-bold text-grey-9 q-mb-sm block"
                  style="font-size: 13px; text-transform: uppercase"
                  >Cantidad de pagos <span class="text-negative">*</span></label
                >
                <q-input
                  v-model="carritoCO.cantidadPagos"
                  id="cantidadpagos"
                  type="number"
                  min="1"
                  dense
                  outlined
                  bg-color="white"
                  class="premium-input"
                  @update:model-value="(calculatePayments(), calculateDueDate())"
                  :rules="[(val) => !!val || 'Requerido']"
                >
                  <template v-slot:prepend>
                    <div class="bg-blue-1 q-pa-xs rounded-borders">
                      <q-icon name="format_list_numbered" color="primary" />
                    </div>
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <label
                  for="montopago"
                  class="text-weight-bold text-grey-9 q-mb-sm block"
                  style="font-size: 13px; text-transform: uppercase"
                  >Monto por pago <span class="text-negative">*</span></label
                >
                <q-input
                  v-model="carritoCO.montoPagos"
                  id="montopago"
                  dense
                  outlined
                  readonly
                  class="bg-grey-2"
                  input-class="text-weight-bolder text-primary text-subtitle1"
                >
                  <template v-slot:prepend>
                    <q-icon name="paid" color="grey-6" />
                  </template>
                  <template v-slot:append>
                    <span class="text-subtitle2 text-grey-7 text-weight-bold">{{
                      divisaActiva.tipo
                    }}</span>
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <label
                  for="periodo"
                  class="text-weight-bold text-grey-9 q-mb-sm block"
                  style="font-size: 13px; text-transform: uppercase"
                  >Frecuencia <span class="text-negative">*</span></label
                >
                <q-select
                  v-model="carritoCO.periodo"
                  id="periodo"
                  dense
                  outlined
                  bg-color="white"
                  class="premium-input"
                  :options="periodOptions"
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  @update:model-value="calculateDueDate"
                >
                  <template v-slot:prepend>
                    <div class="bg-blue-1 q-pa-xs rounded-borders">
                      <q-icon name="event_repeat" color="primary" />
                    </div>
                  </template>
                </q-select>
              </div>

              <div
                v-if="carritoCO.periodo === 0"
                class="col-12 col-md-6 animate__animated animate__fadeIn"
              >
                <label
                  for="plazopersonalizada"
                  class="text-weight-bold text-grey-9 q-mb-sm block"
                  style="font-size: 13px; text-transform: uppercase"
                  >Plazo total (días) <span class="text-negative">*</span></label
                >
                <q-input
                  v-model="carritoCO.plazoPersonalizado"
                  id="plazopersonalizada"
                  type="number"
                  min="0"
                  dense
                  outlined
                  bg-color="white"
                  class="premium-input"
                  @update:model-value="calculateDueDate"
                  :rules="[(val) => !!val || 'Requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="edit_calendar" color="primary" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <label
                  for="fechalimite"
                  class="text-weight-bold text-grey-9 q-mb-sm block"
                  style="font-size: 13px; text-transform: uppercase"
                  >Fecha límite <span class="text-negative">*</span></label
                >
                <q-input
                  v-model="carritoCO.fechaLimite"
                  id="fechalimite"
                  dense
                  outlined
                  type="date"
                  readonly
                  class="bg-grey-2"
                  input-class="text-weight-bold text-grey-9 text-subtitle2"
                >
                  <template v-slot:prepend>
                    <q-icon name="event_available" color="grey-6" />
                  </template>
                </q-input>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-lg bg-white">
          <q-btn
            flat
            label="Cancelar"
            color="grey-8"
            v-close-popup
            class="q-px-md text-weight-bold text-subtitle2"
          />
          <q-btn
            unelevated
            label="Confirmar Cotización"
            color="primary"
            icon="task_alt"
            class="q-px-xl text-weight-bolder shadow-3"
            style="
              border-radius: 12px;
              height: 44px;
              background: linear-gradient(45deg, #1976d2, #42a5f5);
            "
            @click="enviarDatos"
            :disable="variablePago === 'dividido' && remainingAmount !== 0"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo: Vista previa PDF -->
    <q-dialog
      v-model="mostrarModal"
      full-width
      full-height
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card class="q-pa-none shadow-10" style="height: 100%; max-width: 100%; border-radius: 0">
        <q-card-section class="row items-center q-pb-none bg-dark text-white q-py-sm">
          <div class="text-h6 flex items-center q-px-sm">
            <q-icon name="picture_as_pdf" class="q-mr-sm text-red-4" size="md" /> Vista previa de
            PDF
          </div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup class="bg-grey-8" size="sm" />
        </q-card-section>

        <q-separator color="grey-9" />

        <q-card-section class="q-pa-none bg-grey-3" style="height: calc(100% - 54px)">
          <iframe
            v-if="pdfData"
            :src="pdfData"
            style="width: 100%; height: 100%; border: none"
          ></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Modal Confirmación Envio -->
    <q-dialog
      v-model="dialog"
      :position="position"
      :id="idcliente"
      :data="detallesCotizacion"
      backdrop-filter="blur(4px)"
    >
      <q-card
        class="dialog-card shadow-10"
        style="border-radius: 16px; overflow: hidden; width: 450px; max-width: 95vw"
      >
        <q-card-section
          class="q-pa-lg text-white flex items-center justify-center column"
          style="background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%)"
        >
          <div class="bg-white q-pa-sm rounded-borders q-mb-sm shadow-2" style="border-radius: 50%">
            <q-icon name="check" size="40px" color="positive" />
          </div>
          <div class="text-h6 text-weight-bolder" style="letter-spacing: 0.5px">
            ¡Cotización Exitosa!
          </div>
        </q-card-section>

        <q-card-section class="q-pa-xl text-center bg-white">
          <div class="text-body1 text-grey-9 q-mb-md text-weight-medium" style="font-size: 16px">
            El comprobante ha sido generado y guardado correctamente en el sistema.
          </div>
          <div class="text-subtitle2 text-grey-7" style="line-height: 1.5">
            ¿Desea enviar una copia en formato PDF al correo electrónico del cliente asociado?
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="center" class="q-pa-md bg-grey-1" style="border-top: 1px solid #eee">
          <q-btn
            flat
            label="No, gracias"
            color="grey-7"
            @click="cancelar()"
            class="q-px-md text-weight-bold"
            style="border-radius: 8px"
          />
          <q-btn
            unelevated
            label="Enviar PDF por Correo"
            color="positive"
            icon="send"
            class="q-px-md text-weight-bold shadow-3 q-ml-sm"
            style="border-radius: 8px"
            @click="confirmar(idcliente, detallesCotizacion)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showAddModal">
      <MyRegistrationForm @recordCreated="handleRecordCreated" />
    </q-dialog>
  </q-page>
</template>
<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api, apiCt } from 'src/boot/axios'
import { generarPdfCotizacion } from 'src/utils/pdfReportGenerator'
import { redondear, normalizeText, decimas, validarUsuario } from 'src/composables/FuncionesG'
import MyRegistrationForm from 'src/components/clientes/admin/modalClienteForm.vue'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { obtenerFechaActualDato } from 'src/composables/FuncionesG'
import { PDFenviarComprobanteCorreo } from 'src/utils/pdfReportGenerator'
import { objectToFormData } from 'src/composables/FuncionesGenerales'
import { getToken, getTipoFactura } from 'src/composables/FuncionesG'
import ModalfirmaPage from './ModalfirmaPage.vue'
import UniqueProductSelector from 'src/components/venta/UniqueProductSelector.vue'
import { useProductoConfig } from 'src/composables/productoUnico/useProductoConfig'
import TableCodigosUnicos from 'src/components/cotizacion/TableCodigosUnicos.vue'
const showAddModal = ref(false)
const esProductoUnico = ref(false)
const registrarComoProductoUnico = ref(false)
const idempresa = idempresa_md5()
const CodigosUnicosSeleccionados = ref([])
const { config } = useProductoConfig(idempresa)
const listaCajaBancos = ref([])
const idcajaBancoSeleccionada = ref(null)
watch(
  () => config.value.idempresa,
  (nuevoValor) => {
    if (nuevoValor) {
      esProductoUnico.value = Boolean(config.value.productounico)
      console.log(esProductoUnico.value)
    }
  },
  { deep: true },
)

const guardarCodigosEnVenta = (codigos) => {
  CodigosUnicosSeleccionados.value = codigos
  cantidadCO.value = codigos.length
}

const modalfirmaActivo = ref(false)
const token = getToken()
const tipoFactura = getTipoFactura()
const fecha = ref(obtenerFechaActualDato())
const variablePago = ref('directo')
const modalmetodopago = ref(false)
const pdfData = ref(null)
const mostrarModal = ref(false)
const $q = useQuasar()
const dialog = ref(false)
const position = ref('top')
const idcliente = ref('')
let resolver = null
const detallesCotizacion = ref([])
// --- Estados reactivos ---
const cotizacionFormRef = ref(null) // Para el q-form
const formClientes = ref(null) // Para el q-form
const idalmacenfiltro = ref(0)
const idporcentajeventa = ref(0)
const divisaActiva = reactive({ id: 0, nombre: '', tipo: '', codigosin: 0 })
const leyendaFacturaActiva = reactive({ id: 0, codigosin: 0 }) // Aunque no se usa en este formulario, se mantiene por original
const leyendasCotizacion = ref([]) // Para el aviso en el comprobante

// Tipo de operación: cotizacion o venta
const tipoOperacion = ref({ value: 2, label: 'Cotización Normal' })
const optionOperacion = ref([
  { value: 2, label: 'Cotización Normal' },
  { value: 1, label: 'Cotización Preferencial' },
])

const periodOptions = [
  { label: 'Personalizado', value: 0 },
  { label: '15 días', value: 15 },
  { label: '30 días', value: 30 },
  { label: '60 días', value: 60 },
  { label: '90 días', value: 90 },
]

// Datos del formulario
const filtroAlmacenCO = ref(null)
const almacenesOptions = ref([])

const filtroCategoriaCO = ref(null)
const categoriasOptions = ref([])

const idclienteCO = ref('')
const selectedClient = ref(null) // Objeto del cliente seleccionado
const clientesOptions = ref([])
const filteredClients = ref([])

const idsucursalCOS = ref('')
const selectedSucursal = ref(null) // Objeto de la sucursal seleccionada
const sucursalesOptions = ref([])
const filteredSucursales = ref([])

const puntosVenta = ref([])
const puntoVenta = ref(null)

const selectedProduct = ref(null) // Objeto del producto seleccionado
const cantidaddisponibleCO = ref('')
const cantidadCO = ref(0)
const precioCO = ref(0)
const idstockCO = ref('')
const idporcentajeCO = ref('')
const idproductoalmacenCO = ref('')
const productosDisponibles = ref([])
const filteredProducts = ref([])
const pagosDivididos = ref([{ metodoPago: null, monto: 0, porcentaje: 0 }])
const metodosPagos = ref([])
const metodoPago = ref(null)
const permitirStock = ref(false)
const idfirma = ref(null)
const carritoCO = reactive({
  ventatotal: 0,
  subtotal: 0,
  descuento: 0,
  idalmacen: 0,
  divisa: divisaActiva.id,
  ipv: puntoVenta.value,
  idusuario: 0,
  listaProductos: [],
  pagosDivididos: [],
  metodoPago: 0,
  variablePago: '',
  fecha: fecha.value,
  credito: false,
  periodo: null,
  idfirma: null,
  codigosUnicos: [], // Para productos únicos
  cajabanco: null,
})
console.log(idfirma.value)
const RegistrarFirma = () => {
  console.log(selectedClient.value)
  if (selectedClient.value != null) {
    modalfirmaActivo.value = true
    console.log(modalfirmaActivo.value)
  } else {
    $q.notify({
      type: 'warning',
      message: 'Por favor, selecciona un cliente antes de continuar.',
      position: 'top',
    })
  }
}
const alTerminarFirma = (respuesta) => {
  console.log('Firma registrada:', respuesta)
  if (respuesta.id_firma) {
    carritoCO.idfirma = respuesta.id_firma
    console.log(carritoCO.idfirma)
  }
  // 2. Cerrar el modal (aunque el hijo ya lo hace, aseguramos el estado)
  modalfirmaActivo.value = false

  // 3. Notificación de Quasar (Feedback visual)
  $q.notify({
    type: 'positive',
    message: 'Documento firmado correctamente',
    caption: `ID de Firma: ${respuesta.id_firma || 'N/A'}`,
    position: 'top-right',
  })
}

const alFallarFirma = (err) => {
  console.error('El registro falló:', err)
}
const toggleCredit = (value) => {
  if (!value) {
    carritoCO.cantidadPagos = 0
    carritoCO.montoPagos = 0
    carritoCO.periodo = null
    carritoCO.plazoPersonalizado = 0 // Corregido
    carritoCO.fechaLimite = '' // Corregido
  }
}
const calculatePayments = () => {
  if (carritoCO.credito && carritoCO.cantidadPagos > 0 && totalSaleAmount.value > 0) {
    carritoCO.montoPagos = (totalSaleAmount.value / carritoCO.cantidadPagos).toFixed(2)
  } else {
    carritoCO.montoPagos = 0
  }
}
const calculateDueDate = () => {
  if (!carritoCO.credito || !carritoCO.fecha) return // Corregido

  const fecha = new Date(carritoCO.fecha) // Corregido
  let daysToAdd = 0

  const selectedPeriod = Number(carritoCO.periodo) // Corregido

  if (selectedPeriod === 0) {
    daysToAdd = Number(carritoCO.plazoPersonalizado) || 0 // Corregido (usando carritoCO)
  } else if (selectedPeriod > 0) {
    daysToAdd = selectedPeriod * carritoCO.cantidadPagos // Corregido
  }

  if (daysToAdd > 0) {
    fecha.setDate(fecha.getDate() + daysToAdd)
    carritoCO.fechaLimite = fecha.toISOString().slice(0, 10) // Corregido
  } else {
    carritoCO.fechaLimite = '' // Corregido
  }
}
const CONSTANTES = {
  tipopago: 'contado',
}
console.log(CONSTANTES.tipopago)
const emit = defineEmits(['reiniciar'])

// premitir stock
const permitirStockvacio = () => {
  permitirStock.value = !permitirStock.value

  if (!permitirStock.value) {
    const datos = JSON.parse(localStorage.getItem('carritoCO')) || {}

    console.log(datos)
    const productos = Array.isArray(datos.listaProductos) && datos.listaProductos.length > 0
    console.log(productos)

    const carrito = Array.isArray(carritoCO.value) && carritoCO.value.length > 0
    console.log(carrito)

    if (carrito || productos) {
      emit('reiniciar')
    }
  }
}
// Columnas para la tabla del carrito
const carritoColumns = [
  { name: 'exp', label: '', align: 'left' },

  { name: 'num', label: 'N°', align: 'left', field: 'num' },
  { name: 'codigo', label: 'Código', align: 'center', field: 'codigo' },
  { name: 'descripcion', label: 'Descripción', align: 'left', field: 'descripcion' },
  {
    name: 'cantidad',
    label: 'Cantidad',
    align: 'center',
    field: (row) => decimas(row.cantidad),
  },
  {
    name: 'precio',
    label: 'Precio unitario',
    align: 'center',
    field: (row) => decimas(row.precio),
  },
  {
    name: 'total',
    label: 'Total',
    align: 'center',
    field: (row) => decimas(redondear(parseFloat(row.cantidad) * parseFloat(row.precio))),
  },
  { name: 'options', label: 'Opciones', align: 'center', field: 'options' },
]

// Columnas para la tabla del comprobante

// --- Computed Properties ---
const canAddProduct = computed(() => {
  if (permitirStock.value && precioCO.value > 0 && Number(tipoOperacion.value?.value) === 1) {
    return true
  }
  if (!selectedProduct.value || cantidadCO.value <= 0 || precioCO.value <= 0) {
    return false
  }
  console.log('tipo operacion: ' + tipoOperacion.value?.value)
  if (tipoOperacion.value?.value === 1) {
    return cantidadCO.value <= cantidaddisponibleCO.value
  }

  return true // Para cotización, no se valida stock venta Proforma La cantidad solicitada excede el stock disponible
})

// --- Watchers ---

// Sincronizar carrito con localStorage
watch(
  carritoCO,
  (newVal) => {
    localStorage.setItem('carritoCO', JSON.stringify(newVal))
  },
  { deep: true },
)
const handleTipoOperacionChange = () => {
  cotizacionFormRef.value.resetValidation() // Resetear validación

  resetFormulario()
  console.log(tipoOperacion.value)
}
const cambioFecha = () => {
  carritoCO.fecha = fecha.value
  if (carritoCO.credito) {
    calculateDueDate()
  }
  cotizacionFormRef.value?.resetValidation()
}

// Cargar carrito desde localStorage al inicio

onMounted(() => {
  localStorage.removeItem('carritoCO') // Limpiar localStorage al inicio
  const storedCarrito = localStorage.getItem('carritoCO')
  if (storedCarrito) {
    Object.assign(carritoCO, JSON.parse(storedCarrito))
  }
})

// Watcher para el filtro de almacén para recargar categorías
watch(filtroAlmacenCO, (newVal) => {
  idalmacenfiltro.value = newVal
  listaCategoria()
})

// Watcher para el filtro de categoría para recargar productos
watch(filtroCategoriaCO, (newVal) => {
  idporcentajeventa.value = newVal
  listaProductosDisponibles()
})

// Watcher para resetear campos de producto cuando se selecciona otro producto o se borra el input
watch(selectedProduct, (newVal) => {
  if (!newVal) {
    cantidaddisponibleCO.value = ''
    cantidadCO.value = 1
    precioCO.value = 1
    idstockCO.value = ''
    idporcentajeCO.value = ''
    idproductoalmacenCO.value = ''
  }
})

const cotizacion_proforma = async () => {
  console.log(tipoOperacion.value)
  const tipo_cotz = tipoOperacion.value
  if (Number(tipo_cotz.value) == 2) {
    await enviarDatos()
  } else {
    modalmetodopago.value = true
  }
}

// ======================== TIpo de pago combinado =================

const totalSaleAmount = computed(() => {
  return parseFloat(carritoCO.ventatotal) || 0
})

const totalPaidAmount = computed(() => {
  if (variablePago.value === 'dividido') {
    return pagosDivididos.value.reduce((sum, payment) => sum + parseFloat(payment.monto || 0), 0)
  }
  return 0
})

const remainingAmount = computed(() => {
  if (variablePago.value === 'dividido') {
    return totalSaleAmount.value - totalPaidAmount.value
  }
  return 0
})

const addPaymentMethod = () => {
  pagosDivididos.value.push({ metodoPago: null, monto: 0, porcentaje: 0 })
}

const removePaymentMethod = (index) => {
  pagosDivididos.value.splice(index, 1)
}
const calculateAmountFromPercentage = (index) => {
  console.log(index)
  const payment = pagosDivididos.value[index]
  console.log(payment)
  // Ensure percentage is treated as a number and within valid range
  const percentage = parseFloat(payment.porcentaje) || 0
  if (percentage >= 0 && percentage <= 100 && totalSaleAmount.value > 0) {
    payment.monto = (totalSaleAmount.value * (percentage / 100)).toFixed(2)
  } else {
    payment.monto = 0
  }
}
const calculateRemainingAmount = (index) => {
  console.log(index)
  const payment = pagosDivididos.value[index]
  console.log(payment)
  const monto = parseFloat(payment.monto) || 0
  if (monto >= 0 && monto <= totalSaleAmount.value && totalSaleAmount.value > 0) {
    payment.porcentaje = ((monto * 100) / totalSaleAmount.value).toFixed(2)
  } else {
    payment.porcentaje = 0
  }
}
// --- Funciones de Lógica de Negocio y Peticiones ---

async function getUserData() {
  const contenidousuario = validarUsuario()
  return contenidousuario[0]
}

const cargarMetodoPagoFactura = async () => {
  try {
    const respuesta = await validarUsuario()
    const token = respuesta[0]?.factura?.access_token
    const tipo = respuesta[0]?.factura?.tipo
    const idempresa = respuesta[0]?.empresa?.idempresa
    const response = await api.get(`listaMetodopagoFactura/${idempresa}/${token}/${tipo}`)
    const filtrado = response.data.filter((u) => u.estado == 1)
    console.log(response.data)
    metodosPagos.value = filtrado.map((item) => ({
      label: item.nombre,
      value: item.id,
    }))
  } catch (error) {
    console.error('Error cargando canales:', error)
  }
}
async function leyendaActiva() {
  const endpoint = `listaLeyendaFactura/${idempresa}/${token}/${tipoFactura}`
  console.log(endpoint)
  try {
    const response = await api.get(endpoint)
    const resultado = response.data
    console.log(resultado)
    if (resultado[0] === 'error') {
      console.error(resultado.error)
    } else {
      let use = resultado.filter((u) => u.estado === 1)
      if (use.length > 0) {
        leyendaFacturaActiva.id = use[0].id || 0
        leyendaFacturaActiva.codigosin = use[0].leyendasin.codigo || 0
      }
    }
  } catch (error) {
    console.error('Error al cargar leyenda activa:', error)
  }
}

async function divisaEmonedaActiva() {
  const endpoint = `listaDivisa/${idempresa}/${token}/${tipoFactura}`
  console.log(endpoint)
  try {
    const response = await api.get(endpoint)
    const resultado = response.data
    console.log(resultado)
    if (resultado[0] === 'error') {
      console.error(resultado.error)
    } else {
      let use = resultado.filter((u) => Number(u.estado) === 1)
      if (use.length > 0) {
        divisaActiva.id = use[0].id
        divisaActiva.nombre = use[0].nombre
        divisaActiva.tipo = use[0].tipo || 0
        divisaActiva.codigosin = use[0]?.monedasin?.codigo ?? 0
      }
      console.log(divisaActiva)
    }
  } catch (error) {
    console.error('Error al cargar divisa activa:', error)
  }
}

async function listaAlmacenes() {
  const contenidousuario = await getUserData()
  const idempresa = contenidousuario?.empresa?.idempresa
  const idusuario = contenidousuario?.idusuario
  const endpoint = `listaResponsableAlmacen/${idempresa}`
  try {
    const response = await api.get(endpoint)
    const resultado = response.data
    console.log(resultado)
    if (resultado[0] === 'error') {
      console.error(resultado.error)
    } else {
      almacenesOptions.value = resultado.filter((u) => u.idusuario === idusuario)
      if (almacenesOptions.value.length > 0) {
        filtroAlmacenCO.value = almacenesOptions.value[0].idalmacen // Seleccionar el primero por defecto
      }
    }
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
  }
}
watch(filtroAlmacenCO, (newVal) => {
  console.log('filtroAlmacenCO ha cambiado a:', newVal) // <--- AÑADIR ESTO num
  idalmacenfiltro.value = newVal
  listaCategoria()
})
async function listaCategoria() {
  cargarPuntoVentas()
  const contenidousuario = await getUserData()
  const idempresa = contenidousuario?.empresa?.idempresa
  const endpoint = `listaCategoriaPrecio/${idempresa}`
  try {
    const response = await api.get(endpoint)
    const resultado = response.data
    if (resultado[0] === 'error') {
      console.error(resultado.error)
    } else {
      // Filtrado por el idalmacenfiltro.value que se actualiza desde el watcher
      categoriasOptions.value = resultado.filter((u) => {
        return Number(u.estado) === 1 && Number(u.idalmacen) === Number(idalmacenfiltro.value)
      })
      if (categoriasOptions.value.length > 0) {
        filtroCategoriaCO.value = categoriasOptions.value[0].id // Seleccionar el primero por defecto
      } else {
        filtroCategoriaCO.value = null // Resetear si no hay categorías
      }
    }
  } catch (error) {
    console.error('Error al cargar categorías:', error)
  }
}
const cargarPuntoVentas = async () => {
  try {
    const response = await validarUsuario()
    const idusuario = response[0]?.idusuario

    if (idusuario) {
      const { data } = await api.get(`listaPuntoVentaFacturaCotizacion/${idusuario}`)
      console.log(data)
      const idalmacen = Number(idalmacenfiltro.value)
      console.log()
      if (data.estado == 'error') {
        console.log(data.error)
      } else {
        const filtrados = data.datos.filter((u) => u.idalmacen == idalmacen)
        console.log(filtrados)
        puntosVenta.value = filtrados.map((item) => ({
          label: item.nombre,
          value: item.idpuntoventa,
          Data: item,
        }))
        puntoVenta.value = puntosVenta.value[0]
        console.log(puntosVenta.value)
      }
    }
  } catch (error) {
    console.error(error)
  }
}
async function listaProductosDisponibles() {
  const contenidousuario = await getUserData()
  const idempresa = contenidousuario?.empresa?.idempresa
  if (!idempresa) {
    $q.notify({ type: 'negative', message: 'Error: No se pudo obtener la empresa.' })
    return
  }
  if (!idporcentajeventa.value) {
    productosDisponibles.value = []
    return
  }

  const endpoint = `listaProductosDisponiblesVenta/${idempresa}`
  try {
    const response = await api.get(endpoint)
    const resultado = response.data
    if (resultado[0] === 'error') {
      console.error(resultado.error)
      productosDisponibles.value = []
    } else {
      let use = resultado.datos.filter((u) => u.idporcentaje === idporcentajeventa.value)
      // Filtrar productos que ya están en el carrito
      if (carritoCO.listaProductos.length > 0) {
        use = use.filter(
          (u) => !carritoCO.listaProductos.some((cp) => cp.idproductoalmacen === u.id),
        )
      }
      productosDisponibles.value = use.map((p) => ({
        ...p,
        display: `${p.codigo} - ${p.descripcion}`,
      }))
    }
  } catch (error) {
    console.error('Error al cargar productos disponibles:', error)
    productosDisponibles.value = []
  }
}

async function listaCLientes() {
  const contenidousuario = await getUserData()
  const idempresa = contenidousuario?.empresa?.idempresa
  if (!idempresa) {
    $q.notify({ type: 'negative', message: 'Error: No se pudo obtener la empresa.' })
    return
  }
  const endpoint = `listaCliente/${idempresa}`
  try {
    const response = await api.get(endpoint)
    const resultado = response.data
    if (resultado[0] === 'error') {
      console.error(resultado.error)
    } else {
      clientesOptions.value = resultado.map((c) => ({
        ...c,
        display: `${c.codigo} - ${c.nombre} - ${c.nombrecomercial} - ${c.ciudad} - ${c.nit}`,
      }))
    }
  } catch (error) {
    console.error('Error al cargar clientes:', error)
  }
}

async function selectSucursal(clientId) {
  if (!clientId) {
    sucursalesOptions.value = []
    selectedSucursal.value = null
    idsucursalCOS.value = ''
    return
  }
  try {
    const endpoint = `listaSucursal/${clientId}`
    const response = await api.get(endpoint)
    const data = response.data
    if (data.length === 0) {
      $q.notify({
        type: 'info',
        message: 'No existen sucursales registradas del cliente seleccionado.',
      })
      sucursalesOptions.value = []
      selectedSucursal.value = null
      idsucursalCOS.value = ''
    } else {
      sucursalesOptions.value = data
      // Seleccionar la primera sucursal por defecto
      selectedSucursal.value = data[0]
      idsucursalCOS.value = data[0].id
    }
  } catch (error) {
    console.error('Error al cargar sucursales:', error)
    sucursalesOptions.value = []
    selectedSucursal.value = null
    idsucursalCOS.value = ''
  }
}

async function cargarLeyendasCotizacion() {
  const contenidousuario = await getUserData()
  const idempresa = contenidousuario?.empresa?.idempresa
  if (!idempresa) {
    leyendasCotizacion.value = []
    return
  }
  const endpoint = `listaLeyendaCotizacion/${idempresa}`

  try {
    const response = await api.get(endpoint)
    const resultado = response.data
    if (resultado[0] === 'error') {
      console.error(resultado.error)
      leyendasCotizacion.value = []
    } else {
      leyendasCotizacion.value = resultado.filter((u) => u.estado === 1)
    }
  } catch (error) {
    console.error('Error al cargar leyendas de cotización:', error)
    leyendasCotizacion.value = []
  }
}

// --- Lógica de filtrado para Quasar Select ---

function filterClient(val, update) {
  if (val === '') {
    update(() => {
      filteredClients.value = clientesOptions.value
    })
    return
  }
  update(() => {
    const needle = normalizeText(val).toLowerCase()
    filteredClients.value = clientesOptions.value.filter(
      (v) => normalizeText(v.display).toLowerCase().indexOf(needle) > -1,
    )
  })
}

function setClientInputValue(val) {
  // Esta función se dispara cuando el usuario escribe en el input
  // Si el valor no coincide con un cliente seleccionado, resetea la selección
  if (!clientesOptions.value.some((c) => c.display === val)) {
    selectedClient.value = null
    idclienteCO.value = ''
    selectedSucursal.value = null
    idsucursalCOS.value = ''
  }
}

function elegirUnCliente(client) {
  if (client) {
    idclienteCO.value = client.id
    selectSucursal(client.id)
  } else {
    idclienteCO.value = ''
    selectedSucursal.value = null
    idsucursalCOS.value = ''
  }
}

function filterSucursal(val, update) {
  if (val === '') {
    update(() => {
      filteredSucursales.value = sucursalesOptions.value
    })
    return
  }
  update(() => {
    const needle = normalizeText(val).toLowerCase()
    filteredSucursales.value = sucursalesOptions.value.filter(
      (v) => normalizeText(v.nombre).toLowerCase().indexOf(needle) > -1,
    )
  })
}

function setSucursalInputValue(val) {
  if (!sucursalesOptions.value.some((s) => s.nombre === val)) {
    selectedSucursal.value = null
    idsucursalCOS.value = ''
  }
}

function elegirUnaSucursal(sucursal) {
  if (sucursal) {
    idsucursalCOS.value = sucursal.id
  } else {
    idsucursalCOS.value = ''
  }
}

function filterProduct(val, update) {
  if (val === '') {
    update(() => {
      filteredProducts.value = productosDisponibles.value
    })
    return
  }
  update(() => {
    const needle = normalizeText(val).toLowerCase()
    filteredProducts.value = productosDisponibles.value.filter(
      (v) => normalizeText(v.display).toLowerCase().indexOf(needle) > -1,
    )
  })
}

function setProductInputValue(val) {
  if (!productosDisponibles.value.some((p) => p.display === val)) {
    selectedProduct.value = null
  }
}

function elegirUnProducto(product) {
  if (product) {
    cantidaddisponibleCO.value = product.stock
    precioCO.value = product.precio
    idstockCO.value = product.idstock
    idporcentajeCO.value = product.idporcentaje
    idproductoalmacenCO.value = product.id
    cantidadCO.value = 1 // Set default quantity to 1
  } else {
    cantidaddisponibleCO.value = ''
    precioCO.value = 1
    idstockCO.value = ''
    idporcentajeCO.value = ''
    idproductoalmacenCO.value = ''
    cantidadCO.value = 0
  }
}

// --- Lógica del Carrito ---

async function anadirProductoACarrito() {
  console.log(pagosDivididos.value)
  if (!selectedProduct.value || cantidadCO.value <= 0 || precioCO.value <= 0) {
    $q.notify({
      type: 'info',
      message: 'Llene todos los campos para poder cargar productos a la lista.',
      actions: [{ icon: 'close', color: 'white', round: true }],
    })
    return
  }

  if (Number(tipoOperacion.value?.value) === 1) {
    if (cantidadCO.value > cantidaddisponibleCO.value && !permitirStock.value) {
      $q.notify({
        type: 'warning',
        message: 'La cantidad solicitada excede el stock disponible.',
        actions: [{ icon: 'close', color: 'white', round: true }],
      })
      return
    } else {
      if (cantidadCO.value > cantidaddisponibleCO.value && permitirStock.value) {
        $q.notify({
          type: 'warning',
          message: 'La cantidad solicitada excede el stock disponible.',
          actions: [{ icon: 'close', color: 'white', round: true }],
        })
      }
    }
  } else {
    if (Number(tipoOperacion.value?.value) === 2 && cantidadCO.value > cantidaddisponibleCO.value) {
      $q.notify({
        type: 'warning',
        message: 'La cantidad solicitada excede el stock disponible.',
        actions: [{ icon: 'close', color: 'white', round: true }],
      })
    }
  }

  const contenidousuario = await getUserData()
  const idusuario = contenidousuario?.idusuario
  const nuevoProducto = {
    num: carritoCO.listaProductos.length + 1,
    idproductoalmacen: idproductoalmacenCO.value,
    cantidad: cantidadCO.value,
    precio: precioCO.value,
    idstock: idstockCO.value,
    idporcentaje: idporcentajeCO.value,
    candiponible: cantidaddisponibleCO.value,
    descripcion: selectedProduct.value.descripcion,
    descripcionAdicional: '',
    codigo: selectedProduct.value.codigo,
    despachado:
      Number(selectedProduct.value.stock) == 0 ||
      Number(selectedProduct.value.stock) < Number(cantidadCO.value)
        ? 2
        : 1,
    codigosUnicos: [...CodigosUnicosSeleccionados.value],
  }
  carritoCO.idusuario = idusuario
  carritoCO.idempresa = idempresa_md5()
  carritoCO.divisa = divisaActiva.id // Asegúrate de que la divisa activa esté cargada
  carritoCO.listaProductos.push(nuevoProducto)
  carritoCO.codigosUnicos = [...carritoCO.codigosUnicos, ...CodigosUnicosSeleccionados.value]
  calcularTotalesCarrito()
  listaProductosDisponibles() // Recargar la lista de productos disponibles para excluir el añadido
  resetProductoInputs()
}

function eliminarProductoCarrito(idProductoAlmacen) {
  carritoCO.listaProductos = carritoCO.listaProductos.filter(
    (p) => p.idproductoalmacen !== idProductoAlmacen,
  )
  calcularTotalesCarrito()
  listaProductosDisponibles() // Recargar la lista de productos disponibles
}
const validarDescripcion = async (scope, row) => {
  console.log(scope.value)

  if (carritoCO && carritoCO.listaProductos) {
    carritoCO.listaProductos = carritoCO.listaProductos.map((prod) => {
      // Agregar o editar la descripción adicional
      if (Number(prod.id) == Number(row.idproductoalmacen)) {
        prod.descripcionAdicional = scope.value
      }
      return prod
    })

    console.log('Descripción adicional actualizada correctamente ')
  } else {
    console.warn('No se encontró la lista de productos en el localStorage')
  }

  scope.set()
}
function calcularTotalesCarrito() {
  carritoCO.subtotal = carritoCO.listaProductos.reduce((sub, producto) => {
    const precio = parseFloat(producto.precio)
    const cantidad = parseFloat(producto.cantidad)
    return sub + precio * cantidad
  }, 0)

  if (carritoCO.subtotal === 0) {
    carritoCO.descuento = 0
  }
  carritoCO.ventatotal = carritoCO.subtotal - carritoCO.descuento

  // Asegurar dos decimales
  carritoCO.subtotal = redondear(carritoCO.subtotal)
  carritoCO.ventatotal = redondear(carritoCO.ventatotal)
  carritoCO.descuento = redondear(carritoCO.descuento)
}

function aplicarDescuento() {
  if (carritoCO.descuento > carritoCO.subtotal) {
    $q.notify({
      type: 'warning',
      message: 'El descuento sobrepasa el subtotal.',
      actions: [{ icon: 'close', color: 'white', round: true }],
    })
    carritoCO.descuento = carritoCO.subtotal // Ajustar descuento al subtotal máximo divisa Proforma
  }
  calcularTotalesCarrito()
}

function resetProductoInputs() {
  selectedProduct.value = null
  cantidaddisponibleCO.value = ''
  cantidadCO.value = 1
  precioCO.value = 1
  idstockCO.value = ''
  idporcentajeCO.value = ''
  idproductoalmacenCO.value = ''
}

// --- Envío de Datos ---

async function enviarDatos() {
  modalmetodopago.value = false
  const isValid = await cotizacionFormRef.value.validate()
  if (!isValid) {
    $q.notify({
      type: 'info',
      message: 'Por favor, complete todos los campos requeridos.',
      actions: [{ icon: 'close', color: 'white', round: true }],
    })
    return
  }
  //localStorage
  const isValidCliente = await formClientes.value.validate()
  if (!isValidCliente) {
    $q.notify({
      type: 'info',
      message: 'Por favor, complete todos los campos requeridos.',
      actions: [{ icon: 'close', color: 'white', round: true }],
    })
    return
  }

  if (carritoCO.listaProductos.length === 0) {
    $q.notify({
      type: 'info',
      message: 'Debe añadir al menos un producto a la cotización.',
      actions: [{ icon: 'close', color: 'white', round: true }],
    })
    return
  }

  carritoCO.tipoOperacion = tipoOperacion.value?.value

  if (pagosDivididos.value.length > 0) {
    console.log('entro')
    carritoCO.pagosDivididos = pagosDivididos.value
    carritoCO.variablePago = 'dividido'
  } else {
    console.log('entro')
    carritoCO.variablePago = 'dividido'
    const pago = {
      metodoPago: metodoPago.value,
      monto: carritoCO.ventatotal,
      porcentaje: 100,
    }
    carritoCO.pagosDivididos.push(pago)
  }
  const pv = puntoVenta.value
  carritoCO.ipv = Number(pv.value)
  carritoCO.idalmacen = filtroAlmacenCO.value
  carritoCO.tipopago = carritoCO.credito ? 'credito' : CONSTANTES.tipopago
  carritoCO.cajabanco = idcajaBancoSeleccionada.value
  carritoCO.idcliente = idclienteCO.value
  carritoCO.md5_em = idempresa
  carritoCO.almacen = almacenesOptions.value.find(
    (obj) => Number(obj.idalmacen) === Number(filtroAlmacenCO.value),
  ).almacen //filtroAlmacenCO.value
  console.log(carritoCO.almacen)
  console.log(carritoCO.cajabanco)
  console.log(carritoCO.cajabanco)

  const datosFormulario = new FormData()
  datosFormulario.append('ver', 'registrarCotizacion')
  datosFormulario.append('filtroALmacen', filtroAlmacenCO.value)
  datosFormulario.append('filtroCategoria', filtroCategoriaCO.value)
  datosFormulario.append('idcliente', idclienteCO.value)
  datosFormulario.append('idsucursal', idsucursalCOS.value)
  datosFormulario.append('listaProductos', JSON.stringify(carritoCO)) // Enviar el objeto completo del carrito
  datosFormulario.append('tipo_operacion', tipoOperacion.value?.value) // Añadir el tipo de operación

  console.log(carritoCO)

  $q.loading.show({
    message: 'Registrando cotización...',
  })
  try {
    // Asumo que tu backend espera 'listaProductos' como un JSON string.
    datosFormulario.forEach((valor, clave) => console.log(`${clave}: ${valor}`))
    const datosJson = {}
    datosFormulario.forEach((valor, clave) => {
      datosJson[clave] = valor
    })
    console.log(JSON.stringify(datosJson, null, 2))
    const response = await api.post(``, datosFormulario)
    const data = response.data
    console.log('Datos recibidos:', response)

    if (data.estado === 'exito') {
      resetFormulario()
      $q.notify({
        type: 'positive',
        message: 'Cotización realizada exitosamente.',
      })
      cotizacionFormRef.value.resetValidation() // Resetear validación

      $q.dialog({
        title: 'Cotización Exitosa',
        message: 'Su comprobante está listo. ¿Desea verlo?',
        cancel: true,
        persistent: true,
      }).onOk(() => {
        generarComprobante(data.id)
      })
    } else {
      $q.notify({
        type: 'negative',
        message: data.mensaje || 'Error al registrar la cotización.',
      })
    }
  } catch (error) {
    console.error('Error al realizar la solicitud:', error)
    $q.notify({
      type: 'negative',
      message: 'Hubo un error de conexión o en el servidor.',
    })
  } finally {
    $q.loading.hide()
  }
}

function resetFormulario() {
  // Limpiar campos del formulario
  filtroAlmacenCO.value = null // Se reestablecerá por la lógica de listaAlmacenes
  filtroCategoriaCO.value = null
  idclienteCO.value = ''
  selectedClient.value = null
  idsucursalCOS.value = ''
  selectedSucursal.value = null
  resetProductoInputs()

  // Limpiar carrito
  carritoCO.ventatotal = 0
  carritoCO.subtotal = 0
  carritoCO.descuento = 0
  carritoCO.listaProductos = []
  localStorage.removeItem('carritoCO')
  carritoCO.metodoPago = 0
  carritoCO.pagosDivididos = []
  pagosDivididos.value = []

  // Recargar listas dependientes si es necesario
  listaAlmacenes()
  listaCLientes()
}

// --- Comprobante ---
// async function enviarCorreo(id) {
//   console.log(id)
// }
function open(pos, idcot, data) {
  position.value = pos
  dialog.value = true
  idcliente.value = idcot
  detallesCotizacion.value = data
  console.log(idcliente.value, detallesCotizacion.value)

  return new Promise((resolve) => {
    resolver = resolve
  })
}
async function generarComprobante(id) {
  // Después que el usuario confirma el primer diálogo

  const contenidousuario = await getUserData()
  const idempresa = contenidousuario?.empresa?.idempresa
  console.log(idempresa)
  if (!idempresa) {
    $q.notify({
      type: 'negative',
      message: 'Error: No se pudo obtener la empresa para el comprobante.',
    })
    return
  }

  $q.loading.show({
    message: 'Generando comprobante...',
  })

  try {
    const response = await api.get(`detallesCotizacion/${id}/${idempresa}`)
    const data = response.data
    console.log('Comprobante Data:', response)

    if (data[0] === 'error') {
      console.error(data.error)
      $q.notify({ type: 'negative', message: 'Error al cargar los detalles del comprobante.' })
    } else {
      // Cargar leyendas si no están cargadas
      if (leyendasCotizacion.value.length === 0) {
        await cargarLeyendasCotizacion()
      }
      const doc = await generarPdfCotizacion(data)
      pdfData.value = doc.output('dataurlstring')
      mostrarModal.value = true
      console.log(data[0]?.cliente.idcliente, data)
      open('right', data[0]?.cliente.idcliente, data)
    }
  } catch (error) {
    console.error('Error al generar comprobante:', error)
    $q.notify({ type: 'negative', message: 'Hubo un error al generar el comprobante.' })
  } finally {
    $q.loading.hide()
  }
}
const confirmar = (idcliente, data) => {
  resolver?.(true)
  //JSON.parse(JSON.stringify(detalleVenta.value))
  const detalle = JSON.parse(JSON.stringify(data))
  console.log('Confirmado', idcliente, detalle)
  PDFenviarComprobanteCorreo(idcliente, detalle, $q)
  dialog.value = false
}

const cancelar = () => {
  resolver?.(false)
  dialog.value = false
  console.log('Cancelado')
}

// --- registrar Cliente ---

const RegistrarCliente = () => {
  console.log(variablePago.value)
  showAddModal.value = !showAddModal.value
}
const handleRecordCreated = async (newRecordData) => {
  // newRecordData is already the plain object, not a ref, so no .value here
  const formData = objectToFormData(newRecordData) // Use newRecordData directly

  for (let [k, v] of formData.entries()) {
    // Good practice to disable eslint for console.log in production
    console.log(`${k}: ${v}`)
  }

  try {
    const response = await api.post(``, formData) // Replace `/your-api-endpoint` with your actual API endpoint

    // Access response.data directly, not response.value
    console.log(response.data)

    if (response.data.estado === 'exito') {
      listaCLientes()
      RegistrarCliente()
      $q.notify({
        type: 'positive',
        message: response.data.mensaje || 'Cliente guardado correctamente',
      })
      // Optionally, refresh your data or add the new client to your list
      // For example, if you have a method to fetch clients:
      // fetchClients();
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.mensaje || 'Hubo un problema al guardar el cliente',
      })
    }
  } catch (error) {
    console.error('Error submitting form:', error)

    $q.notify({
      color: 'negative',
      message:
        'Error al registrar: ' +
        (error.response?.data?.mensaje || error.message || 'Error desconocido'),
      icon: 'error',
    })
  }
}

watch(
  () => variablePago.value,
  (nuevoValor) => {
    console.log(nuevoValor)
    if (nuevoValor === 'directo') {
      // Limpiar los datos de pago dividido
      pagosDivididos.value = [{ metodoPago: null, monto: 0, porcentaje: 0 }]
    } else if (nuevoValor === 'dividido') {
      // Limpiar el método de pago único
      metodoPago.value = null
    }
  },
)

const handleTipoPagoGeneralChange = (val) => {
  if (val) {
    // Caso Crédito
    variablePago.value = 'directo'
    calculatePayments()
    calculateDueDate()
  } else {
    // Caso Efectivo
    toggleCredit(false)
  }
}
async function listarcajasbanco() {
  try {
    const response = await apiCt.get(`listar_caja_bancos/${idempresa}`)

    listaCajaBancos.value = response.data.map((item) => ({
      label: item.codigo_cuenta + ' ' + item.codigo + ' ' + item.glosa,
      value: item.idcaja_bancos,
    }))
    console.log(listaCajaBancos.value)
  } catch (error) {
    console.error('Error al cargar caja bancos:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar caja Bancos' })
  }
}
// --- Inicialización ---
onMounted(async () => {
  localStorage.removeItem('carritoCO') // Limpiar localStorage al inicio
  // Cargar datos iniciales
  await divisaEmonedaActiva()
  await leyendaActiva() // Aunque no se use directamente, la lógica original la carga.
  await listaAlmacenes()
  await listaCLientes()
  await listaProductosDisponibles() // Cargar productos inicialmente
  await cargarLeyendasCotizacion() // Cargar leyendas para el comprobante
  await cargarMetodoPagoFactura()
  calcularTotalesCarrito() // Recalcular si hay carrito guardado en localStorage
  listarcajasbanco()
})
</script>

<style lang="scss" scoped>
/* Puedes mover tus estilos relacionados con el comprobante y otros aquí */
.invoice {
  font-family: 'Arial', sans-serif;
  font-size: 12px;
  color: #333;

  header {
    padding: 10px 0;
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;

    .company-details {
      text-align: left;
    }

    .name p {
      font-weight: bold;
      margin-bottom: 5px;
    }

    .col {
      display: inline-block;
      vertical-align: top;
      width: 32%; /* Adjust as needed */
    }

    .col:nth-child(2) {
      text-align: center;
    }

    .col:nth-child(3) {
      text-align: right;
    }
  }

  main {
    padding-bottom: 50px;

    .contacts {
      margin-bottom: 20px;

      .invoice-to,
      .invoice-details {
        display: inline-block;
        vertical-align: top;
        width: 49%;
      }

      .invoice-to {
        text-align: left;
      }

      .invoice-details {
        text-align: right;
      }

      .text-gray-light {
        color: #777;
      }

      .to {
        font-weight: bold;
      }
    }

    .q-table {
      width: 100%;
      border-collapse: collapse;
      thead {
        background-color: #e0e0e0;
        th {
          padding: 8px;
          border: 1px solid #ddd;
          text-align: left;
        }
      }
      tbody {
        td {
          padding: 8px;
          border: 1px solid #ddd;
        }
      }
      tfoot {
        td {
          padding: 8px;
          border: 1px solid #ddd;
          font-weight: bold;
        }
      }
    }

    .notices {
      margin-top: 20px;
      font-size: 0.9em;
      color: #555;
    }
  }
}
</style>

<style scoped>
.dialog-card {
  width: 400px; /* Un poco más de ancho para mejor legibilidad */
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden; /* Asegura que el gradiente se vea bien en los bordes */
}

.header-gradient {
  background: linear-gradient(to right, #219286, #044e49);
}

.text-h6 {
  font-family: 'Roboto', sans-serif;
  letter-spacing: 0.5px;
}

.text-body1 {
  font-family: 'Open Sans', sans-serif;
  line-height: 1.6;
}

.button-primary {
  background: linear-gradient(to right, #219286, #044e49);
  color: white;
  font-weight: 500;
  letter-spacing: 0.5px;
  padding: 8px 20px;
  border-radius: 6px;
}

.q-btn:hover:not(.disabled) {
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

/* Color de acento para el icono de confirmación */
.q-icon[name='check_circle'] {
  color: #f2c037; /* Color de acento */
}

/* Quitar el q-linear-progress si no es funcional aquí, o darle un propósito */
/* .q-linear-progress { display: none; } */
</style>
\n
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.premium-input:hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

.hover-row:hover {
  background-color: #f5f9ff !important;
}

.hover-shake:hover {
  transform: scale(1.1) rotate(3deg);
  transition: transform 0.2s ease;
}

/* Enhancing inputs */
.q-field--outlined .q-field__control {
  border-radius: 8px !important;
}

.q-card {
  transition: all 0.3s ease;
}

.q-btn {
  text-transform: none;
  letter-spacing: 0.3px;
}
</style>
