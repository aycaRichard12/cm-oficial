<template>
  <div class="box" :class="color">
    <q-card flat bordered class="col">
      <q-item>
        <q-item-section avatar>
          <q-avatar>
            <q-icon :name="icon" :color="color" size="lg" />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ title }}</q-item-label>
          <q-item-label caption>{{ data.titulo || title }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section></q-item-section>
        <q-item-section>
          <q-btn flat :style="{ color }" label="ok" :to="to" v-if="to" />
        </q-item-section>
      </q-item>
    </q-card>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  icon: String,
  color: String,
  title: String,
  data: Object,
  to: String,
})
</script>

<style lang="scss" scoped>
.box {
  flex: 1;
  &.green {
    background-color: green;
  }
  &.yellow {
    background-color: yellow;
  }
  &.red {
    background-color: red;
  }
}
</style>
