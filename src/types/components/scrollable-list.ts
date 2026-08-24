export interface ListItem {
  id: string | number
  label: string
  badge?: string
  badgeColor?: string
  [key: string]: any
}
export interface Props {
  items?: ListItem[]
  showBadge?: boolean
}
