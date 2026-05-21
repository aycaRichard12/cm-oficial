<template>
  <q-page class="q-pa-lg bg-fondo" style="min-height: 100vh">
    <!-- Encabezado de la Página -->
    <div class="">
      <!-- Modern Header Section -->
      <div class="header-section q-mb-xl">
        <div class="row items-center">
          <div class="col">
            <div class="flex items-center gap-3">
              <div class="icon-wrapper bg-gradient-primary text-white">
                <q-icon name="request_quote" size="28px" />
              </div>
              <div>
                <h1 class="page-title text-grey-10">Editar Cotización</h1>
                <div class="page-subtitle text-grey-6">Gestión y actualización de cotizaciones</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Card: Customer Data Section -->
      <q-card class="data-card q-mb-xl" flat>
        <q-card-section class="card-header">
          <div class="flex items-center gap-2">
            <q-icon name="manage_accounts" size="20px" class="text-white" />
            <span class="card-header-title">Datos del Cliente y Configuración</span>
          </div>
        </q-card-section>

        <q-card-section class="card-content q-pa-xl">
          <!-- Customer Data Form -->
          <q-form ref="formClientes" class="customer-form">
            <div class="row q-col-gutter-xl q-mb-xl">
              <div class="col-12 col-md-3" id="tipoOperacionCotizacion">
                <div class="field-label">
                  Tipo de Operación <span class="required-star">*</span>
                </div>
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
                  class="saas-input"
                  readonly
                />
              </div>

              <div class="col-12 col-md-3" id="fechaCotizacion">
                <div class="field-label">Fecha <span class="required-star">*</span></div>
                <q-input
                  v-model="fecha"
                  id="fecha"
                  type="date"
                  :rules="[(val) => !!val || 'Campo requerido']"
                  @update:model-value="cambioFecha"
                  outlined
                  dense
                  bg-color="white"
                  hide-bottom-space
                  class="saas-input"
                />
              </div>

              <div class="col-12 col-md-6" id="clienteCotizacion">
                <div class="field-label">Cliente <span class="required-star">*</span></div>
                <div class="row no-wrap items-start gap-2">
                  <q-select
                    class="col saas-input"
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
                        <q-item-section class="text-grey">No hay resultados</q-item-section>
                      </q-item>
                    </template>
                  </q-select>

                  <div id="botonRegistrarCliente">
                    <q-btn
                      color="primary"
                      unelevated
                      class="icon-btn"
                      icon="person_add"
                      @click="RegistrarCliente"
                    >
                      <q-tooltip class="tooltip-custom"> Registrar Nuevo Cliente </q-tooltip>
                    </q-btn>
                  </div>
                </div>
                <input type="hidden" v-model="idclienteCO" name="idcliente" />
              </div>
            </div>

            <div class="row q-col-gutter-xl">
              <div class="col-12 col-md-6" id="sucursalCotizacion">
                <div class="field-label">Sucursal <span class="required-star">*</span></div>
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
                  class="saas-input"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">No hay resultados</q-item-section>
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

          <q-separator class="section-divider q-my-xl" />

          <!-- Initial Configuration Section -->
          <q-form ref="cotizacionFormRef">
            <div class="row q-col-gutter-xl">
              <div class="col-12 col-md-4" id="almacenCotizacion">
                <div class="field-label">Almacén origen <span class="required-star">*</span></div>
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
                  class="saas-input"
                />
              </div>

              <div class="col-12 col-md-4" id="categoriaCotizacion">
                <div class="field-label">
                  Categoría de precio <span class="required-star">*</span>
                </div>
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
                  class="saas-input"
                />
              </div>

              <div class="col-12 col-md-4" id="puntoVentaCotizacion">
                <div class="field-label">Punto Venta <span class="required-star">*</span></div>
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
                  class="saas-input"
                />
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>

    <!-- Segunda Sección: Añadir Productos -->
    <q-card class="products-card" flat>
      <!-- Header Section -->
      <q-card-section class="card-header">
        <div class="flex items-center gap-2">
          <q-icon name="shopping_cart_checkout" size="20px" class="text-white" />
          <span class="card-header-title">Añadir Productos</span>
        </div>
      </q-card-section>

      <!-- Product Selection Section -->
      <q-card-section class="card-content bg-white">
        <div class="row q-col-gutter-lg items-end">
          <div class="col-12 col-md-4" id="productoCotizacion">
            <div class="flex justify-between items-center q-mb-xs">
              <div class="field-label">
                Producto o Servicio <span class="required-star">*</span>
              </div>
              <q-checkbox
                v-if="esProductoUnico"
                v-model="registrarComoProductoUnico"
                size="xs"
                label="Producto Único"
                color="secondary"
                class="unique-checkbox"
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
              class="saas-input"
              @filter="filterProduct"
              @input-value="setProductInputValue"
              @update:model-value="elegirUnProducto"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey-6">No hay resultados</q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-2" id="stockCotizacion">
            <div class="field-label">Stock Actual</div>
            <q-input
              id="stock"
              v-model="cantidaddisponibleCO"
              readonly
              outlined
              dense
              bg-color="grey-1"
              hide-bottom-space
              class="stock-input"
              placeholder="0"
            >
              <template v-slot:prepend>
                <q-icon name="inventory_2" size="18px" color="grey-6" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-2" id="cantidadCotizacion">
            <div class="field-label">Cantidad <span class="required-star">*</span></div>
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
              class="saas-input text-center"
            />
          </div>

          <div class="col-12 col-md-3" id="precioCotizacion">
            <div class="field-label">Precio unitario <span class="required-star">*</span></div>
            <q-input
              id="precio"
              v-model.number="precioCO"
              type="number"
              :rules="[(val) => val > 0 || 'Debe ser mayor a 0']"
              required
              outlined
              :readonly="!permisosStore.tienePermiso('editarprecioventa')"
              dense
              bg-color="white"
              hide-bottom-space
              class="saas-input"
            >
              <template v-slot:append>
                <div class="currency-badge">
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
              class="add-button full-width"
              :disable="!canAddProduct"
              @click="anadirProductoACarrito"
            >
              <q-tooltip class="tooltip-secondary"> Añadir al carrito </q-tooltip>
            </q-btn>
          </div>
        </div>

        <UniqueProductSelector
          :product-id="idproductoalmacenCO"
          :is-unique="esProductoUnico && registrarComoProductoUnico"
          :cantidad-requerida="cantidadCO"
          @update:selection="(codigos) => guardarCodigosEnVenta(codigos)"
          class="q-mt-lg"
        />
      </q-card-section>

      <!-- Summary Section Header -->
      <q-card-section class="summary-header">
        <div class="flex items-center gap-2">
          <q-icon name="receipt_long" size="18px" class="text-primary" />
          <span class="summary-title">Resumen de Cotización</span>
        </div>
      </q-card-section>

      <!-- Products Table -->
      <q-table
        id="tablaResumenCotizacion"
        :rows="carritoECO.listaProductos"
        :columns="carritoColumns"
        row-key="idproductoalmacen"
        flat
        hide-bottom
        class="products-table"
        table-header-class="table-header"
        :pagination="{ rowsPerPage: 0 }"
      >
        <template v-slot:body="props">
          <q-tr :props="props" :class="props.expand ? 'expanded-row-active' : 'table-row'">
            <q-td auto-width>
              <q-btn
                v-if="props.row.codigosUnicos?.length > 0"
                size="sm"
                color="primary"
                flat
                round
                dense
                @click="props.expand = !props.expand"
                :icon="props.expand ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
                class="expand-btn"
              />
            </q-td>

            <q-td key="num" :props="props" class="text-left">
              <q-badge class="num-badge" :label="props.row.num" />
            </q-td>

            <q-td key="codigo" :props="props" class="text-left">
              <q-badge outline color="primary" class="code-badge" :label="props.row.codigo" />
            </q-td>

            <q-td key="descripcion" :props="props">
              <div class="product-description">
                {{ props.row.descripcion }}
              </div>
              <div class="additional-note" v-ripple @click="openNoteEditor(props.row)">
                <q-icon name="edit_note" size="14px" />
                <span>{{ props.row.descripcionAdicional || 'Añadir nota adicional...' }}</span>
              </div>
              <q-popup-edit
                v-model="props.row.descripcionAdicional"
                v-slot="scope"
                buttons
                label-set="Guardar"
                label-cancel="Cancelar"
                @show="editingRow = props.row"
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
            </q-td>

            <q-td key="cantidad" :props="props" class="text-right">
              <q-badge class="quantity-badge" :label="props.row.cantidad" />
            </q-td>

            <q-td key="precio" :props="props" class="text-right">
              <span class="price-value">{{ decimas(props.row.precio) }}</span>
              <span class="currency-symbol">{{ divisaActiva.tipo }}</span>
            </q-td>

            <q-td key="total" :props="props" class="text-right">
              <span class="total-value">{{ decimas(props.row.cantidad * props.row.precio) }}</span>
              <span class="currency-symbol">{{ divisaActiva.tipo }}</span>
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
                class="delete-btn"
              >
                <q-tooltip class="tooltip-negative">Quitar producto</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>

          <q-tr v-show="props.expand" :props="props" class="expanded-row">
            <q-td colspan="100%" class="q-pa-md">
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
          <q-tr class="summary-row subtotal">
            <q-td colspan="6" class="text-right summary-label">SUBTOTAL:</q-td>
            <q-td class="text-right summary-value">
              {{ decimas(carritoECO.subtotal) }}
              <span class="currency-symbol">{{ divisaActiva.tipo }}</span>
            </q-td>
            <q-td />
          </q-tr>

          <q-tr class="summary-row discount" id="descuentoCotizacion">
            <q-td colspan="6" class="text-right summary-label">DESCUENTO:</q-td>
            <q-td class="text-right">
              <q-input
                v-model.number="carritoECO.descuento"
                type="number"
                min="0"
                :max="carritoECO.subtotal"
                @change="aplicarDescuento"
                dense
                outlined
                bg-color="white"
                class="discount-input"
                input-class="text-right text-weight-bolder text-negative"
              >
                <template v-slot:append>
                  <div class="discount-badge">
                    {{ divisaActiva.tipo }}
                  </div>
                </template>
              </q-input>
            </q-td>
            <q-td />
          </q-tr>

          <q-tr class="summary-row total">
            <q-td colspan="6" class="text-right total-label">TOTAL GENERAL:</q-td>
            <q-td class="text-right total-amount">
              {{ decimas(carritoECO.ventatotal) }}
              <span class="total-currency">{{ divisaActiva.tipo }}</span>
            </q-td>
            <q-td />
          </q-tr>
        </template>
      </q-table>

      <!-- Action Buttons -->
      <q-card-section class="action-section">
        <div class="row justify-end items-center q-gutter-md">
          <q-btn label="Cancelar" color="red" outline @click="$emit('cancelarEdicion')" />
          <q-btn
            outline
            color="primary"
            icon="draw"
            @click="RegistrarFirma"
            label="Firma del Cliente"
            class="action-btn-outline"
          />
          <q-btn
            label="Guardar Cotización"
            color="primary"
            icon="task_alt"
            size="lg"
            :disable="carritoECO.listaProductos.length === 0"
            @click="cotizacion_proforma"
            class="action-btn-primary"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Diálogo: metodo de pago -->
    <q-dialog v-model="modalmetodopago" backdrop-filter="blur(4px)" persistent>
      <q-card
        class="responsive-dialog shadow-10 column no-wrap"
        style="
          min-width: 500px;
          max-width: 750px;
          max-height: 90vh;
          border-radius: 16px;
          overflow: hidden;
        "
      >
        <q-card-section
          class="bg-primary text-white q-py-md flex justify-between items-center shrink-0"
          style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); z-index: 10"
        >
          <div class="flex items-center">
            <div class="bg-white q-pa-xs rounded-borders q-mr-md shadow-1">
              <q-icon name="payments" class="text-primary" size="24px" />
            </div>
            <span class="text-h6 text-weight-bold" style="font-family: 'Inter', sans-serif">
              Método de Pago
            </span>
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

        <q-card-section class="col scroll q-pa-lg bg-grey-1">
          <div class="row justify-center q-mb-xl">
            <q-btn-toggle
              v-model="carritoECO.credito"
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

          <div v-if="!carritoECO.credito" class="animate__animated animate__fadeIn">
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
              />
              <q-radio
                v-model="variablePago"
                val="dividido"
                color="orange-8"
                label="Pago Dividido"
                class="text-weight-bolder text-subtitle2"
              />
            </div>

            <div v-if="variablePago === 'directo'" class="row q-col-gutter-lg q-pt-sm">
              <div class="col-12">
                <label
                  class="text-weight-bold text-grey-9 q-mb-sm block text-uppercase"
                  style="font-size: 13px"
                >
                  Método de pago <span class="text-negative">*</span>
                </label>
                <q-select
                  v-model="metodoPago"
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
                    >Método *</label
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
                    <span class="text-h6" :class="remainingAmount < 0 ? 'text-negative' : ''">
                      {{ remainingAmount.toFixed(2) }}
                    </span>
                  </div>
                </div>
              </q-banner>
            </div>

            <div
              class="col-12 q-mt-lg animate__animated animate__zoomIn"
              v-if="listaCajaBancos.length > 0"
            >
              <label
                class="text-weight-bold text-grey-9 q-mb-sm block text-uppercase"
                style="font-size: 13px"
              >
                Seleccione Caja o Banco <span class="text-negative">*</span>
              </label>

              <q-select
                v-model="idcajaBancoSeleccionada"
                :options="listaCajaBancos"
                id="cajaBanco"
                dense
                outlined
                emit-value
                map-options
                class="premium-input"
                :rules="[(val) => !!val || 'Campo requerido']"
              >
                <template v-slot:prepend>
                  <q-icon name="account_balance" color="positive" />
                </template>

                <template v-slot:selected-item="scope">
                  <div v-if="scope.opt" class="q-py-xs">
                    <span class="text-weight-bold text-primary">{{ scope.opt.codigo }}</span>
                    <span class="q-ml-xs">- {{ scope.opt.nombre }}</span>
                  </div>
                </template>

                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>
                        <span class="text-weight-bolder text-grey-9">{{ scope.opt.codigo }}</span>
                      </q-item-label>
                      <q-item-label caption>
                        {{ scope.opt.nombre }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>

          <div v-else class="animate__animated animate__fadeIn">
            <div
              class="text-subtitle1 text-weight-bold q-mb-lg text-primary flex items-center q-px-md bg-blue-50 q-py-sm rounded-borders shadow-1"
              style="width: fit-content; border-left: 4px solid #1976d2"
            >
              MODALIDAD: CRÉDITO
            </div>
            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-6">
                <label
                  class="text-weight-bold text-grey-9 q-mb-sm block text-uppercase"
                  style="font-size: 13px"
                  >Cantidad de pagos *</label
                >
                <q-input
                  v-model="carritoECO.cantidadPagos"
                  type="number"
                  min="1"
                  dense
                  outlined
                  @update:model-value="(calculatePayments(), calculateDueDate())"
                  :rules="[(val) => !!val || 'Requerido']"
                >
                  <template v-slot:prepend
                    ><q-icon name="format_list_numbered" color="primary"
                  /></template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <label
                  class="text-weight-bold text-grey-9 q-mb-sm block text-uppercase"
                  style="font-size: 13px"
                  >Monto por pago *</label
                >
                <q-input
                  v-model="carritoECO.montoPagos"
                  dense
                  outlined
                  readonly
                  class="bg-grey-2"
                  input-class="text-weight-bolder text-primary text-subtitle1"
                >
                  <template v-slot:prepend><q-icon name="paid" color="grey-6" /></template>
                  <template v-slot:append>
                    <span class="text-subtitle2 text-grey-7">{{ divisaActiva.tipo }}</span>
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <label
                  class="text-weight-bold text-grey-9 q-mb-sm block text-uppercase"
                  style="font-size: 13px"
                  >Frecuencia *</label
                >
                <q-select
                  v-model="carritoECO.periodo"
                  dense
                  outlined
                  :options="periodOptions"
                  emit-value
                  map-options
                  @update:model-value="calculateDueDate"
                >
                  <template v-slot:prepend><q-icon name="event_repeat" color="primary" /></template>
                </q-select>
              </div>

              <div
                v-if="carritoECO.periodo === 0"
                class="col-12 col-md-6 animate__animated animate__fadeIn"
              >
                <label
                  class="text-weight-bold text-grey-9 q-mb-sm block text-uppercase"
                  style="font-size: 13px"
                  >Plazo total (días) *</label
                >
                <q-input
                  v-model="carritoECO.plazoPersonalizado"
                  type="number"
                  dense
                  outlined
                  @update:model-value="calculateDueDate"
                  :rules="[(val) => !!val || 'Requerido']"
                >
                  <template v-slot:prepend
                    ><q-icon name="edit_calendar" color="primary"
                  /></template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <label
                  class="text-weight-bold text-grey-9 q-mb-sm block text-uppercase"
                  style="font-size: 13px"
                  >Fecha límite *</label
                >
                <q-input
                  v-model="carritoECO.fechaLimite"
                  dense
                  outlined
                  type="date"
                  readonly
                  class="bg-grey-2"
                >
                  <template v-slot:prepend
                    ><q-icon name="event_available" color="grey-6"
                  /></template>
                </q-input>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-lg bg-white shrink-0 shadow-up-1">
          <q-btn
            flat
            label="Cancelar"
            color="grey-8"
            v-close-popup
            class="q-px-md text-weight-bold"
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
import { redondear, normalizeText, decimas, validarUsuario } from 'src/composables/FuncionesG'
import MyRegistrationForm from 'src/components/clientes/admin/modalClienteForm.vue'
import { idempresa_md5, idusuario_md5, objectToFormData } from 'src/composables/FuncionesGenerales'
import { getToken, getTipoFactura } from 'src/composables/FuncionesG'
import ModalfirmaPage from './ModalfirmaPage.vue'
import UniqueProductSelector from 'src/components/venta/UniqueProductSelector.vue'
import { useProductoConfig } from 'src/composables/productoUnico/useProductoConfig'
import TableCodigosUnicos from 'src/components/cotizacion/TableCodigosUnicos.vue'
import { useOperacionesPermitidas } from 'src/composables/useAutorizarOperaciones'

const props = defineProps({
  idCotizacion: {
    type: [Number, String],
    required: true,
  },
})
console.log('ID de Cotización recibido:', props.idCotizacion)
const emit = defineEmits(['saved', 'reiniciar', 'cancelarEdicion'])

const permisosStore = useOperacionesPermitidas()
console.log(permisosStore.tienePermiso('editarprecioventa'))

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
const fecha = ref(null)
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
  { value: 0, label: 'Cotización Normal' },
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

const originalCotizacion = ref(null)
const originalDetalle = ref([])

const carritoECO = reactive({
  ver: 'editarCotizacion',
  id_cotizacion: props.idCotizacion,
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
  fecha: null,
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
    carritoECO.idfirma = respuesta.id_firma
    console.log(carritoECO.idfirma)
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
    carritoECO.cantidadPagos = 0
    carritoECO.montoPagos = 0
    carritoECO.periodo = null
    carritoECO.plazoPersonalizado = 0 // Corregido
    carritoECO.fechaLimite = '' // Corregido
  }
}
const calculatePayments = () => {
  if (carritoECO.credito && carritoECO.cantidadPagos > 0 && totalSaleAmount.value > 0) {
    carritoECO.montoPagos = (totalSaleAmount.value / carritoECO.cantidadPagos).toFixed(2)
  } else {
    carritoECO.montoPagos = 0
  }
}
const calculateDueDate = () => {
  if (!carritoECO.credito || !carritoECO.fecha) return // Corregido

  const fecha = new Date(carritoECO.fecha) // Corregido
  let daysToAdd = 0

  const selectedPeriod = Number(carritoECO.periodo) // Corregido

  if (selectedPeriod === 0) {
    daysToAdd = Number(carritoECO.plazoPersonalizado) || 0 // Corregido (usando carritoECO)
  } else if (selectedPeriod > 0) {
    daysToAdd = selectedPeriod * carritoECO.cantidadPagos // Corregido
  }

  if (daysToAdd > 0) {
    fecha.setDate(fecha.getDate() + daysToAdd)
    carritoECO.fechaLimite = fecha.toISOString().slice(0, 10) // Corregido
  } else {
    carritoECO.fechaLimite = '' // Corregido
  }
}
// const CONSTANTES = {
//   tipopago: 'contado',
// }

// premitir stock

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
  carritoECO,
  (newVal) => {
    localStorage.setItem('carritoECO', JSON.stringify(newVal))
  },
  { deep: true },
)
const handleTipoOperacionChange = () => {
  cotizacionFormRef.value.resetValidation() // Resetear validación

  resetFormulario()
  console.log(tipoOperacion.value)
}
const cambioFecha = () => {
  carritoECO.fecha = fecha.value
  if (carritoECO.credito) {
    calculateDueDate()
  }
  cotizacionFormRef.value?.resetValidation()
}

// Cargar carrito desde localStorage al inicio

onMounted(() => {
  localStorage.removeItem('carritoECO') // Limpiar localStorage al inicio
  const storedCarrito = localStorage.getItem('carritoECO')
  if (storedCarrito) {
    Object.assign(carritoECO, JSON.parse(storedCarrito))
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
  await enviarDatos()
}

// ======================== TIpo de pago combinado =================

const totalSaleAmount = computed(() => {
  return parseFloat(carritoECO.ventatotal) || 0
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
  let endpoint = null

  if (token && tipoFactura && getTipoFactura(true) && getToken(true)) {
    endpoint = `listaLeyendaFactura/${idempresa}/${token}/${tipoFactura}`
  } else {
    leyendaFacturaActiva.id = 0
    leyendaFacturaActiva.codigosin = 0
    return
  }

  try {
    if (endpoint != null) {
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
    }
  } catch (error) {
    console.error('Error al cargar leyenda activa:', error)
  }
}

async function divisaEmonedaActiva() {
  let endpoint = ``
  if (token && tipoFactura && getTipoFactura(true) && getToken(true)) {
    endpoint = `listaDivisa/${idempresa}/${token}/${tipoFactura}`
  } else {
    endpoint = `listaDivisa/${idempresa}`
  }

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
  await cargarPuntoVentas()
  const contenidousuario = await getUserData()
  const idempresa = contenidousuario?.empresa?.idempresa
  const endpoint = `listarCategoriaPrecioVenta/${idempresa}`
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
    console.log(response.data)
    const resultado = response.data
    if (resultado[0] === 'error') {
      console.error(resultado.error)
      productosDisponibles.value = []
    } else {
      console.log(idporcentajeventa.value)
      console.log(idporcentajeventa.value)
      let use = resultado.datos.filter(
        (u) => Number(u.idporcentaje) === Number(idporcentajeventa.value),
      )
      console.log(use)
      // Filtrar productos que ya están en el carrito
      if (carritoECO.listaProductos.length > 0) {
        use = use.filter(
          (u) => !carritoECO.listaProductos.some((cp) => cp.idproductoalmacen === u.id),
        )
      }
      console.log(use)
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
    num: carritoECO.listaProductos.length + 1,
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
  carritoECO.idusuario = idusuario
  carritoECO.idempresa = idempresa_md5()
  carritoECO.divisa = divisaActiva.id // Asegúrate de que la divisa activa esté cargada
  carritoECO.listaProductos.push(nuevoProducto)
  carritoECO.codigosUnicos = [...carritoECO.codigosUnicos, ...CodigosUnicosSeleccionados.value]
  calcularTotalesCarrito()
  listaProductosDisponibles() // Recargar la lista de productos disponibles para excluir el añadido
  resetProductoInputs()
}

function eliminarProductoCarrito(idProductoAlmacen) {
  carritoECO.listaProductos = carritoECO.listaProductos.filter(
    (p) => p.idproductoalmacen !== idProductoAlmacen,
  )
  calcularTotalesCarrito()
  listaProductosDisponibles() // Recargar la lista de productos disponibles
}
const validarDescripcion = async (scope, row) => {
  console.log(scope.value)

  if (carritoECO && carritoECO.listaProductos) {
    carritoECO.listaProductos = carritoECO.listaProductos.map((prod) => {
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
  carritoECO.subtotal = carritoECO.listaProductos.reduce((sub, producto) => {
    const precio = parseFloat(producto.precio)
    const cantidad = parseFloat(producto.cantidad)
    return sub + precio * cantidad
  }, 0)

  if (carritoECO.subtotal === 0) {
    carritoECO.descuento = 0
  }
  carritoECO.ventatotal = carritoECO.subtotal - carritoECO.descuento

  // Asegurar dos decimales
  carritoECO.subtotal = redondear(carritoECO.subtotal)
  carritoECO.ventatotal = redondear(carritoECO.ventatotal)
  carritoECO.descuento = redondear(carritoECO.descuento)
}

function aplicarDescuento() {
  if (carritoECO.descuento > carritoECO.subtotal) {
    $q.notify({
      type: 'warning',
      message: 'El descuento sobrepasa el subtotal.',
      actions: [{ icon: 'close', color: 'white', round: true }],
    })
    carritoECO.descuento = carritoECO.subtotal // Ajustar descuento al subtotal máximo divisa Proforma
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

function prepararPayload() {
  const payload = {
    cotizacion: {
      id_cotizacion: props.idCotizacion,
      fecha_cotizacion: fecha.value,
      monto_total: carritoECO.ventatotal,
      descuento: carritoECO.descuento,
      cliente_id_cliente: idclienteCO.value,
      divisas_id_divisas: divisaActiva.id,
      id_usuario: idusuario_md5(),
      idsucursal: idsucursalCOS.value,
      estado: originalCotizacion.value?.estado || 0,
      idpv: puntoVenta.value?.value || puntoVenta.value,
      idcanal: originalCotizacion.value?.idcanal || null,
      num: originalCotizacion.value?.num || null,
      id_almacen: filtroAlmacenCO.value,
      condicion: tipoOperacion.value?.value,
      fecha_registro: originalCotizacion.value?.fecha_registro || null,
    },
    detalle_cotizacion: {
      antiguos: [],
      nuevos: [],
      eliminados: [],
    },
  }

  // 1. Detectar detalles eliminados
  originalDetalle.value.forEach((orig) => {
    const stillExists = carritoECO.listaProductos.find(
      (p) => Number(p.iddetalle) === Number(orig.id),
    )
    if (!stillExists) {
      payload.detalle_cotizacion.eliminados.push({ id_detalle_cotizacion: orig.id })
    }
  })

  // 2. Clasificar actuales entre antiguos y nuevos
  carritoECO.listaProductos.forEach((prod) => {
    if (prod.iddetalle) {
      // Registro Antiguo
      const origItem = originalDetalle.value.find((o) => Number(o.id) === Number(prod.iddetalle))

      const itemAntiguo = {
        id_detalle_cotizacion: prod.iddetalle,
        cantidad: prod.cantidad,
        precio: prod.precio,
        productos_almacen_id_productos_almacen: prod.idproductoalmacen,
        descripcionAdicional: prod.descripcionAdicional,
        categoria: prod.idporcentaje,
        codigosUnicos: {
          antiguos: [],
          eliminados: [],
        },
      }

      // Detectar cambios en códigos únicos para este detalle antiguo
      const currentCodes = prod.codigosUnicos || []
      const originalCodes = Array.isArray(origItem?.codigosUnicos) ? origItem.codigosUnicos : []

      // Códigos que siguen presentes (pueden ser antiguos con idhistorial o "nuevos" agregados al editar)
      currentCodes.forEach((code) => {
        itemAntiguo.codigosUnicos.antiguos.push({
          id: code.id,
          serie: code.serie || code.codigo_unico,
          estado: code.estado,
          idhistorial: code.idhistorial || null,
        })
      })

      // Códigos eliminados (estaban en el original pero ya no están en la lista actual)
      originalCodes.forEach((origCode) => {
        const stillInList = currentCodes.find((c) => Number(c.id) === Number(origCode.id))
        if (!stillInList && (origCode.idhistorial || origCode.id_historial)) {
          itemAntiguo.codigosUnicos.eliminados.push({
            idhistorial: origCode.idhistorial || origCode.id_historial,
          })
        }
      })

      payload.detalle_cotizacion.antiguos.push(itemAntiguo)
    } else {
      // Registro Nuevo
      payload.detalle_cotizacion.nuevos.push({
        cantidad: prod.cantidad,
        productos_almacen_id_productos_almacen: prod.idproductoalmacen,
        precio: prod.precio,
        descripcionAdicional: prod.descripcionAdicional,
        categoria: prod.idporcentaje,
        codigosUnicos: (prod.codigosUnicos || []).map((code) => ({
          id: code.id,
          serie: code.serie || code.codigo_unico,
          estado: code.estado,
        })),
      })
    }
  })

  return payload
}

// --- Envío de Datos ---

async function enviarDatos() {
  if (!props.idCotizacion) return

  const isValid = await cotizacionFormRef.value.validate()
  if (!isValid) {
    $q.notify({
      type: 'info',
      message: 'Por favor, complete todos los campos requeridos.',
      actions: [{ icon: 'close', color: 'white', round: true }],
    })
    return
  }

  const isValidCliente = await formClientes.value.validate()
  if (!isValidCliente) {
    $q.notify({
      type: 'info',
      message: 'Por favor, complete todos los campos requeridos.',
      actions: [{ icon: 'close', color: 'white', round: true }],
    })
    return
  }

  if (carritoECO.listaProductos.length === 0) {
    $q.notify({
      type: 'info',
      message: 'Debe añadir al menos un producto a la cotización.',
      actions: [{ icon: 'close', color: 'white', round: true }],
    })
    return
  }

  // Preparar el payload estructurado
  const payload = prepararPayload()

  // Añadir información adicional de pago y firma al objeto cotizacion si es necesario
  // (Opcional, dependiendo de si el backend procesa estos campos)
  payload.cotizacion.idfirma = carritoECO.idfirma
  payload.cotizacion.cajabanco = idcajaBancoSeleccionada.value
  payload.cotizacion.tipopago = carritoECO.credito ? 'credito' : 'contado'
  payload['ver'] = 'editarCotizacion'
  if (carritoECO.credito) {
    payload.cotizacion.cantidadPagos = carritoECO.cantidadPagos
    payload.cotizacion.periodo = carritoECO.periodo
    payload.cotizacion.fechaLimite = carritoECO.fechaLimite
  }

  console.log('Payload estructurado para el backend:', payload)

  $q.loading.show({
    message: 'Actualizando cotización...',
  })

  try {
    // Se envía el payload estructurado directamente como JSON
    // Ajustar el endpoint según la configuración de tu API (ej: 'actualizarCotizacion' o props.idCotizacion)
    const response = await api.post('', payload)
    const data = response.data
    console.log('Respuesta del backend:', data)

    if (data.estado === 'ok') {
      $q.notify({
        type: 'positive',
        message: 'Cotización actualizada exitosamente.',
      })
      emit('saved')
      // resetFormulario() // Opcional dependiendo de si quieres cerrar o mantener la vista
    } else {
      $q.notify({
        type: 'negative',
        message: data.mensaje || 'Error al actualizar la cotización.',
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
  carritoECO.ventatotal = 0
  carritoECO.subtotal = 0
  carritoECO.descuento = 0
  carritoECO.listaProductos = []
  localStorage.removeItem('carritoECO')
  carritoECO.metodoPago = 0
  carritoECO.pagosDivididos = []
  pagosDivididos.value = []

  // Recargar listas dependientes si es necesario
  listaAlmacenes()
  listaCLientes()
}

// --- Comprobante ---
// async function enviarCorreo(id) {
//   console.log(id)
// }
// function open(pos, idcot, data) {
//   position.value = pos
//   dialog.value = true
//   idcliente.value = idcot
//   detallesCotizacion.value = data
//   console.log(idcliente.value, detallesCotizacion.value)

//   return new Promise((resolve) => {
//     resolver = resolve
//   })
// }
// async function generarComprobante(id) {
//   // Después que el usuario confirma el primer diálogo

//   const contenidousuario = await getUserData()
//   const idempresa = contenidousuario?.empresa?.idempresa
//   console.log(idempresa)
//   if (!idempresa) {
//     $q.notify({
//       type: 'negative',
//       message: 'Error: No se pudo obtener la empresa para el comprobante.',
//     })
//     return
//   }

//   $q.loading.show({
//     message: 'Generando comprobante...',
//   })

//   try {
//     const response = await api.get(`detallesCotizacion/${id}/${idempresa}`)
//     const data = response.data
//     console.log('Comprobante Data:', response)

//     if (data[0] === 'error') {
//       console.error(data.error)
//       $q.notify({ type: 'negative', message: 'Error al cargar los detalles del comprobante.' })
//     } else {
//       // Cargar leyendas si no están cargadas
//       if (leyendasCotizacion.value.length === 0) {
//         await cargarLeyendasCotizacion()
//       }
//       const doc = await generarPdfCotizacion(data)
//       pdfData.value = doc.output('dataurlstring')
//       mostrarModal.value = true
//       console.log(data[0]?.cliente.idcliente, data)
//       open('right', data[0]?.cliente.idcliente, data)
//     }
//   } catch (error) {
//     console.error('Error al generar comprobante:', error)
//     $q.notify({ type: 'negative', message: 'Hubo un error al generar el comprobante.' })
//   } finally {
//     $q.loading.hide()
//   }
// }
const confirmar = (idcliente, data) => {
  resolver?.(true)
  //JSON.parse(JSON.stringify(detalleVenta.value))
  const detalle = JSON.parse(JSON.stringify(data))
  console.log('Confirmado', idcliente, detalle)
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
      label: item.codigo + ' ' + item.tipo_cuenta,
      value: item.idcaja_bancos,
      codigo: item.codigo, // Guardamos el código por separado
      nombre: item.tipo_cuenta, // Guardamos el nombre por separado
    }))
    console.log(listaCajaBancos.value)
  } catch (error) {
    console.error('Error al cargar caja bancos:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar caja Bancos' })
  }
}

const loadData = async () => {
  if (!props.idCotizacion) return

  $q.loading.show({
    message: 'Cargando datos de la cotización...',
    spinnerColor: 'primary',
  })

  try {
    const respDet = await api.get(`detallesCotizacion/${props.idCotizacion}/${idempresa}`)
    const data = respDet.data
    console.log('Detalles de Cotización:', data)

    if (data && Array.isArray(data) && data.length > 0) {
      const info = data[0]
      const { cotizacion, cliente, almacen, detalle } = info

      // Guardar estado original para detección de cambios al enviar
      originalCotizacion.value = JSON.parse(JSON.stringify(cotizacion))
      originalDetalle.value = JSON.parse(JSON.stringify(detalle))

      // 1. Limpiar el estado del carrito y formularios de productos
      resetProductoInputs()
      carritoECO.listaProductos = []
      carritoECO.descuento = 0
      localStorage.removeItem('carritoECO')

      // 2. Poblado de datos de la cotización
      if (cotizacion) {
        fecha.value = cotizacion.fecha

        // Asignar tipoOperacion priorizando el campo tipoOperacion de la API
        const opValue =
          cotizacion.tipoOperacion !== null && cotizacion.tipoOperacion !== undefined
            ? Number(cotizacion.tipoOperacion)
            : Number(cotizacion.condicion)

        tipoOperacion.value =
          optionOperacion.value.find((o) => Number(o.value) === opValue) || optionOperacion.value[0]
      }

      // 3. Almacén y dependencias (Punto de Venta y Categorías)
      if (almacen && almacen.idalmacen) {
        filtroAlmacenCO.value = Number(almacen.idalmacen)
        await listaCategoria() // Gatilla la carga de categorías y puntos de venta

        if (cotizacion && cotizacion.idpv) {
          puntoVenta.value = Number(cotizacion.idpv)
        }
      }

      // 4. Cliente y Sucursal
      if (cliente && cliente.idcliente) {
        if (clientesOptions.value.length === 0) await listaCLientes()

        const clientObj = clientesOptions.value.find(
          (c) => Number(c.id) === Number(cliente.idcliente),
        )
        if (clientObj) {
          selectedClient.value = clientObj
          idclienteCO.value = clientObj.id

          await selectSucursal(clientObj.id)
          const sucursalObj = sucursalesOptions.value.find(
            (s) => Number(s.id) === Number(cliente.idsucursal),
          )
          if (sucursalObj) {
            selectedSucursal.value = sucursalObj
            idsucursalCOS.value = sucursalObj.id
          }
        }
      }

      // 5. Poblar carrito con el detalle recibido
      if (Array.isArray(detalle)) {
        carritoECO.listaProductos = detalle.map((item, index) => {
          const cantidad = parseFloat(item.cantidad) || 0
          const disponible = parseFloat(item.disponible) || 0

          return {
            num: index + 1,
            iddetalle: item.id,
            idproductoalmacen: item.idproductoalmacen,
            cantidad: cantidad,
            precio: parseFloat(item.precio) || 0,
            idstock: item.idstock,
            idporcentaje: item.categoria,
            candiponible: disponible,
            descripcion: item.producto || 'Sin descripción',
            descripcionAdicional: item.descripcionAdicional || '',
            codigo: item.codigoProducto || '',
            despachado: disponible === 0 || disponible < cantidad ? 2 : 1,
            codigosUnicos: Array.isArray(item.codigosUnicos)
              ? item.codigosUnicos.map((c) => ({
                  ...c,
                  serie: c.serie || c.codigo_unico, // Normalizar nombre del campo de serie
                }))
              : [],
          }
        })

        // Sincronizar categoría de precio si hay items
        if (detalle.length > 0 && detalle[0].categoria) {
          filtroCategoriaCO.value = Number(detalle[0].categoria)
        }
      }

      // 6. Cálculos de totales y descuentos
      if (cotizacion) {
        carritoECO.descuento = parseFloat(cotizacion.descuento) || 0
      }
      calcularTotalesCarrito()

      // 7. Persistencia
      localStorage.setItem('carritoECO', JSON.stringify(carritoECO))

      console.log('Cotización cargada y mapeada correctamente')
    }
  } catch (error) {
    console.error('Error al cargar la cotización:', error)
    $q.notify({
      type: 'negative',
      message: 'Hubo un error al recuperar los datos de la cotización.',
    })
  } finally {
    $q.loading.hide()
  }
}
// --- Inicialización ---
onMounted(async () => {
  localStorage.removeItem('carritoECO') // Limpiar localStorage al inicio
  // Cargar datos iniciales
  await divisaEmonedaActiva()
  await leyendaActiva() // Aunque no se use directamente, la lógica original la carga.
  await listaAlmacenes()
  await listaCLientes()
  await listaProductosDisponibles() // Cargar productos inicialmente
  await cargarLeyendasCotizacion() // Cargar leyendas para el comprobante
  await cargarMetodoPagoFactura()
  await permisosStore.cargarPermisos()
  await loadData()

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
.responsive-dialog {
  display: flex;
  flex-direction: column;
}

.premium-input :deep(.q-field__control) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

/* Estilo para que la barra de scroll sea más discreta en navegadores webkit */
.scroll::-webkit-scrollbar {
  width: 6px;
}
.scroll::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}
.scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.saas-cotizacion-editor {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 32px;
  background: #f8fafc;
  min-height: 100vh;
}

/* Header Section */
.header-section {
  animation: fadeInDown 0.5s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.15);
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.3px;
  margin: 0;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 14px;
  margin-top: 4px;
  font-weight: 400;
}

/* Card Styles */
.data-card {
  border-radius: 20px;
  background: white;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.03);
  transition: box-shadow 0.2s ease;
  overflow: hidden;
}

.data-card:hover {
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.03);
}

.card-header {
  background: linear-gradient(135deg, #0b6d5d 0%, #004d40 100%);
  padding: 16px 32px;
  border-bottom: none;
}

.card-header-title {
  color: white;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.card-content {
  padding: 32px;
}

/* Form Elements */
.field-label {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.required-star {
  color: #ef4444;
  margin-left: 2px;
}

.saas-input {
  width: 100%;
}

.saas-input :deep(.q-field__control) {
  border-radius: 10px;
  transition: all 0.2s ease;
  background-color: white;
}

.saas-input :deep(.q-field__control:hover) {
  border-color: #1976d2;
}

.saas-input :deep(.q-field__control--focused) {
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

.saas-input :deep(.q-field__native) {
  font-size: 14px;
}

.icon-btn {
  height: 40px;
  width: 44px;
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.icon-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(25, 118, 210, 0.2);
}

/* Separator */
.section-divider {
  background: linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 50%, #e2e8f0 100%);
  height: 1px;
}

/* Tooltip */
.tooltip-custom {
  background: #1e293b;
  font-size: 12px;
  border-radius: 8px;
  padding: 4px 12px;
}

/* Utility Classes */
.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 16px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .saas-cotizacion-editor {
    padding: 16px;
  }

  .page-title {
    font-size: 22px;
  }

  .icon-wrapper {
    width: 48px;
    height: 48px;
  }

  .icon-wrapper q-icon {
    font-size: 22px;
  }

  .card-content {
    padding: 20px;
  }

  .card-header {
    padding: 14px 20px;
  }

  .field-label {
    font-size: 12px;
    margin-bottom: 6px;
  }
}

@media (max-width: 480px) {
  .saas-cotizacion-editor {
    padding: 12px;
  }

  .page-title {
    font-size: 20px;
  }

  .page-subtitle {
    font-size: 12px;
  }

  .card-content {
    padding: 16px;
  }
}

/* Smooth Transitions */
* {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Improved Focus States */
:deep(.q-field__control:focus-within) {
  border-color: #1976d2;
}

:deep(.q-btn:focus-visible) {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

.products-card {
  border-radius: 20px;
  background: white;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  margin-bottom: 32px;
}

/* Header Styles */
.card-header {
  background: linear-gradient(135deg, #047a67 0%, #004d40 100%);
  padding: 16px 24px;
}

.card-header-title {
  color: white;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

/* Content Section */
.card-content {
  padding: 24px;
  border-bottom: 1px solid #eef2f6;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.required-star {
  color: #ef4444;
  margin-left: 2px;
}

.unique-checkbox {
  margin-bottom: 0;
}

/* Input Styles */
.saas-input,
.stock-input {
  width: 100%;
}

.saas-input :deep(.q-field__control),
.stock-input :deep(.q-field__control) {
  border-radius: 10px;
  transition: all 0.2s ease;
}

.saas-input :deep(.q-field__control:hover) {
  border-color: #26a69a;
}

.saas-input :deep(.q-field__control--focused) {
  box-shadow: 0 0 0 2px rgba(38, 166, 154, 0.1);
}

.stock-input :deep(.q-field__control) {
  background-color: #f8fafc;
}

.currency-badge {
  background: #e2e8f0;
  color: #475569;
  font-weight: 700;
  font-size: 12px;
  padding: 0 8px;
  border-radius: 6px;
  height: 26px;
  line-height: 26px;
}

/* Add Button */
.add-button {
  border-radius: 10px;
  height: 40px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.add-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(38, 166, 154, 0.3);
}

/* Summary Header */
.summary-header {
  padding: 16px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #eef2f6;
}

.summary-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  letter-spacing: 0.3px;
}

/* Table Styles */
.products-table {
  background: white;
}

.products-table :deep(.q-table) {
  font-family: inherit;
}

.table-header {
  background: #f8fafc;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.5px;
}

.table-row {
  transition: background 0.2s ease;
  border-bottom: 1px solid #f1f5f9;
}

.table-row:hover {
  background: #fafcff;
}

.expanded-row-active {
  background: #f0f9ff;
  border-bottom: 1px solid #e0f2fe;
}

/* Badge Styles */
.num-badge {
  background: #f1f5f9;
  color: #475569;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
}

.code-badge {
  border: 1px solid #26a69a;
  color: #26a69a;
  background: transparent;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 12px;
}

.quantity-badge {
  background: #26a69a;
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
}

/* Product Description */
.product-description {
  font-weight: 600;
  color: #0f172a;
  font-size: 14px;
  margin-bottom: 6px;
}

.additional-note {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.08);
  padding: 4px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px dashed rgba(59, 130, 246, 0.3);
}

.additional-note:hover {
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.5);
}

/* Price and Total Styles */
.price-value,
.total-value {
  font-weight: 600;
  font-size: 14px;
}

.price-value {
  color: #475569;
}

.total-value {
  color: #3b82f6;
}

.currency-symbol {
  font-size: 11px;
  color: #94a3b8;
  margin-left: 3px;
  font-weight: 400;
}

/* Summary Rows */
.summary-row {
  border-top: 1px solid #eef2f6;
}

.summary-row.subtotal td {
  padding-top: 16px;
}

.summary-row.total td {
  padding: 20px 0;
}

.summary-label {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}

.discount-input {
  max-width: 140px;
  margin-left: auto;
}

.discount-input :deep(.q-field__control) {
  border-radius: 8px;
}

.discount-badge {
  background: #ef4444;
  color: white;
  font-weight: 700;
  font-size: 11px;
  padding: 0 6px;
  border-radius: 6px;
  height: 22px;
  line-height: 22px;
}

.total-label {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.5px;
}

.total-amount {
  font-size: 22px;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.total-currency {
  font-size: 14px;
  font-weight: 500;
  margin-left: 4px;
  opacity: 0.9;
}

.summary-row.total {
  background: linear-gradient(90deg, #1976d2 0%, #1e88e5 100%);
  color: white;
}

/* Action Section */
.action-section {
  padding: 20px 24px;
  background: #f8fafc;
  border-top: 1px solid #eef2f6;
}

.action-btn-outline {
  border-radius: 10px;
  padding: 8px 20px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.action-btn-outline:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-btn-primary {
  border-radius: 12px;
  padding: 8px 20px;
  font-weight: 700;
  background: linear-gradient(45deg, #1976d2, #42a5f5);
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
}

.action-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.4);
}

.action-btn-primary:active {
  transform: translateY(0);
}

/* Delete Button */
.delete-btn {
  transition: all 0.2s ease;
}

.delete-btn:hover {
  transform: scale(1.1);
}

/* Expand Button */
.expand-btn {
  transition: transform 0.2s ease;
}

.expand-btn:hover {
  transform: scale(1.1);
}

.expanded-row {
  background: #f0f9ff;
}

/* Tooltips */
.tooltip-secondary {
  background: #26a69a;
  font-size: 12px;
  border-radius: 8px;
  padding: 4px 12px;
}

.tooltip-negative {
  background: #ef4444;
  font-size: 12px;
  border-radius: 8px;
  padding: 4px 12px;
}

/* Utility Classes */
.gap-2 {
  gap: 8px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .card-header {
    padding: 12px 16px;
  }

  .card-content {
    padding: 16px;
  }

  .summary-header {
    padding: 12px 16px;
  }

  .action-section {
    padding: 16px;
  }

  .action-btn-primary {
    padding: 8px 20px;
  }

  .total-amount {
    font-size: 18px;
  }

  .total-label {
    font-size: 14px;
  }

  .product-description {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .card-content {
    padding: 12px;
  }

  .action-section .row {
    flex-direction: column;
    gap: 12px;
  }

  .action-btn-outline,
  .action-btn-primary {
    width: 100%;
  }

  .discount-input {
    max-width: 120px;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.products-card {
  animation: fadeIn 0.4s ease-out;
}

/* Smooth Transitions */
* {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Focus States */
:deep(.q-field__control:focus-within) {
  border-color: #26a69a;
}

:deep(.q-btn:focus-visible) {
  outline: 2px solid #26a69a;
  outline-offset: 2px;
}

/* Table Cell Alignment */
:deep(.q-table td) {
  padding: 12px 8px;
}

:deep(.q-table th) {
  padding: 12px 8px;
}
</style>
