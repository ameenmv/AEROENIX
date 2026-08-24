import { faker } from '@faker-js/faker'

function generateTrackingGuards(projectId: number, count: number) {
  const baseLocations = [
    { lat: 24.7136, lng: 46.6753, name: 'Riyadh Center' },
    { lat: 24.7265, lng: 46.689, name: 'Al Olaya' },
    { lat: 24.6917, lng: 46.6694, name: 'Al Malaz' },
    { lat: 24.7469, lng: 46.6381, name: 'Al Muruj' },
    { lat: 24.69, lng: 46.705, name: 'Al Rawdah' },
    { lat: 24.738, lng: 46.711, name: 'Al Worood' },
    { lat: 24.72, lng: 46.65, name: 'Al Sulaimaniyah' },
    { lat: 24.705, lng: 46.72, name: 'Al Nahda' },
  ]
  return Array.from({ length: count }, (_, i) => {
    const baseLocation = baseLocations[i % baseLocations.length]!
    const offset = (Math.random() - 0.5) * 0.01
    return {
      user_id: projectId * 100 + i + 1,
      name: `Guard ${i + 1}`,
      tracking_code: `TRK-${projectId}-${String(i + 1).padStart(3, '0')}`,
      lat: baseLocation.lat + offset,
      lng: baseLocation.lng + offset,
      staff_type_color: ['#4a9eff', '#22c55e', '#f59e0b', '#ef4444'][i % 4],
      staff_type_icon: 'guard',
      contract_id: (i % 3) + 1,
      contract_name: `Contract ${(i % 3) + 1}`,
      last_seen_at: new Date(Date.now() - Math.random() * 300000).toISOString(),
      status: i % 5 === 0 ? 'offline' : 'live',
    }
  })
}
function generateZones(projectId: number) {
  return [
    {
      id: projectId * 10 + 1,
      name: 'Main Zone',
      color: '#5179DD',
      is_route: false,
      coordinates: [
        { lat: 24.71, lng: 46.67 },
        { lat: 24.73, lng: 46.67 },
        { lat: 24.73, lng: 46.69 },
        { lat: 24.71, lng: 46.69 },
        { lat: 24.71, lng: 46.67 },
      ],
    },
    {
      id: projectId * 10 + 2,
      name: 'Patrol Route',
      color: '#22c55e',
      is_route: true,
      coordinates: [
        { lat: 24.72, lng: 46.68 },
        { lat: 24.725, lng: 46.685 },
        { lat: 24.73, lng: 46.69 },
        { lat: 24.735, lng: 46.695 },
      ],
    },
  ]
}
export const TRACKING_MAP_MOCK = {
  projects: [
    {
      id: 1,
      name: 'Riyadh Security Project',
      name_en: 'Riyadh Security Project',
      name_ar: 'مشروع أمن الرياض',
    },
    {
      id: 2,
      name: 'Jeddah Mall Security',
      name_en: 'Jeddah Mall Security',
      name_ar: 'أمن مول جدة',
    },
    {
      id: 3,
      name: 'Dammam Industrial Zone',
      name_en: 'Dammam Industrial Zone',
      name_ar: 'منطقة الدمام الصناعية',
    },
  ],
  getContracts: (projectId: number) => [
    { id: 1, name: `Contract A - Project ${projectId}` },
    { id: 2, name: `Contract B - Project ${projectId}` },
    { id: 3, name: `Contract C - Project ${projectId}` },
  ],
  getSnapshot: (projectId: number) => ({
    guards: generateTrackingGuards(projectId, 8),
    zones: generateZones(projectId),
    contracts: [
      { id: 1, name: `Contract A - Project ${projectId}` },
      { id: 2, name: `Contract B - Project ${projectId}` },
      { id: 3, name: `Contract C - Project ${projectId}` },
    ],
  }),
  getForceRefresh: (projectId: number) => {
    const guards = generateTrackingGuards(projectId, 8)
    return {
      summary: {
        live: guards.filter(g => g.status === 'live').length,
        offline: guards.filter(g => g.status === 'offline').length,
        failed: 0,
        total: guards.length,
      },
      guards: guards.map(g => ({
        ...g,
        status_reason: g.status === 'offline' ? 'Device offline for more than 5 minutes' : null,
      })),
      requested_at: new Date().toISOString(),
    }
  },
}
export const MOCK_DATA = {
  users: Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    status: faker.helpers.arrayElement(['active', 'inactive']),
    role: faker.helpers.arrayElement(['admin', 'editor', 'viewer']),
    created_at: faker.date.past().toISOString(),
  })),
}
