<script setup lang="ts">
import {
  AttachmentIcon,
  HappyIcon,
  LockKeyIcon,
  MailSend01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons'
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
  takeOver: []
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
  <div class="px-4 py-3.5 border-t border-border/50 bg-card/80 backdrop-blur-xl flex flex-col gap-2 shrink-0 relative">
    
    <!-- AI Locked Banner with Quick Takeover Action -->
    <transition
      enter-active-class="transition duration-200 ease-out transform"
      enter-from-class="opacity-0 -translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-150 ease-in transform"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-2 scale-95"
    >
      <div
        v-if="isLocked"
        class="flex items-center justify-between gap-3 text-xs text-amber-400 font-medium px-4 py-2 bg-amber-500/10 rounded-xl w-full border border-amber-500/25 shadow-xs"
      >
        <div class="flex items-center gap-2 truncate">
          <HugeiconsIcon :icon="LockKeyIcon" :size="15" class="shrink-0" />
          <span class="truncate">{{ t('conversations.input_locked', 'Input is locked while AI is active.') }}</span>
        </div>
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px] transition-colors shrink-0 cursor-pointer"
          @click="emit('takeOver')"
        >
          <HugeiconsIcon :icon="UserGroupIcon" :size="13" />
          <span>{{ t('conversations.take_over_to_reply', 'Take Over to Reply') }}</span>
        </button>
      </div>
    </transition>

    <div class="flex items-center gap-2">
      <!-- Attachment Button -->
      <button 
        type="button"
        class="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground shrink-0 border border-border/40 disabled:opacity-40"
        :disabled="isLocked"
      >
        <HugeiconsIcon :icon="AttachmentIcon" :size="19" />
      </button>

      <!-- Emoji Popover -->
      <Popover>
        <PopoverTrigger as-child>
          <button 
            type="button"
            class="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-muted/60 transition-colors shrink-0 text-muted-foreground hover:text-foreground border border-border/40 disabled:opacity-40"
            :disabled="isLocked"
          >
            <HugeiconsIcon :icon="HappyIcon" :size="19" />
          </button>
        </PopoverTrigger>
        <PopoverContent class="p-0 border border-border/60 rounded-2xl overflow-hidden shadow-xl bg-card" align="start" :side-offset="8">
          <EmojiPicker :native="true" @select="handleEmojiSelect" />
        </PopoverContent>
      </Popover>

      <!-- Input Field -->
      <Input
        :model-value="newMessage"
        type="text"
        :placeholder="t('conversations.type_message', 'Type here...')"
        class="flex-1 h-11 rounded-xl bg-muted/30 border-border/50 text-sm px-4 transition-all focus:bg-card focus:border-primary/50"
        :disabled="isLocked"
        @update:model-value="emit('update:newMessage', $event as string)"
        @keyup.enter="handleSend"
      />

      <!-- Send Button -->
      <Button
        class="gap-2 rounded-xl h-11 px-5 bg-primary text-primary-foreground shadow-xs shadow-primary/25 hover:shadow-md hover:shadow-primary/30 transition-all text-sm font-semibold shrink-0 cursor-pointer disabled:opacity-50"
        :disabled="!newMessage.trim() || isSending || isLocked"
        @click="handleSend"
      >
        <HugeiconsIcon :icon="MailSend01Icon" :size="17" />
        <span class="hidden sm:inline">{{ t('conversations.reply', 'Reply') }}</span>
      </Button>
    </div>
  </div>
</template>
