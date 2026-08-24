# UI Components Playground

Browse and interact with all UI components in one place. The playground below shows every component with its variants, sizes, and interactive controls.

### Framework Note
This project uses **shadcn/ui** for its component library. All primitive components are located in `src/components/uic/`. When building new features or modifying existing pages, always use these components.

### Logo Component
All logos across the application (Navbar, Sidebar, Auth pages) are rendered using a single unified component: `<Logo />` located at `src/components/layout/Logo.vue`. This component automatically handles dark mode, animations, and responsive sizing.

<ClientOnly>
  <ComponentPreview
    title="Neop UI Playground"
    description="All UI components — Buttons, Inputs, Selects, Checkboxes, Toggles"
    height="650px"
  />
</ClientOnly>

> [!TIP]
> Click **Full View** to open the playground as a fullscreen overlay, or click the **URL** to open Histoire directly in a new tab.

