<template>
  <div class="row q-col-gutter-md q-mb-lg">
    <div class="col-12 col-sm-4">
      <q-card flat bordered class="bg-primary text-white">
        <q-card-section>
          <div class="row items-center">
            <q-icon name="store" size="2rem" class="q-mr-md" />
            <div>
              <div class="text-h6">{{ loading ? '...' : totalSmall }}</div>
              <div class="text-caption">{{ $t('ui.sucursales-empresa-74002c') }}</div>
            </div>
          </div>
        </q-card-section>
        <q-inner-loading :showing="loading">
          <q-spinner color="white" />
        </q-inner-loading>
      </q-card>
    </div>
    <div class="col-12 col-sm-4">
      <q-card flat bordered class="bg-secondary text-white">
        <q-card-section>
          <div class="row items-center">
            <q-icon name="apartment" size="2rem" class="q-mr-md" />
            <div>
              <div class="text-h6">{{ loading ? '...' : totalBig }}</div>
              <div class="text-caption">{{ $t('ui.sucursales-sin-d57c67') }}</div>
            </div>
          </div>
        </q-card-section>
        <q-inner-loading :showing="loading">
          <q-spinner color="white" />
        </q-inner-loading>
      </q-card>
    </div>
    <div class="col-12 col-sm-4">
      <q-card flat bordered class="bg-positive text-white">
        <q-card-section>
          <div class="row items-center">
            <q-icon name="link" size="2rem" class="q-mr-md" />
            <div>
              <div class="text-h6">{{ loading ? '...' : totalAssigned }}</div>
              <div class="text-caption">{{ $t('ui.asignadas-c5e188') }}</div>
            </div>
          </div>
        </q-card-section>
        <q-inner-loading :showing="loading">
          <q-spinner color="white" />
        </q-inner-loading>
      </q-card>
    </div>
  </div>
</template>

<script setup>
defineProps({
  totalSmall: Number,
  totalBig: Number,
  totalAssigned: Number,
  loading: Boolean,
})
</script>
