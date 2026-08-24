<script setup lang="ts">
import { ref } from 'vue'
import FormContainer from '@/components/ui/forms/FormContainer.vue'
import CheckboxField from '@/components/uic/inputs/CheckboxField.vue'
import InputField from '@/components/uic/inputs/InputField.vue'
import SelectField from '@/components/uic/select/SelectField.vue'

const formData = ref<Record<string, any>>({
  name: '',
  email: '',
  password: '',
  role: 'editor',
  bio: '',
  active: false,
})
const formErrors = ref<Record<string, string[]>>({
  email: ['Please enter a valid email address'],
})
function updateField(key: string, value: any) {
  formData.value = { ...formData.value, [key]: value }
}
const multiStepData = ref<Record<string, any>>({
  name: '',
  email: '',
  phone: '',
  role: 'editor',
  department: '',
  bio: '',
})
function updateStep(key: string, value: any) {
  multiStepData.value = { ...multiStepData.value, [key]: value }
}
const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
]
</script>

<template>
  <Story title="FormContainer" group="inputs" icon="lucide:file-text">
    <Variant title="Create Mode">
      <div class="grid grid-cols-1 gap-8 p-8">
        <div class="dark p-6 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Create Form
          </h3>
          <FormContainer v-model="formData">
            <InputField
              :model-value="formData.name"
              label="Full Name"
              required
              placeholder="Enter full name"
              @update:model-value="updateField('name', $event)"
            />
            <InputField
              :model-value="formData.email"
              label="Email"
              type="email"
              required
              placeholder="admin@neop.com"
              @update:model-value="updateField('email', $event)"
            />
            <InputField
              :model-value="formData.password"
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              @update:model-value="updateField('password', $event)"
            />
            <SelectField
              :model-value="formData.role"
              :options="roleOptions"
              label="Role"
              @update:model-value="updateField('role', $event)"
            />
            <InputField
              :model-value="formData.bio"
              label="Biography"
              type="textarea"
              placeholder="Tell us about yourself..."
              class="col-span-1 md:col-span-2"
              @update:model-value="updateField('bio', $event)"
            />
            <div class="flex items-center pt-8">
              <CheckboxField
                :model-value="formData.active"
                label="Active account"
                @update:model-value="updateField('active', $event)"
              />
            </div>
          </FormContainer>
        </div>
      </div>
    </Variant>
    <Variant title="Edit Mode">
      <div class="grid grid-cols-1 gap-8 p-8">
        <div class="dark p-6 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Edit Form
          </h3>
          <FormContainer v-model="formData" is-edit>
            <InputField
              :model-value="formData.name"
              label="Full Name"
              required
              @update:model-value="updateField('name', $event)"
            />
            <InputField
              :model-value="formData.email"
              label="Email"
              type="email"
              required
              @update:model-value="updateField('email', $event)"
            />
          </FormContainer>
        </div>
      </div>
    </Variant>
    <Variant title="With Errors">
      <div class="grid grid-cols-1 gap-8 p-8">
        <div class="dark p-6 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Validation Errors
          </h3>
          <FormContainer v-model="formData" :errors="formErrors">
            <InputField
              :model-value="formData.name"
              label="Full Name"
              required
              @update:model-value="updateField('name', $event)"
            />
            <InputField
              :model-value="formData.email"
              label="Email"
              type="email"
              required
              :error="formErrors.email?.[0]"
              @update:model-value="updateField('email', $event)"
            />
          </FormContainer>
        </div>
      </div>
    </Variant>
    <Variant title="Multi-Step">
      <div class="grid grid-cols-1 gap-8 p-8">
        <div class="dark p-6 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Multi-Step Form
          </h3>
          <p class="text-sm text-muted-foreground">
            Steps are defined via named slots: <code>#step-1</code>, <code>#step-2</code>, etc.
          </p>
          <FormContainer
            v-model="multiStepData"
            show-stepper
            :step-count="2"
            :steps="[
              { label: 'Personal Info', description: 'Name and contact' },
              { label: 'Role & Bio', description: 'Position details' },
            ]"
          >
            <template #step-1>
              <InputField
                :model-value="multiStepData.name"
                label="Full Name"
                required
                @update:model-value="updateStep('name', $event)"
              />
              <InputField
                :model-value="multiStepData.email"
                label="Email"
                type="email"
                required
                @update:model-value="updateStep('email', $event)"
              />
              <InputField
                :model-value="multiStepData.phone"
                label="Phone"
                @update:model-value="updateStep('phone', $event)"
              />
            </template>
            <template #step-2>
              <SelectField
                :model-value="multiStepData.role"
                :options="roleOptions"
                label="Role"
                @update:model-value="updateStep('role', $event)"
              />
              <InputField
                :model-value="multiStepData.department"
                label="Department"
                @update:model-value="updateStep('department', $event)"
              />
              <InputField
                :model-value="multiStepData.bio"
                label="Biography"
                type="textarea"
                class="col-span-1 md:col-span-2"
                @update:model-value="updateStep('bio', $event)"
              />
            </template>
          </FormContainer>
        </div>
      </div>
    </Variant>
    <Variant title="Saving State">
      <div class="grid grid-cols-1 gap-8 p-8">
        <div class="dark p-6 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Saving...
          </h3>
          <FormContainer v-model="formData" saving>
            <InputField
              :model-value="formData.name"
              label="Full Name"
              @update:model-value="updateField('name', $event)"
            />
          </FormContainer>
        </div>
      </div>
    </Variant>
    <Variant title="Loading State">
      <div class="grid grid-cols-1 gap-8 p-8">
        <div class="dark p-6 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Loading Form Data...
          </h3>
          <FormContainer v-model="formData" loading>
            <InputField
              :model-value="formData.name"
              label="Full Name"
              @update:model-value="updateField('name', $event)"
            />
          </FormContainer>
        </div>
      </div>
    </Variant>
  </Story>
</template>
