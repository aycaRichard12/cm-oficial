<template>
  <q-card
    flat
    class="q-mb-lg text-white shadow-3 rounded-borders overflow-hidden bg-primary q-mt-md"
  >
    <!-- Header -->
    <div class="row items-center justify-between q-px-xl q-py-md bg-primary">
      <div class="row items-center">
        <q-icon name="play_circle_filled" size="28px" class="q-mr-sm text-white" />
        <div class="text-subtitle1 text-weight-bold">{{ title }}</div>
      </div>

      <q-badge outline color="white" :label="badge" class="text-weight-medium" />
    </div>

    <!-- Video Container -->
    <div class="q-px-xl q-py-lg bg-grey-9">
      <q-responsive :ratio="16 / 9" style="max-height: 460px">
        <iframe
          :src="videoUrl"
          :title="title"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          class="fit rounded-borders"
        ></iframe>
      </q-responsive>
    </div>
  </q-card>
</template>

<script setup>
defineProps({
  videoUrl: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'Video de Novedades'
  },
  badge: {
    type: String,
    default: 'Actualización'
  }
})
</script>
