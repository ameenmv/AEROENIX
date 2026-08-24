<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ msg: string }>()
const count = ref(0)
</script>

<template>
  <h1>{{ msg }}</h1>
  <div class="card">
    <button type="button" @click="count++">
      {{ $t('common.count is') }}
      {{ count }}
    </button>
    <p>
      {{ $t('common.Edit') }}
      <code>{{ $t('common.components/HelloWorld.vue') }}</code>{{ $t('common.to test HMR') }}
    </p>
  </div>
  <p>
    {{ $t('common.Check out') }}
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank">{{
      $t('common.create-vue')
    }}</a>{{ $t('common., the official Vue + Vite starter') }}
  </p>
  <p>
    {{ $t('common.Learn more about IDE Support for Vue in the') }}
    <a href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support" target="_blank">{{
      $t('common.Vue Docs Scaling up Guide')
    }}</a>.
  </p>
  <p class="read-the-docs">
    {{ $t('common.Click on the Vite and Vue logos to learn more') }}
  </p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
