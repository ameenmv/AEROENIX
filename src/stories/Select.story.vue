<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/uic/select'
</script>

<template>
  <Story title="Select" group="inputs" icon="lucide:list">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="max-w-xs">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Fruits</SelectLabel>
                  <SelectItem value="apple">
                    Apple
                  </SelectItem>
                  <SelectItem value="banana">
                    Banana
                  </SelectItem>
                  <SelectItem value="grape">
                    Grape
                  </SelectItem>
                  <SelectItem value="orange">
                    Orange
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div class="max-w-xs">
            <Select disabled>
              <SelectTrigger>
                <SelectValue placeholder="Disabled select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">
                  Item
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="max-w-xs">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Fruits</SelectLabel>
                  <SelectItem value="apple">
                    Apple
                  </SelectItem>
                  <SelectItem value="banana">
                    Banana
                  </SelectItem>
                  <SelectItem value="grape">
                    Grape
                  </SelectItem>
                  <SelectItem value="orange">
                    Orange
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div class="max-w-xs">
            <Select disabled>
              <SelectTrigger>
                <SelectValue placeholder="Disabled select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">
                  Item
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
