import { registerModule } from '@/router/modules'

registerModule({
  name: 'bookings',
  path: 'admin/bookings',
  // permissionKey: 'bookings',
  order: 40, // after hotels
  routes: [
    {
      path: 'admin/bookings',
      name: 'admin-bookings',
      component: () => import('@/views/admin/bookings/IndexView.vue'),
      meta: {
        breadcrumbKey: 'menu.bookings',
        title: 'Bookings',
      },
    },
    {
      path: 'admin/bookings/:id',
      name: 'admin-bookings-show',
      component: () => import('@/views/admin/bookings/ShowView.vue'),
      meta: {
        breadcrumbKey: 'menu.booking_details',
        title: 'Booking Details',
      },
    },
  ],
})
