<script setup lang="ts">
import { MailSend01Icon, LockKeyIcon, HappyIcon, AttachmentIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/uic/button'
import { Input } from '@/components/uic/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/uic/popover'
import EmojiPicker from 'vue3-emoji-picker'
// @ts-ignore
import 'vue3-emoji-picker/css'

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

function handleEmojiSelect(emoji: any) {
  emit('update:newMessage', props.newMessage + emoji.i)
}

</script>

<template>
  <div class="px-4 py-3 border-t border-border/50 bg-background/95 backdrop-blur-md flex flex-col gap-2 shrink-0 relative rounded-b-2xl">
    
    <!-- AI Locked Indicator -->
    <div v-if="isLocked" class="flex items-center gap-2 text-xs text-amber-500 font-medium px-3 py-1.5 bg-amber-500/10 rounded-lg mx-auto w-fit mb-1">
      <HugeiconsIcon :icon="LockKeyIcon" :size="14" />
      <span>{{ t('conversations.input_locked', 'Input is locked while AI is active.') }}</span>
    </div>

    <div class="flex items-center gap-2">
      <!-- Attachment Button -->
      <button 
        class="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground shrink-0"
        :disabled="isLocked"
      >
        <HugeiconsIcon :icon="AttachmentIcon" :size="20" />
      </button>

      <!-- Emoji Button -->
      <Popover>
        <PopoverTrigger as-child>
          <button 
            class="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted/60 transition-colors shrink-0 text-muted-foreground hover:text-foreground"
            :disabled="isLocked"
          >
            <HugeiconsIcon :icon="HappyIcon" :size="20" />
          </button>
        </PopoverTrigger>
        <PopoverContent class="p-0 border-none bg-transparent shadow-none" align="start" :side-offset="8">
          <EmojiPicker :native="true" @select="handleEmojiSelect" />
        </PopoverContent>
      </Popover>

      <!-- Input Field -->
      <Input
        :model-value="newMessage"
        type="text"
        :placeholder="t('conversations.type_message', 'Type here...')"
        class="flex-1 h-12 rounded-full bg-muted/40 border-border/50 text-[14px] px-5 transition-colors focus:bg-background focus:ring-1 focus:ring-primary/50"
        :disabled="isLocked"
        @update:model-value="emit('update:newMessage', $event as string)"
        @keyup.enter="handleSend"
      />

      <!-- Send Button -->
      <Button
        class="gap-2 rounded-full h-12 px-6 bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-all text-sm font-semibold shrink-0"
        :disabled="!newMessage.trim() || isSending || isLocked"
        @click="handleSend"
      >
        <HugeiconsIcon :icon="MailSend01Icon" :size="18" />
        <span class="hidden sm:inline">{{ t('conversations.reply', 'Reply') }}</span>
      </Button>
    </div>
  </div>
</template>
