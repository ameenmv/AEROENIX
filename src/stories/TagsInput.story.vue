<script setup lang="ts">
import { ref } from 'vue'
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
} from '@/components/uic/tags-input'

const tags = ref(['Vue', 'TypeScript', 'Tailwind'])
const emptyTags = ref<string[]>([])
</script>

<template>
  <Story title="TagsInput" group="inputs" icon="lucide:tags">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="max-w-md space-y-4">
            <TagsInput v-model="tags">
              <TagsInputItem v-for="item in tags" :key="item" :value="item">
                <TagsInputItemText />
                <TagsInputItemDelete />
              </TagsInputItem>
              <TagsInputInput placeholder="Add tag..." />
            </TagsInput>
            <p class="text-xs text-muted-foreground">
              Empty:
            </p>
            <TagsInput v-model="emptyTags">
              <TagsInputItem v-for="item in emptyTags" :key="item" :value="item">
                <TagsInputItemText />
                <TagsInputItemDelete />
              </TagsInputItem>
              <TagsInputInput placeholder="Type and press Enter..." />
            </TagsInput>
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="max-w-md space-y-4">
            <TagsInput v-model="tags">
              <TagsInputItem v-for="item in tags" :key="item" :value="item">
                <TagsInputItemText />
                <TagsInputItemDelete />
              </TagsInputItem>
              <TagsInputInput placeholder="Add tag..." />
            </TagsInput>
            <p class="text-xs text-muted-foreground">
              Empty:
            </p>
            <TagsInput v-model="emptyTags">
              <TagsInputItem v-for="item in emptyTags" :key="item" :value="item">
                <TagsInputItemText />
                <TagsInputItemDelete />
              </TagsInputItem>
              <TagsInputInput placeholder="Type and press Enter..." />
            </TagsInput>
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
