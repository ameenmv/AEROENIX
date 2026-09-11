<script setup lang="ts">
import { MailSend01Icon, LockKeyIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/uic/button'
import { Input } from '@/components/uic/input'

const props = defineProps<{
  newMessage: string
  isSending: boolean
  isLocked: boolean
}>()

const emit = defineEmits<{
  'update:newMessage': [value: string]
  sendMessage: []
}>()

const { t } = useI18n()

function handleSend() {
  if (!props.newMessage.trim() || props.isSending || props.isLocked) return
  emit('sendMessage')
}
</script>

<template>
  <div class="px-4 py-3 border-t border-border/50 bg-background/80 backdrop-blur-md flex flex-col gap-2 shrink-0">
    <div v-if="isLocked" class="flex items-center gap-2 text-xs text-amber-500 font-medium px-2 py-1 bg-amber-500/10 rounded-md">
      <HugeiconsIcon :icon="LockKeyIcon" :size="14" />
      <span>{{ t('conversations.input_locked', 'Input is locked while AI is active.') }}</span>
    </div>
    <div class="flex items-center gap-3">
      <Input
        :model-value="newMessage"
        type="text"
        :placeholder="t('conversations.type_message', 'Type here...')"
        class="flex-1 h-11 rounded-full bg-muted/40 border-border/50 text-sm px-5 transition-colors focus:bg-background"
        :disabled="isLocked"
        @update:model-value="emit('update:newMessage', $event as string)"
        @keyup.enter="handleSend"
      />
      <Button
        class="gap-2 rounded-full h-11 px-6 bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-all text-sm font-semibold"
        :disabled="!newMessage.trim() || isSending || isLocked"
        @click="handleSend"
      >
        <HugeiconsIcon :icon="MailSend01Icon" :size="16" />
        <span class="hidden sm:inline">{{ t('conversations.reply', 'Reply') }}</span>
      </Button>
    </div>
  </div>
</template>
