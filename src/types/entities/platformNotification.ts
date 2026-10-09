/**
 * Platform Notification entity — matches backend NotificationResource.
 *
 * This is for the real-time notification system (7 categories, 13 types).
 * NOT for the Manual Notifications CRUD module.
 *
 * Backend: App\Http\Resources\V1\Platform\NotificationResource
 */
export interface PlatformNotification {
  id: string
  hotel_id: number
  user_id: number | null
  type: string
  category: NotificationCategory
  title: string
  message: string
  priority: NotificationPriority
  required_permission: string | null
  data: Record<string, any>
  is_read: boolean
  read_at: string | null
  time_ago: string
  icon: string
  action_url: string | null
  created_at: string
}

/**
 * Notification categories — matches backend Notification::CATEGORY_* constants.
 */
export type NotificationCategory =
  | 'takeover'
  | 'conversation'
  | 'booking'
  | 'payment'
  | 'channel'
  | 'team'
  | 'system'

/**
 * Notification priority levels — matches backend priority column values.
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

/**
 * User notification settings — matches backend UserNotificationSettingResource.
 *
 * Backend: App\Http\Resources\V1\Platform\UserNotificationSettingResource
 */
export interface UserNotificationSettings {
  id: number
  notify_takeover: boolean
  notify_conversation: boolean
  notify_booking: boolean
  notify_payment: boolean
  notify_channel: boolean
  notify_team: boolean
  notify_system: boolean
  email_notifications: boolean
  in_app_notifications: boolean
  sound_enabled: boolean
  disabled_types: string[]
  updated_at: string
}

/**
 * Category metadata — colors and icons from backend UserNotificationSetting::getAvailableCategories().
 */
export const NOTIFICATION_CATEGORY_META: Record<NotificationCategory, {
  icon: string
  color: string
  label: string
  labelAr: string
  description: string
}> = {
  takeover: {
    icon: 'user-check',
    color: '#3B82F6',
    label: 'AI Takeover & Intervention',
    labelAr: 'تحويل المحادثات والتدخل البشري',
    description: 'Alerts when AI hands over a conversation, assigns a guest to human staff, or requests urgent intervention.',
  },
  conversation: {
    icon: 'message-square',
    color: '#EF4444',
    label: 'Priority & VIP Conversations',
    labelAr: 'المحادثات الهامة وكبار الزوار',
    description: 'Real-time alerts for VIP inquiries, high-value leads, and urgent guest requests.',
  },
  booking: {
    icon: 'calendar',
    color: '#C5A869',
    label: 'Bookings & Reservations',
    labelAr: 'الحجوزات والتعديلات والإلغاء',
    description: 'Notifications whenever a new booking is created, existing reservation is modified, or a cancellation occurs.',
  },
  payment: {
    icon: 'credit-card',
    color: '#10B981',
    label: 'Payments & Transactions',
    labelAr: 'المدفوعات والمعاملات المالية',
    description: 'Real-time alerts when guest payments are verified, confirmed, or updated.',
  },
  channel: {
    icon: 'share-2',
    color: '#8B5CF6',
    label: 'Channels & Integrations',
    labelAr: 'قنوات الاتصال والربط',
    description: 'Status updates for WhatsApp Business, Instagram, and Messenger integrations.',
  },
  team: {
    icon: 'users',
    color: '#6366F1',
    label: 'Team & Staff Updates',
    labelAr: 'فريق العمل والصلاحيات',
    description: 'Notifications for newly invited or assigned team members, removals, and role/permission changes.',
  },
  system: {
    icon: 'alert-triangle',
    color: '#F59E0B',
    label: 'System Alerts & Maintenance',
    labelAr: 'تنبيهات النظام والصيانة',
    description: 'Operational notices, server maintenance windows, and critical platform health alerts.',
  },
}

/**
 * All 13 notification types grouped by category.
 * Matches backend UserNotificationSetting::getAvailableTypes().
 */
export const NOTIFICATION_TYPES: Record<NotificationCategory, Array<{
  type: string
  name: string
  nameAr: string
  description: string
}>> = {
  takeover: [
    { type: 'takeover.conversation_assigned', name: 'Conversation Assigned', nameAr: 'تعيين محادثة لموظف', description: 'When a guest conversation is assigned to human staff.' },
    { type: 'takeover.conversation_transferred', name: 'Conversation Transferred', nameAr: 'تحويل محادثة لقسم آخر', description: 'When a conversation is transferred between departments.' },
    { type: 'takeover.human_intervention_required', name: 'Intervention Required', nameAr: 'طلب تدخل بشري عاجل', description: 'When a guest explicitly requests human agent assistance.' },
    { type: 'takeover.ai_conversation_completed', name: 'AI Conversation Completed', nameAr: 'اكتمال المحادثة عبر الذكاء الاصطناعي', description: 'When AI successfully resolves and closes an inquiry.' },
  ],
  conversation: [
    { type: 'conversation.priority', name: 'Hot / Priority Conversation', nameAr: 'محادثة ساخنة / ذات أولوية', description: 'High-value or VIP guest conversation.' },
  ],
  booking: [
    { type: 'booking.created', name: 'New Booking Created', nameAr: 'حجز جديد', description: 'New guest reservation confirmed.' },
    { type: 'booking.updated', name: 'Booking Updated', nameAr: 'تعديل بيانات الحجز', description: 'Dates, rooms, or guest details changed.' },
    { type: 'booking.cancelled', name: 'Booking Cancelled', nameAr: 'إلغاء حجز', description: 'Reservation cancelled by guest or staff.' },
  ],
  payment: [
    { type: 'payment.confirmed', name: 'Payment Confirmed', nameAr: 'تأكيد الدفع', description: 'Deposit or full booking payment verified.' },
  ],
  channel: [
    { type: 'channel.connected', name: 'Channel Connected', nameAr: 'ربط قناة جديدة', description: 'WhatsApp, Instagram, or Messenger connected.' },
    { type: 'channel.disconnected', name: 'Channel Disconnected', nameAr: 'فصل القناة', description: 'Channel disconnected from workspace.' },
    { type: 'channel.reconnect_required', name: 'Reconnect Required', nameAr: 'إعادة ربط القناة مطلوبة', description: 'Token expired or permissions need renewal.' },
  ],
  team: [
    { type: 'team.member_added', name: 'Team Member Added', nameAr: 'إضافة عضو جديد للفريق', description: 'New staff member joined the hotel workspace.' },
    { type: 'team.member_removed', name: 'Team Member Removed', nameAr: 'إزالة عضو من الفريق', description: 'Staff member removed from the team.' },
    { type: 'team.role_changed', name: 'Role / Permission Changed', nameAr: 'تعديل الدور والصلاحيات', description: 'Security role or permission updated.' },
  ],
  system: [
    { type: 'system.alert', name: 'System Alert', nameAr: 'تنبيه نظام', description: 'Scheduled maintenance or operational announcements.' },
  ],
}
