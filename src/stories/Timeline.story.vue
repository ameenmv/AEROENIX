<script setup lang="ts">
import { Timeline, TimelineItem } from '@/components/uic/timeline'
</script>

<template>
  <Story title="Timeline" group="display" icon="lucide:git-commit-horizontal">
    <Variant title="Audit Trail">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <Timeline>
            <TimelineItem
              variant="success"
              title="Approved"
              timestamp="May 24, 2025 — 10:30 AM"
              user="Admin User"
            >
              Subscription approved and activated.
            </TimelineItem>
            <TimelineItem
              variant="info"
              title="Reviewed"
              timestamp="May 23, 2025 — 3:15 PM"
              user="Checker"
            />
            <TimelineItem
              variant="warning"
              title="Pending Review"
              timestamp="May 22, 2025 — 9:00 AM"
              user="System"
            />
            <TimelineItem
              variant="neutral"
              title="Created"
              timestamp="May 21, 2025 — 11:45 AM"
              user="John Doe"
            />
          </Timeline>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <Timeline>
            <TimelineItem
              variant="danger"
              title="Rejected"
              timestamp="May 24, 2025 — 10:30 AM"
              user="Admin"
            >
              Missing documentation. Please resubmit.
            </TimelineItem>
            <TimelineItem
              variant="info"
              title="Reviewed"
              timestamp="May 23, 2025 — 3:15 PM"
              user="Checker"
            />
            <TimelineItem
              variant="warning"
              title="Pending Review"
              timestamp="May 22, 2025 — 9:00 AM"
            />
            <TimelineItem
              variant="neutral"
              title="Created"
              timestamp="May 21, 2025 — 11:45 AM"
              user="John Doe"
            />
          </Timeline>
        </div>
      </div>
    </Variant>
  </Story>
</template>
