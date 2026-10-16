export interface ReportKpis {
  avg_response_time: {
    value: string
    label: string
    description?: string
  }
  guest_satisfaction: {
    value: string
    rating: number
    stars: number
    label: string
  }
  bot_mistakes: {
    value: number
    period: string
    label: string
    trend_color?: string
  }
  handover_rate: {
    value: string
    comparison: string
    trend: 'up' | 'down' | 'neutral'
    label: string
  }
}

export interface FunnelStage {
  label: string
  count: number
  color: string
  bar_percentage: number
}

export interface FunnelMetricsData {
  period: string
  month_label: string
  kpis: ReportKpis
  lead_funnel: {
    total_conversations: FunnelStage
    leads_generated: FunnelStage
    bookings_created: FunnelStage
    confirmed: FunnelStage
  }
}
