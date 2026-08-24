<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/uic/table'
</script>

<template>
  <Story title="Table" group="display" icon="lucide:table-2">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell class="font-medium">
                  John Doe
                </TableCell>
                <TableCell>john@example.com</TableCell>
                <TableCell>Admin</TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">
                  Jane Smith
                </TableCell>
                <TableCell>jane@example.com</TableCell>
                <TableCell>Editor</TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">
                  Joe Black
                </TableCell>
                <TableCell>joe@example.com</TableCell>
                <TableCell>Viewer</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell class="font-medium">
                  John Doe
                </TableCell>
                <TableCell>john@example.com</TableCell>
                <TableCell>Admin</TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">
                  Jane Smith
                </TableCell>
                <TableCell>jane@example.com</TableCell>
                <TableCell>Editor</TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">
                  Joe Black
                </TableCell>
                <TableCell>joe@example.com</TableCell>
                <TableCell>Viewer</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </Variant>
  </Story>
</template>
