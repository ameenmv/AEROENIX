<script setup lang="ts">
import { ref } from 'vue'
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from '@/components/uic/native-select'

const selected = ref('')
</script>

<template>
  <Story title="NativeSelect" group="inputs" icon="lucide:list">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="max-w-xs space-y-4">
            <NativeSelect v-model="selected">
              <NativeSelectOption value="" disabled>
                Select a fruit…
              </NativeSelectOption>
              <NativeSelectOption value="apple">
                Apple
              </NativeSelectOption>
              <NativeSelectOption value="banana">
                Banana
              </NativeSelectOption>
              <NativeSelectOption value="grape">
                Grape
              </NativeSelectOption>
            </NativeSelect>
            <NativeSelect disabled>
              <NativeSelectOption>Disabled select</NativeSelectOption>
            </NativeSelect>
            <NativeSelect v-model="selected">
              <NativeSelectOptGroup label="Fruits">
                <NativeSelectOption value="apple">
                  Apple
                </NativeSelectOption>
                <NativeSelectOption value="banana">
                  Banana
                </NativeSelectOption>
              </NativeSelectOptGroup>
              <NativeSelectOptGroup label="Vegetables">
                <NativeSelectOption value="carrot">
                  Carrot
                </NativeSelectOption>
                <NativeSelectOption value="spinach">
                  Spinach
                </NativeSelectOption>
              </NativeSelectOptGroup>
            </NativeSelect>
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="max-w-xs space-y-4">
            <NativeSelect v-model="selected">
              <NativeSelectOption value="" disabled>
                Select a fruit…
              </NativeSelectOption>
              <NativeSelectOption value="apple">
                Apple
              </NativeSelectOption>
              <NativeSelectOption value="banana">
                Banana
              </NativeSelectOption>
              <NativeSelectOption value="grape">
                Grape
              </NativeSelectOption>
            </NativeSelect>
            <NativeSelect disabled>
              <NativeSelectOption>Disabled select</NativeSelectOption>
            </NativeSelect>
            <NativeSelect v-model="selected">
              <NativeSelectOptGroup label="Fruits">
                <NativeSelectOption value="apple">
                  Apple
                </NativeSelectOption>
                <NativeSelectOption value="banana">
                  Banana
                </NativeSelectOption>
              </NativeSelectOptGroup>
              <NativeSelectOptGroup label="Vegetables">
                <NativeSelectOption value="carrot">
                  Carrot
                </NativeSelectOption>
                <NativeSelectOption value="spinach">
                  Spinach
                </NativeSelectOption>
              </NativeSelectOptGroup>
            </NativeSelect>
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
