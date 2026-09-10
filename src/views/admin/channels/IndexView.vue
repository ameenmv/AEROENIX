<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { useQuery, useQueryClient, useMutation } from '@tanstack/vue-query'
import {
  FacebookIcon,
  InformationCircleIcon,
  InstagramIcon,
  Link01Icon,
  WhatsappIcon,
  Delete02Icon,
  CheckmarkBadge01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Button } from '@/components/uic/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/uic/card'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/uic/alert-dialog'
import { channelsService } from '@/services/channelsService'
import type { Channel } from '@/types/entities/channel'
import { Badge } from '@/components/uic/badge'
import { Skeleton } from '@/components/uic/skeleton'

const { t } = useI18n()
const queryClient = useQueryClient()

const isConnectingWhatsApp = ref(false)
const isConnectingInstagram = ref(false)
const isConnectingFacebook = ref(false)

const { data: channels, isLoading } = useQuery<Channel[]>({
  queryKey: ['channels'],
  queryFn: () => channelsService.getAll()
})

const whatsappChannel = computed(() => channels.value?.find(c => c.provider === 'whatsapp_business'))
const instagramChannel = computed(() => channels.value?.find(c => c.provider === 'instagram_professional'))
const facebookChannel = computed(() => channels.value?.find(c => c.provider === 'facebook_messenger'))

const isDisconnectDialogOpen = ref(false)
const channelToDisconnect = ref<Channel | null>(null)

function openDisconnectDialog(channel: Channel) {
  channelToDisconnect.value = channel
  isDisconnectDialogOpen.value = true
}

function closeDisconnectDialog() {
  isDisconnectDialogOpen.value = false
  channelToDisconnect.value = null
}

const { mutate: executeDisconnect, isPending: isDisconnecting } = useMutation({
  mutationFn: (id: string | number) => channelsService.disconnect(id),
  onSuccess: (message) => {
    toast.success(message)
    queryClient.invalidateQueries({ queryKey: ['channels'] })
    closeDisconnectDialog()
  },
  onError: () => {
    toast.error(t('channels.disconnect_error', 'Failed to disconnect channel.'))
  }
})

function confirmDisconnect() {
  if (channelToDisconnect.value) {
    executeDisconnect(channelToDisconnect.value.id)
  }
}



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

// PostMessage Listener for popup callback messages
function handlePostMessage(event: MessageEvent) {
  if (event.data?.type === 'CHANNEL_CONNECTED' || event.data?.type === 'AEROENIX_CHANNEL_CONNECTED') {
    const channelName = event.data?.channel?.name || event.data?.data?.channel?.name || 'Channel'
    toast.success(`${channelName} connected successfully!`)
    queryClient.invalidateQueries({ queryKey: ['channels'] })
  } else if (event.data?.type === 'CHANNEL_AUTH_ERROR' || event.data?.type === 'AEROENIX_CHANNEL_ERROR') {
    toast.error(event.data?.message || 'Failed to connect channel.')
  }
}

onMounted(() => {
  window.addEventListener('message', handlePostMessage)
})

onBeforeUnmount(() => {
  window.removeEventListener('message', handlePostMessage)
})

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
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton class="h-[280px] w-full rounded-xl" v-for="i in 3" :key="i" />
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- WhatsApp Business -->
        <Card class="border-border/50 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
          <div v-if="whatsappChannel" class="absolute top-0 right-0 p-4">
            <Badge variant="default" class="bg-emerald-500 hover:bg-emerald-600 gap-1">
              <HugeiconsIcon :icon="CheckmarkBadge01Icon" :size="14" />
              Connected
            </Badge>
          </div>
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
            
            <template v-if="whatsappChannel">
              <div class="rounded-lg bg-muted/30 p-3 space-y-2 border border-border/40">
                <div class="flex justify-between items-center text-sm">
                  <span class="text-muted-foreground">Account</span>
                  <span class="font-medium text-foreground truncate max-w-[120px]" :title="whatsappChannel.name">{{ whatsappChannel.name }}</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                  <span class="text-muted-foreground">Number</span>
                  <a v-if="whatsappChannel.channel_url || whatsappChannel.link" :href="(whatsappChannel.channel_url || whatsappChannel.link) || undefined" target="_blank" class="font-medium text-primary hover:underline">
                    {{ whatsappChannel.username }}
                  </a>
                  <span v-else class="font-medium text-foreground">
                    {{ whatsappChannel.username }}
                  </span>
                </div>
              </div>
              <Button
                variant="destructive"
                class="w-full gap-2"
                @click="openDisconnectDialog(whatsappChannel)"
              >
                <HugeiconsIcon :icon="Delete02Icon" :size="18" />
                <span>Disconnect</span>
              </Button>
            </template>
            <template v-else>
              <div class="space-y-2">
                <Button
                  class="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                  :disabled="isConnectingWhatsApp"
                  @click="handleConnectWhatsApp"
                >
                  <HugeiconsIcon :icon="Link01Icon" :size="18" />
                  <span>Connect WhatsApp</span>
                </Button>
              </div>
            </template>
          </CardContent>
        </Card>

        <!-- Instagram Professional -->
        <Card class="border-border/50 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
          <div v-if="instagramChannel" class="absolute top-0 right-0 p-4">
            <Badge variant="default" class="bg-pink-500 hover:bg-pink-600 gap-1">
              <HugeiconsIcon :icon="CheckmarkBadge01Icon" :size="14" />
              Connected
            </Badge>
          </div>
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
            
            <template v-if="instagramChannel">
              <div class="rounded-lg bg-muted/30 p-3 space-y-2 border border-border/40">
                <div class="flex justify-between items-center text-sm">
                  <span class="text-muted-foreground">Account</span>
                  <a v-if="instagramChannel.channel_url || instagramChannel.link" :href="(instagramChannel.channel_url || instagramChannel.link) || undefined" target="_blank" class="font-medium text-primary hover:underline truncate max-w-[120px]" :title="instagramChannel.name">
                    @{{ instagramChannel.username || instagramChannel.name }}
                  </a>
                  <span v-else class="font-medium text-foreground truncate max-w-[120px]" :title="instagramChannel.name">
                    @{{ instagramChannel.username || instagramChannel.name }}
                  </span>
                </div>
              </div>
              <Button
                variant="destructive"
                class="w-full gap-2"
                @click="openDisconnectDialog(instagramChannel)"
              >
                <HugeiconsIcon :icon="Delete02Icon" :size="18" />
                <span>Disconnect</span>
              </Button>
            </template>
            <template v-else>
              <div class="space-y-2">
                <Button
                  class="w-full gap-2 bg-pink-600 hover:bg-pink-700 text-white shadow-md shadow-pink-600/20"
                  :disabled="isConnectingInstagram"
                  @click="handleConnectInstagram"
                >
                  <HugeiconsIcon :icon="Link01Icon" :size="18" />
                  <span>Connect Instagram</span>
                </Button>
              </div>
            </template>
          </CardContent>
        </Card>

        <!-- Facebook Messenger -->
        <Card class="border-border/50 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
          <div v-if="facebookChannel" class="absolute top-0 right-0 p-4">
            <Badge variant="default" class="bg-blue-500 hover:bg-blue-600 gap-1">
              <HugeiconsIcon :icon="CheckmarkBadge01Icon" :size="14" />
              Connected
            </Badge>
          </div>
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
            
            <template v-if="facebookChannel">
              <div class="rounded-lg bg-muted/30 p-3 space-y-2 border border-border/40">
                <div class="flex justify-between items-center text-sm">
                  <span class="text-muted-foreground">Account</span>
                  <a v-if="facebookChannel.channel_url || facebookChannel.link" :href="(facebookChannel.channel_url || facebookChannel.link) || undefined" target="_blank" class="font-medium text-primary hover:underline truncate max-w-[120px]" :title="facebookChannel.name">
                    {{ facebookChannel.name }}
                  </a>
                  <span v-else class="font-medium text-foreground truncate max-w-[120px]" :title="facebookChannel.name">
                    {{ facebookChannel.name }}
                  </span>
                </div>
              </div>
              <Button
                variant="destructive"
                class="w-full gap-2"
                @click="openDisconnectDialog(facebookChannel)"
              >
                <HugeiconsIcon :icon="Delete02Icon" :size="18" />
                <span>Disconnect</span>
              </Button>
            </template>
            <template v-else>
              <div class="space-y-2">
                <Button
                  class="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
                  :disabled="isConnectingFacebook"
                  @click="handleConnectFacebook"
                >
                  <HugeiconsIcon :icon="Link01Icon" :size="18" />
                  <span>Connect Messenger</span>
                </Button>
              </div>
            </template>
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

    <!-- Disconnect Dialog -->
    <AlertDialog :open="isDisconnectDialogOpen" @update:open="val => { if (!isDisconnecting) isDisconnectDialogOpen = val }">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Disconnect Channel</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to disconnect this channel? You will no longer be able to automate messages for this channel.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="isDisconnecting" @click="closeDisconnectDialog">
            {{ t('actions.cancel', 'Cancel') }}
          </AlertDialogCancel>
          <Button variant="destructive" :disabled="isDisconnecting" @click="confirmDisconnect">
            <span v-if="isDisconnecting" class="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            <span>Disconnect</span>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
