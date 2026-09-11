<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  document.title = 'Privacy Policy | Azul Hospitality'
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground flex flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-md">
      <div class="container mx-auto px-4 h-16 flex items-center">
        <!-- Logo placeholder matching standard design -->
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
            A
          </div>
          <span class="font-semibold text-lg tracking-tight">Azul Hospitality</span>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow container mx-auto px-4 py-12 max-w-3xl">
      <article class="prose prose-slate dark:prose-invert max-w-none">
        <h1 class="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p class="text-muted-foreground mb-8">Last Updated: <span class="font-semibold">[ADD DATE]</span></p>

        <div class="space-y-8 text-base/relaxed">
          <p>
            <strong>Azul Hospitality</strong> ("we", "our", or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect information when you use the Azul Hospitality application and its communication services.
          </p>

          <section>
            <h2 class="text-xl font-semibold mt-8 mb-4 border-b pb-2">1. Information We Collect</h2>
            <p class="mb-3">Depending on how you use the application, we may collect:</p>
            <ul class="list-disc pl-6 space-y-2 mb-4">
              <li>Name and basic profile information.</li>
              <li>Email address and contact information.</li>
              <li>Account and authentication information.</li>
              <li>Messages and communication data exchanged through supported communication channels.</li>
              <li>Information provided through WhatsApp, Instagram, Messenger, or other supported Meta services.</li>
              <li>Technical information such as IP address, browser/device information, and application usage data.</li>
            </ul>
            <p>We only collect information that is necessary to provide and improve our services.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mt-8 mb-4 border-b pb-2">2. How We Use Your Information</h2>
            <p class="mb-3">We may use collected information to:</p>
            <ul class="list-disc pl-6 space-y-2 mb-4">
              <li>Provide and operate Azul Hospitality services.</li>
              <li>Manage user accounts and authentication.</li>
              <li>Respond to customer inquiries and requests.</li>
              <li>Manage customer communications through supported channels.</li>
              <li>Improve application functionality and user experience.</li>
              <li>Maintain security and prevent unauthorized access or abuse.</li>
              <li>Comply with applicable laws and legal requirements.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-semibold mt-8 mb-4 border-b pb-2">3. Meta Platforms and Third-Party Services</h2>
            <p class="mb-4">
              Azul Hospitality may integrate with Meta services, including WhatsApp, Instagram, and Messenger, to enable communication between customers and the business.
            </p>
            <p class="mb-4">
              When you interact with Azul Hospitality through these services, information may be processed through the relevant Meta platform according to its own privacy policies and terms.
            </p>
            <p>
              We only request and use the permissions and information necessary for the functionality provided by our application.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mt-8 mb-4 border-b pb-2">4. Sharing of Information</h2>
            <p class="mb-4">We do not sell or rent users' personal information.</p>
            <p>
              Information may be shared with trusted service providers or third-party services when necessary to operate the application, provide requested functionality, maintain security, or comply with legal obligations.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mt-8 mb-4 border-b pb-2">5. Data Security</h2>
            <p class="mb-4">
              We take reasonable technical and organizational measures to protect personal information against unauthorized access, disclosure, alteration, or destruction.
            </p>
            <p>
              However, no online service can guarantee complete security of information.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mt-8 mb-4 border-b pb-2">6. Data Retention</h2>
            <p class="mb-4">
              We retain personal information only for as long as necessary to provide our services, fulfill legitimate business purposes, resolve disputes, maintain security, or comply with legal obligations.
            </p>
            <p>
              When information is no longer required, it may be deleted or anonymized where appropriate.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mt-8 mb-4 border-b pb-2">7. Your Rights</h2>
            <p class="mb-3">Depending on applicable laws, you may have the right to:</p>
            <ul class="list-disc pl-6 space-y-2 mb-4">
              <li>Request access to your personal information.</li>
              <li>Request correction of inaccurate information.</li>
              <li>Request deletion of your personal information.</li>
              <li>Withdraw consent where applicable.</li>
              <li>Ask questions about how your information is processed.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-semibold mt-8 mb-4 border-b pb-2">8. Data Deletion</h2>
            <p class="mb-4">
              Users may request deletion of their personal information by contacting us through the contact information provided below.
            </p>
            <p class="mb-4">
              Upon receiving a valid request, we will review and process the request in accordance with applicable laws and our data retention requirements.
            </p>
            <p>
              <strong>Data Deletion Request:</strong> <a href="mailto:[ADD YOUR DATA DELETION URL OR CONTACT EMAIL]" class="text-primary hover:underline">[ADD YOUR DATA DELETION URL OR CONTACT EMAIL]</a>
            </p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mt-8 mb-4 border-b pb-2">9. Children's Privacy</h2>
            <p>
              Azul Hospitality is not intended to knowingly collect personal information from children where such collection is prohibited by applicable law.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mt-8 mb-4 border-b pb-2">10. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be published on this page with an updated "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mt-8 mb-4 border-b pb-2">11. Contact Us</h2>
            <p class="mb-4">
              If you have questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact us:
            </p>
            <div class="bg-muted p-4 rounded-md">
              <p class="font-semibold mb-2">Azul Hospitality</p>
              <p class="mb-1"><strong>Email:</strong> <a href="mailto:[ADD OFFICIAL EMAIL]" class="text-primary hover:underline">[ADD OFFICIAL EMAIL]</a></p>
              <p><strong>Website:</strong> <a href="https://[ADD OFFICIAL WEBSITE]" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">[ADD OFFICIAL WEBSITE]</a></p>
            </div>
          </section>
        </div>
      </article>
    </main>

    <!-- Footer -->
    <footer class="border-t border-border mt-auto bg-card">
      <div class="container mx-auto px-4 py-8">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {{ new Date().getFullYear() }} Azul Hospitality. All rights reserved.</p>
          <div class="flex gap-4">
            <a href="https://YOUR-DOMAIN.com" class="hover:text-foreground transition-colors">Home</a>
            <router-link to="/privacy-policy" class="hover:text-foreground transition-colors">Privacy Policy</router-link>
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
