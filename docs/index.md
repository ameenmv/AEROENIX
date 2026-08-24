---
layout: home

hero:
  name: "Neop"
  text: "Base Documentation"
  tagline: Build admin dashboards fast with a modular, composable architecture
  actions:
    - theme: brand
      text: Get Started
      link: /guide/core/getting-started
    - theme: alt
      text: Build a Module
      link: /guide/modular/building-a-module

features:
  - title: Two Composables, Full CRUD
    details: useTable for data listing and useForm for mutations. That's it. Wire them with standard Vue Router navigation.
  - title: Role-Based Access
    details: Fine-grained permission system with v-can directive, route guards, and permission-aware navigation.
  - title: Dark & Light Themes
    details: Fully themed with CSS variables. Toggle between dark and light mode with a single composable.
  - title: Auto-Import
    details: Vue APIs, VueUse, Pinia, and all components are auto-imported — no manual imports needed.
  - title: Scaffold in Seconds
    details: Run bun make:module to generate a complete CRUD module with views, schema, columns, fields, and routing.
  - title: Mock-Ready
    details: Develop against fake data with Faker.js. Flip one env var to switch between mock and live API.
---
