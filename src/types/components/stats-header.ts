export interface Stat {
  label: string
  value: string | number
  hasBorder?: boolean
  accent?: boolean
}
export interface Props {
  title: string
  stats?: Stat[]
}
