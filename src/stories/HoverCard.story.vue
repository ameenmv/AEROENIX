<script setup lang="ts">
import { CalendarDays } from 'lucide-vue-next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/uic/avatar'
import { Button } from '@/components/uic/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/uic/hover-card'
</script>

<template>
  <Story title="HoverCard" group="overlay" icon="lucide:square-mouse-pointer">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <HoverCard>
            <HoverCardTrigger as-child>
              <Button variant="link">
                @nextjs
              </Button>
            </HoverCardTrigger>
            <HoverCardContent class="w-80">
              <div class="flex justify-between space-x-4">
                <Avatar>
                  <AvatarImage src="https://github.com/vercel.png" />
                  <AvatarFallback>VC</AvatarFallback>
                </Avatar>
                <div class="space-y-1">
                  <h4 class="text-sm font-semibold">
                    @nextjs
                  </h4>
                  <p class="text-sm text-muted-foreground">
                    The React Framework – created and maintained by @vercel.
                  </p>
                  <div class="flex items-center pt-2">
                    <CalendarDays class="mr-2 h-4 w-4 opacity-70" />
                    <span class="text-xs text-muted-foreground">Joined December 2021</span>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <HoverCard>
            <HoverCardTrigger as-child>
              <Button variant="link">
                @nextjs
              </Button>
            </HoverCardTrigger>
            <HoverCardContent class="w-80">
              <div class="flex justify-between space-x-4">
                <Avatar>
                  <AvatarFallback>VC</AvatarFallback>
                </Avatar>
                <div class="space-y-1">
                  <h4 class="text-sm font-semibold">
                    @nextjs
                  </h4>
                  <p class="text-sm text-muted-foreground">
                    The React Framework.
                  </p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
    </Variant>
  </Story>
</template>
