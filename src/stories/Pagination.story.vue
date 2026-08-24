<script setup lang="ts">
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from '@/components/uic/pagination'
</script>

<template>
  <Story title="Pagination" group="navigation" icon="lucide:chevrons-left-right-ellipsis">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <Pagination
            :total="100"
            :items-per-page="10"
            :sibling-count="1"
            show-edges
            :default-page="3"
          >
            <PaginationContent>
              <PaginationFirst />
              <PaginationPrevious />
              <PaginationItem :value="1">
                1
              </PaginationItem>
              <PaginationItem :value="2">
                2
              </PaginationItem>
              <PaginationItem :value="3">
                3
              </PaginationItem>
              <PaginationEllipsis />
              <PaginationItem :value="10">
                10
              </PaginationItem>
              <PaginationNext />
              <PaginationLast />
            </PaginationContent>
          </Pagination>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <Pagination
            :total="100"
            :items-per-page="10"
            :sibling-count="1"
            show-edges
            :default-page="3"
          >
            <PaginationContent>
              <PaginationFirst />
              <PaginationPrevious />
              <PaginationItem :value="1">
                1
              </PaginationItem>
              <PaginationItem :value="2">
                2
              </PaginationItem>
              <PaginationItem :value="3">
                3
              </PaginationItem>
              <PaginationEllipsis />
              <PaginationItem :value="10">
                10
              </PaginationItem>
              <PaginationNext />
              <PaginationLast />
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </Variant>
  </Story>
</template>
