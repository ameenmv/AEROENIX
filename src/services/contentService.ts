import { API_ENDPOINTS } from '@/constants/endpoints'
import api from './api'

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

export interface ContentSection {
  key: string
  fields: Record<string, string>
  attachment_type: 'video' | 'image' | 'none'
  attachment_url: string
}

export interface LegalPageContent {
  content: string
  last_updated: string
}

export interface StaticPageContent {
  id: number
  slug: string
  title: string
  is_published: boolean
  page_type: 'sections' | 'legal'
  sections?: ContentSection[]
  legal_content?: LegalPageContent
}

export const contentService = {
  async getBySlug(slug: string): Promise<StaticPageContent> {
    if (useMock) {
      // Return mock data for each page
      return getMockPage(slug)
    }
    const response = await api.get(API_ENDPOINTS.STATIC_PAGES.LIST, { params: { slug } })
    return response.data?.data || response.data
  },
  async updateBySlug(slug: string, data: Partial<StaticPageContent>): Promise<StaticPageContent> {
    if (useMock) {
      return { ...getMockPage(slug), ...data }
    }
    const response = await api.put(API_ENDPOINTS.STATIC_PAGES.LIST, data, { params: { slug } })
    return response.data?.data || response.data
  },
}

function getMockPage(slug: string): StaticPageContent {
  const pages: Record<string, StaticPageContent> = {
    home: {
      id: 1,
      slug: 'home',
      title: 'الصفحة الرئيسية',
      is_published: true,
      page_type: 'sections',
      sections: [
        {
          key: 'hero',
          fields: { line1: 'بودكاست', line2: 'أبجورة' },
          attachment_type: 'video',
          attachment_url: '/images/slider-compressed_j.m4v',
        },
        {
          key: 'about',
          fields: {
            heading1: 'نشارككم',
            heading2: 'المتعة',
            heading3: 'والإلهام',
            description: 'نصطحبكم في رحلة صوتية غنية بالمعرفة والإلهام.',
            cta_text: 'تعرّف علينا',
            cta_url: '/about',
          },
          attachment_type: 'video',
          attachment_url: '/images/home/about-video.m4v',
        },
        {
          key: 'travels',
          fields: {
            line1: 'رحلات',
            line2: 'أبجورة',
            line3: 'حول العالم',
            subtitle: 'اكتشف معنا',
            cta_text: 'شاهد الرحلات',
            cta_url: '/travels',
          },
          attachment_type: 'video',
          attachment_url: '/images/home/travels-video.m4v',
        },
        {
          key: 'podcast',
          fields: {
            label: 'بودكاست أبجورة',
            heading: 'استمع لأحدث الحلقات',
            cta_text: 'جميع الحلقات',
            cta_url: '/podcast',
          },
          attachment_type: 'video',
          attachment_url: '/images/home/podcast-video.m4v',
        },
        {
          key: 'shop',
          fields: {
            label: 'متجر أبجورة',
            heading: 'تسوّق الآن',
            cta_text: 'زيارة المتجر',
            cta_url: '/shop',
          },
          attachment_type: 'video',
          attachment_url: '/images/home/shop-video.m4v',
        },
        {
          key: 'services',
          fields: {
            line1: 'خدمات',
            line2: 'أبجورة',
            cta_text: 'اعرف المزيد',
            cta_url: '/services',
          },
          attachment_type: 'video',
          attachment_url: '/images/home/services-video.m4v',
        },
        {
          key: 'clients',
          fields: { title: 'عملاؤنا' },
          attachment_type: 'none',
          attachment_url: '',
        },
      ],
    },
    about: {
      id: 2,
      slug: 'about',
      title: 'من نحن',
      is_published: true,
      page_type: 'sections',
      sections: [
        {
          key: 'hero',
          fields: { title: 'من نحن' },
          attachment_type: 'image',
          attachment_url: '/images/about/hero.jpg',
        },
        {
          key: 'content',
          fields: {
            section_title: 'قصة أبجورة',
            description: 'بدأت أبجورة كمشروع شغف لصناعة محتوى عربي ملهم.',
          },
          attachment_type: 'video',
          attachment_url: '/images/about/content-video.m4v',
        },
        {
          key: 'middle',
          fields: { quote: 'إرث قصصي يدوم' },
          attachment_type: 'image',
          attachment_url: '/images/about/middle.jpg',
        },
        {
          key: 'profile',
          fields: {
            title1: 'أنا',
            title2: 'لبنى',
            title3: 'الخميس',
            intro: 'صانعة محتوى ومقدمة بودكاست أبجورة',
            bio: 'صانعة محتوى سعودية بدأت رحلتها في عالم البودكاست عام 2018.',
          },
          attachment_type: 'image',
          attachment_url: '/images/about/profile.jpg',
        },
      ],
    },
    services: {
      id: 3,
      slug: 'services',
      title: 'خدماتنا',
      is_published: true,
      page_type: 'sections',
      sections: [
        {
          key: 'hero',
          fields: { line1: 'خدماتنا' },
          attachment_type: 'video',
          attachment_url: '/images/services/hero-video.m4v',
        },
      ],
    },
    privacy: {
      id: 4,
      slug: 'privacy',
      title: 'سياسة الخصوصية',
      is_published: true,
      page_type: 'legal',
      legal_content: {
        content: '<h2>سياسة الخصوصية</h2><p>نحن في أبجورة نحترم خصوصيتك...</p>',
        last_updated: '2026-01-15',
      },
    },
    terms: {
      id: 5,
      slug: 'terms',
      title: 'الشروط والأحكام',
      is_published: true,
      page_type: 'legal',
      legal_content: {
        content: '<h2>الشروط والأحكام</h2><p>باستخدامك لموقع أبجورة...</p>',
        last_updated: '2026-01-15',
      },
    },
  }
  return pages[slug] || pages.home!
}
