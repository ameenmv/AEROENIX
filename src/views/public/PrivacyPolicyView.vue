<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

onMounted(() => {
  document.title = `${t('privacy.title')} | AZUL HOSPITALITY`
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground flex flex-col" :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'">
    <!-- Header -->
    <header class="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-md">
      <div class="container mx-auto px-4 h-16 flex items-center">
        <!-- Logo placeholder matching standard design -->
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
            A
          </div>
          <span class="font-semibold text-lg tracking-tight">AZUL HOSPITALITY</span>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow container mx-auto px-4 py-12 max-w-3xl">
      <article class="prose prose-slate dark:prose-invert max-w-none" :class="$i18n.locale === 'ar' ? 'text-right' : 'text-left'">
        <h1 class="text-3xl font-bold tracking-tight mb-2">{{ t('privacy.title') }}</h1>
        <p class="text-muted-foreground mb-8">{{ t('privacy.last_updated') }} <span class="font-semibold">{{ t('privacy.date') }}</span></p>

        <div class="space-y-8 text-base/relaxed">
          <p>
            {{ t('privacy.intro', { brand: 'AZUL HOSPITALITY' }) }}
          </p>

          <section>
            <h2 class="text-xl font-semibold mt-8 mb-4 border-b pb-2">{{ t('privacy.sections.1.title') }}</h2>
            <p class="mb-3">{{ t('privacy.sections.1.intro') }}</p>
            <ul class="list-disc ltr:pl-6 rtl:pr-6 space-y-2 mb-4">
              <li>{{ t('privacy.sections.1.list.1') }}</li>
              <li>{{ t('privacy.sections.1.list.2') }}</li>
              <li>{{ t('privacy.sections.1.list.3') }}</li>
              <li>{{ t('privacy.sections.1.list.4') }}</li>
              <li>{{ t('privacy.sections.1.list.5') }}</li>
              <li>{{ t('privacy.sections.1.list.6') }}</li>
            </ul>
            <p>{{ t('privacy.sections.1.outro') }}</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mt-8 mb-4 border-b pb-2">{{ t('privacy.sections.2.title') }}</h2>
            <p class="mb-3">{{ t('privacy.sections.2.intro') }}</p>
            <ul class="list-disc ltr:pl-6 rtl:pr-6 space-y-2 mb-4">
              <li>{{ t('privacy.sections.2.list.1', { brand: 'AZUL' }) }}</li>
              <li>{{ t('privacy.sections.2.list.2') }}</li>
              <li>{{ t('privacy.sections.2.list.3') }}</li>
              <li>{{ t('privacy.sections.2.list.4') }}</li>
              <li>{{ t('privacy.sections.2.list.5') }}</li>
              <li>{{ t('privacy.sections.2.list.6') }}</li>
              <li>{{ t('privacy.sections.2.list.7') }}</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-semibold mt-8 mb-4 border-b pb-2">{{ t('privacy.sections.3.title') }}</h2>
            <p class="mb-4">{{ t('privacy.sections.3.p1', { brand: 'AZUL HOSPITALITY' }) }}</p>
            <p class="mb-4">{{ t('privacy.sections.3.p2', { brand: 'AZUL HOSPITALITY' }) }}</p>
            <p>{{ t('privacy.sections.3.p3') }}</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mt-8 mb-4 border-b pb-2">{{ t('privacy.sections.4.title') }}</h2>
            <p class="mb-4">{{ t('privacy.sections.4.p1') }}</p>
            <p>{{ t('privacy.sections.4.p2') }}</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mt-8 mb-4 border-b pb-2">{{ t('privacy.sections.5.title') }}</h2>
            <p class="mb-4">{{ t('privacy.sections.5.p1') }}</p>
            <p>{{ t('privacy.sections.5.p2') }}</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mt-8 mb-4 border-b pb-2">{{ t('privacy.sections.6.title') }}</h2>
            <p class="mb-4">{{ t('privacy.sections.6.p1') }}</p>
            <p>{{ t('privacy.sections.6.p2') }}</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mt-8 mb-4 border-b pb-2">{{ t('privacy.sections.7.title') }}</h2>
            <p class="mb-3">{{ t('privacy.sections.7.intro') }}</p>
            <ul class="list-disc ltr:pl-6 rtl:pr-6 space-y-2 mb-4">
              <li>{{ t('privacy.sections.7.list.1') }}</li>
              <li>{{ t('privacy.sections.7.list.2') }}</li>
              <li>{{ t('privacy.sections.7.list.3') }}</li>
              <li>{{ t('privacy.sections.7.list.4') }}</li>
              <li>{{ t('privacy.sections.7.list.5') }}</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-semibold mt-8 mb-4 border-b pb-2">{{ t('privacy.sections.8.title') }}</h2>
            <p class="mb-4">{{ t('privacy.sections.8.p1') }}</p>
            <p class="mb-4">{{ t('privacy.sections.8.p2') }}</p>
            <p>
              <strong>{{ t('privacy.sections.8.request') }}</strong> <a href="mailto:aeroenix10@gmail.com" class="text-primary hover:underline">aeroenix10@gmail.com</a>
            </p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mt-8 mb-4 border-b pb-2">{{ t('privacy.sections.9.title') }}</h2>
            <p>{{ t('privacy.sections.9.p1', { brand: 'AZUL HOSPITALITY' }) }}</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mt-8 mb-4 border-b pb-2">{{ t('privacy.sections.10.title') }}</h2>
            <p>{{ t('privacy.sections.10.p1') }}</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mt-8 mb-4 border-b pb-2">{{ t('privacy.sections.11.title') }}</h2>
            <p class="mb-4">{{ t('privacy.sections.11.p1') }}</p>
            <div class="bg-muted p-4 rounded-md">
              <p class="font-semibold mb-2">AZUL HOSPITALITY</p>
              <p class="mb-1"><strong>{{ t('privacy.contact.email_label') }}</strong> <a href="mailto:aeroenix10@gmail.com" class="text-primary hover:underline">aeroenix10@gmail.com</a></p>
              <p><strong>{{ t('privacy.contact.website_label') }}</strong> <a href="https://aeroenix.vercel.app/" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">aeroenix.vercel.app</a></p>
            </div>
          </section>
        </div>
      </article>
    </main>

    <!-- Footer -->
    <footer class="border-t border-border mt-auto bg-card">
      <div class="container mx-auto px-4 py-8">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>{{ t('privacy.footer.copyright', { year: new Date().getFullYear(), brand: 'AZUL HOSPITALITY' }) }}</p>
          <div class="flex gap-4">
            <a href="https://aeroenix.vercel.app/" class="hover:text-foreground transition-colors">{{ t('privacy.footer.home') }}</a>
            <router-link to="/privacy-policy" class="hover:text-foreground transition-colors">{{ t('privacy.footer.privacy') }}</router-link>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Scoped styles to ensure typography looks perfect */
.prose h1, .prose h2, .prose h3 {
  color: var(--color-foreground, #0f172a);
}
.prose p, .prose ul, .prose li {
  color: var(--color-muted-foreground, #334155);
}
.dark .prose h1, .dark .prose h2, .dark .prose h3 {
  color: #f8fafc;
}
.dark .prose p, .dark .prose ul, .dark .prose li {
  color: #cbd5e1;
}
</style>
