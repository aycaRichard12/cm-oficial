<template>
  <q-card flat class="full-height bg-white shadow-1">
    <q-card-section>
      <div class="text-h6 q-mb-md text-primary row items-center">
        <q-icon name="widgets" class="q-mr-sm" />
        <div>Módulos Impactados</div>
      </div>

      <q-separator class="q-mb-md" />

      <div class="row q-col-gutter-md">
        <div class="col-6" v-for="(mod, idx) in modules" :key="idx">
          <q-card
            class="bg-blue-1 text-primary text-center shadow-2 cursor-pointer q-hoverable rounded-borders"
          >
            <q-card-section>
              <q-icon :name="mod.icon" size="3em" class="q-mb-sm text-primary" />
              <div class="text-weight-bold">
                {{ mod.name }}
              </div>
            </q-card-section>

            <q-tooltip class="bg-primary text-white text-body2">
              {{ mod.tooltip }}
            </q-tooltip>
          </q-card>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  modules: {
    type: Array,
    required: true,
    default: () => []
  }
})
</script>
