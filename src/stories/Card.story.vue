<script setup lang="ts">
import { Badge } from '@/components/uic/badge'
import { Button } from '@/components/uic/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/uic/card'
</script>

<template>
  <Story title="Card" group="display" icon="lucide:square">
    <Variant title="Complete Card">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <Card class="max-w-md">
            <CardHeader>
              <div class="flex justify-between items-start">
                <div>
                  <CardTitle>Project Status</CardTitle>
                  <CardDescription>Latest metrics and analytics</CardDescription>
                </div>
                <Badge variant="success">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p class="text-sm text-muted-foreground">
                This card demonstrates header, content, and footer sections with a badge and action
                buttons.
              </p>
            </CardContent>
            <CardFooter class="flex justify-end gap-2">
              <Button variant="outline" size="sm">
                Cancel
              </Button>
              <Button variant="primary" size="sm">
                Save
              </Button>
            </CardFooter>
          </Card>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <Card class="max-w-md">
            <CardHeader>
              <div class="flex justify-between items-start">
                <div>
                  <CardTitle>Project Status</CardTitle>
                  <CardDescription>Latest metrics and analytics</CardDescription>
                </div>
                <Badge variant="success">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p class="text-sm text-muted-foreground">
                This card demonstrates header, content, and footer sections with a badge and action
                buttons.
              </p>
            </CardContent>
            <CardFooter class="flex justify-end gap-2">
              <Button variant="outline" size="sm">
                Cancel
              </Button>
              <Button variant="primary" size="sm">
                Save
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Variant>
    <Variant title="Simple Card">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border">
          <h3 class="text-lg font-bold text-foreground mb-4">
            Light
          </h3>
          <Card class="max-w-sm">
            <CardContent class="pt-6">
              <p class="text-sm text-foreground">
                A simple content-only card without header or footer.
              </p>
            </CardContent>
          </Card>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border">
          <h3 class="text-lg font-bold text-foreground mb-4">
            Dark
          </h3>
          <Card class="max-w-sm">
            <CardContent class="pt-6">
              <p class="text-sm text-foreground">
                A simple content-only card without header or footer.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Variant>
  </Story>
</template>
