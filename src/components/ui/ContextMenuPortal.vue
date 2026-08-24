<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import { useContextMenuPortal } from '@/composables/useContextMenu'

const { ctxMenuState, closeContextMenu } = useContextMenuPortal()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-150 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="ctxMenuState.show"
        class="fixed z-[9999] min-w-[180px] rounded-xl border border-border bg-popover p-1.5 shadow-xl"
        :style="{ left: `${ctxMenuState.x}px`, top: `${ctxMenuState.y}px` }"
        @click.stop
        @contextmenu.prevent
      >
        <template v-for="(action, i) in ctxMenuState.actions" :key="i">
          <div v-if="action.separator && i > 0" class="-mx-1 my-1 h-px bg-border" />
          <button
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer group"
            :class="
              action.variant === 'delete'
                ? 'text-destructive hover:bg-destructive/10 focus:bg-destructive/10'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            "
            @click="
              () => {
                action.onClick?.()
                closeContextMenu()
              }
            "
          >
            <div
              class="w-5 h-5 flex items-center justify-center shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
            >
              <HugeiconsIcon
                v-if="action.icon && typeof action.icon !== 'string'"
                :icon="action.icon as any"
                :size="15"
                :stroke-width="2"
              />
              <i
                v-else-if="typeof action.icon === 'string'"
                :class="action.icon"
                class="text-[13px]"
              />
            </div>
            <span class="capitalize leading-none">{{ action.label }}</span>
          </button>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>
