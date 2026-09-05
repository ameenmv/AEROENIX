<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Button } from '@/components/uic/button'
import { channelsService } from '@/services/channelsService'

const route = useRoute()

const status = ref<'loading' | 'success' | 'error'>('loading')
const errorMessage = ref<string>('')

function closeWindow() {
  if (window.opener) {
    window.close()
  }
}

async function processCallback() {
  const code = (route.query.code || new URLSearchParams(window.location.search).get('code')) as string
  const state = (route.query.state || new URLSearchParams(window.location.search).get('state')) as string

  // Detect provider from route params, path, or query
  const path = window.location.pathname.toLowerCase()
  let provider = (route.params.provider as string) || (route.query.provider as string) || ''
  if (!provider) {
    if (path.includes('whatsapp')) provider = 'whatsapp_business'
    else if (path.includes('instagram')) provider = 'instagram_professional'
    else if (path.includes('facebook') || path.includes('messenger')) provider = 'facebook_messenger'
    else provider = 'facebook_messenger' // default fallback
  }

  if (!code) {
    status.value = 'error'
    errorMessage.value = 'Authorization code was not found in the callback request.'
    if (window.opener) {
      window.opener.postMessage(
        { type: 'AEROENIX_CHANNEL_ERROR', message: errorMessage.value },
        '*',
      )
    }
    return
  }

  try {
    const data = await channelsService.handleOAuthCallback(provider, code, state || '')
    status.value = 'success'

    // Notify parent window & close popup window automatically
    if (window.opener) {
      window.opener.postMessage(
        { type: 'AEROENIX_CHANNEL_CONNECTED', data, provider },
        '*',
      )
      setTimeout(() => {
        window.close()
      }, 800)
    }
  } catch (err: any) {
    status.value = 'error'
    errorMessage.value = err?.message || 'Failed to complete channel authorization.'
    if (window.opener) {
      window.opener.postMessage(
        { type: 'AEROENIX_CHANNEL_ERROR', message: errorMessage.value },
        '*',
      )
    }
  }
}

onMounted(() => {
  processCallback()
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
    <div class="w-full max-w-md bg-card border border-border/50 rounded-2xl shadow-xl p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <!-- Icon Header -->
      <div class="w-16 h-16 rounded-full mx-auto flex items-center justify-center shadow-inner"
        :class="[
          status === 'loading'
            ? 'bg-primary/10 text-primary'
            : status === 'success'
              ? 'bg-emerald-500/10 text-emerald-500'
              : 'bg-red-500/10 text-red-500',
        ]"
      >
        <HugeiconsIcon
          v-if="status === 'loading'"
          :icon="Loading03Icon"
          :size="32"
          class="animate-spin text-primary"
        />
        <HugeiconsIcon
          v-else-if="status === 'success'"
          :icon="CheckmarkCircle02Icon"
          :size="32"
          class="text-emerald-500"
        />
        <HugeiconsIcon
          v-else
          :icon="Cancel01Icon"
          :size="32"
          class="text-red-500"
        />
      </div>

      <!-- Text State -->
      <div class="space-y-2">
        <h2 class="text-xl font-bold tracking-tight">
          {{
            status === 'loading'
              ? 'Completing Channel Authorization…'
              : status === 'success'
                ? 'Channel Connected Successfully!'
                : 'Connection Failed'
          }}
        </h2>
        <p class="text-xs text-muted-foreground leading-relaxed">
          {{
            status === 'loading'
              ? 'Please wait while we link your messaging channel to Aeroenix.'
              : status === 'success'
                ? 'Your channel has been linked. Closing window…'
                : errorMessage
          }}
        </p>
      </div>

      <!-- Action Footer -->
      <div v-if="status === 'error'" class="pt-2">
        <Button class="w-full gap-2" variant="outline" @click="closeWindow">
          <HugeiconsIcon :icon="Cancel01Icon" :size="16" />
          <span>Close Window</span>
        </Button>
      </div>
    </div>
  </div>
</template>
