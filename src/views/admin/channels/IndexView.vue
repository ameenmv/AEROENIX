<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import {
  FacebookIcon,
  InformationCircleIcon,
  InstagramIcon,
  Link01Icon,
  WhatsappIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Button } from '@/components/uic/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/uic/card'
import { channelsService } from '@/services/channelsService'

const { t } = useI18n()

const isConnectingWhatsApp = ref(false)
const isConnectingInstagram = ref(false)
const isConnectingFacebook = ref(false)

function openOAuthPopup(url: string) {
  const width = 600
  const height = 700
  const left = window.screenX + (window.outerWidth - width) / 2
  const top = window.screenY + (window.outerHeight - height) / 2

  const popup = window.open(
    url,
    'channel_oauth_popup',
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`,
  )

  if (!popup) {
    toast.error('Popup blocked! Please allow popups for this site and try again.')
  }
}

async function handleConnectWhatsApp() {
  isConnectingWhatsApp.value = true
  try {
    const data = await channelsService.getWhatsAppAuthUrl()
    const targetUrl = data?.url || data?.auth_url
    if (targetUrl) {
      openOAuthPopup(targetUrl)
    } else {
      toast.error('Failed to generate WhatsApp connection link.')
    }
  } catch {
    toast.error('Unable to connect to WhatsApp at this time.')
  } finally {
    isConnectingWhatsApp.value = false
  }
}

async function handleConnectInstagram() {
  isConnectingInstagram.value = true
  try {
    const data = await channelsService.getInstagramAuthUrl()
    const targetUrl = data?.url || data?.auth_url
    if (targetUrl) {
      openOAuthPopup(targetUrl)
    } else {
      toast.error('Failed to generate Instagram connection link.')
    }
  } catch {
    toast.error('Unable to connect to Instagram at this time.')
  } finally {
    isConnectingInstagram.value = false
  }
}

async function handleConnectFacebook() {
  isConnectingFacebook.value = true
  try {
    const data = await channelsService.getFacebookAuthUrl()
    const targetUrl = data?.url || data?.auth_url
    if (targetUrl) {
      openOAuthPopup(targetUrl)
    } else {
      toast.error('Failed to generate Facebook connection link.')
    }
  } catch {
    toast.error('Unable to connect to Facebook at this time.')
  } finally {
    isConnectingFacebook.value = false
  }
}
</script>

<template>
  <div class="p-6 text-foreground min-h-[calc(100vh-(--spacing(16)))] bg-background">
    <div class="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">
            {{ t('menu.channels', 'Channel Integrations') }}
          </h1>
          <p class="text-muted-foreground mt-1 text-sm">
            Connect your hotel messaging channels to automate customer communications with AI.
          </p>
        </div>
      </div>

      <!-- Channels Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- WhatsApp Business -->
        <Card class="border-border/50 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <CardHeader>
            <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
              <HugeiconsIcon :icon="WhatsappIcon" :size="28" />
            </div>
            <CardTitle class="text-xl font-bold">WhatsApp Business</CardTitle>
            <CardDescription class="mt-2 text-sm leading-relaxed">
              Connect Meta WhatsApp Cloud API for automated booking inquiries, guest support, and automated follow-ups.
            </CardDescription>
          </CardHeader>
          <CardContent class="pt-4 border-t border-border/40 space-y-4">
            <div class="flex items-center justify-between text-xs">
              <span class="text-muted-foreground font-medium">Provider:</span>
              <span class="font-semibold text-foreground">Meta Cloud API</span>
            </div>
            <Button
              class="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
              :disabled="isConnectingWhatsApp"
              @click="handleConnectWhatsApp"
            >
              <HugeiconsIcon :icon="Link01Icon" :size="18" />
              <span>Connect WhatsApp</span>
            </Button>
          </CardContent>
        </Card>

        <!-- Instagram Professional -->
        <Card class="border-border/50 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <CardHeader>
            <div class="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center mb-4">
              <HugeiconsIcon :icon="InstagramIcon" :size="28" />
            </div>
            <CardTitle class="text-xl font-bold">Instagram Direct</CardTitle>
            <CardDescription class="mt-2 text-sm leading-relaxed">
              Connect your Instagram Professional or Business account to respond to DMs, story mentions, and leads automatically.
            </CardDescription>
          </CardHeader>
          <CardContent class="pt-4 border-t border-border/40 space-y-4">
            <div class="flex items-center justify-between text-xs">
              <span class="text-muted-foreground font-medium">Provider:</span>
              <span class="font-semibold text-foreground">Instagram Graph API</span>
            </div>
            <Button
              class="w-full gap-2 bg-pink-600 hover:bg-pink-700 text-white shadow-md shadow-pink-600/20"
              :disabled="isConnectingInstagram"
              @click="handleConnectInstagram"
            >
              <HugeiconsIcon :icon="Link01Icon" :size="18" />
              <span>Connect Instagram</span>
            </Button>
          </CardContent>
        </Card>

        <!-- Facebook Messenger -->
        <Card class="border-border/50 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <CardHeader>
            <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
              <HugeiconsIcon :icon="FacebookIcon" :size="28" />
            </div>
            <CardTitle class="text-xl font-bold">Facebook Messenger</CardTitle>
            <CardDescription class="mt-2 text-sm leading-relaxed">
              Connect your Facebook Hotel Page Messenger to respond to incoming guest queries and booking questions 24/7.
            </CardDescription>
          </CardHeader>
          <CardContent class="pt-4 border-t border-border/40 space-y-4">
            <div class="flex items-center justify-between text-xs">
              <span class="text-muted-foreground font-medium">Provider:</span>
              <span class="font-semibold text-foreground">Meta Messenger API</span>
            </div>
            <Button
              class="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
              :disabled="isConnectingFacebook"
              @click="handleConnectFacebook"
            >
              <HugeiconsIcon :icon="Link01Icon" :size="18" />
              <span>Connect Messenger</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      <!-- Information Card -->
      <Card class="border-border/50 bg-muted/20">
        <CardContent class="p-6 flex items-start gap-4">
          <div class="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
            <HugeiconsIcon :icon="InformationCircleIcon" :size="20" />
          </div>
          <div class="space-y-1">
            <h4 class="text-sm font-semibold text-foreground">Meta Business Credentials Required</h4>
            <p class="text-xs text-muted-foreground leading-relaxed">
              Connecting a messaging channel requires valid Meta Business Manager access permissions. Ensure your backend environment configured with valid Meta App IDs and secrets before completing OAuth authorization.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
