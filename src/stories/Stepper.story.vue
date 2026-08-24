<script setup lang="ts">
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/uic/stepper'
</script>

<template>
  <Story title="Stepper" group="navigation" icon="lucide:list-ordered">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <Stepper :default-value="2" class="flex w-full items-start gap-2">
            <StepperItem :step="1" class="relative flex w-full flex-col items-center gap-2">
              <StepperTrigger>
                <StepperIndicator>1</StepperIndicator>
              </StepperTrigger>
              <div class="flex flex-col items-center text-center">
                <StepperTitle>Account</StepperTitle>
                <StepperDescription>Set up your account</StepperDescription>
              </div>
              <StepperSeparator />
            </StepperItem>
            <StepperItem :step="2" class="relative flex w-full flex-col items-center gap-2">
              <StepperTrigger>
                <StepperIndicator>2</StepperIndicator>
              </StepperTrigger>
              <div class="flex flex-col items-center text-center">
                <StepperTitle>Profile</StepperTitle>
                <StepperDescription>Fill in details</StepperDescription>
              </div>
              <StepperSeparator />
            </StepperItem>
            <StepperItem :step="3" class="relative flex w-full flex-col items-center gap-2">
              <StepperTrigger>
                <StepperIndicator>3</StepperIndicator>
              </StepperTrigger>
              <div class="flex flex-col items-center text-center">
                <StepperTitle>Review</StepperTitle>
                <StepperDescription>Confirm info</StepperDescription>
              </div>
            </StepperItem>
          </Stepper>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <Stepper :default-value="2" class="flex w-full items-start gap-2">
            <StepperItem :step="1" class="relative flex w-full flex-col items-center gap-2">
              <StepperTrigger>
                <StepperIndicator>1</StepperIndicator>
              </StepperTrigger>
              <div class="flex flex-col items-center text-center">
                <StepperTitle>Account</StepperTitle>
                <StepperDescription>Set up your account</StepperDescription>
              </div>
              <StepperSeparator />
            </StepperItem>
            <StepperItem :step="2" class="relative flex w-full flex-col items-center gap-2">
              <StepperTrigger>
                <StepperIndicator>2</StepperIndicator>
              </StepperTrigger>
              <div class="flex flex-col items-center text-center">
                <StepperTitle>Profile</StepperTitle>
                <StepperDescription>Fill in details</StepperDescription>
              </div>
              <StepperSeparator />
            </StepperItem>
            <StepperItem :step="3" class="relative flex w-full flex-col items-center gap-2">
              <StepperTrigger>
                <StepperIndicator>3</StepperIndicator>
              </StepperTrigger>
              <div class="flex flex-col items-center text-center">
                <StepperTitle>Review</StepperTitle>
                <StepperDescription>Confirm info</StepperDescription>
              </div>
            </StepperItem>
          </Stepper>
        </div>
      </div>
    </Variant>
  </Story>
</template>
