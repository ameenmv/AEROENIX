/**
 * Carousel variants — configuration presets for the carousel component.
 *
 * The Carousel wraps embla-carousel-vue and supports:
 *  - orientation: 'horizontal' | 'vertical'
 *  - loop: boolean (infinite scrolling)
 *  - autoplay: via embla-carousel-autoplay plugin
 *
 * Sub-components:
 *  - Carousel (root container)
 *  - CarouselContent (slides wrapper)
 *  - CarouselItem (individual slide)
 *  - CarouselNext / CarouselPrevious (navigation buttons)
 */
export const carouselDefaults = {
  orientation: 'horizontal' as const,
  loop: false,
}
