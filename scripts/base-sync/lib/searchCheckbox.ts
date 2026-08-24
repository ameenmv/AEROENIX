import { styleText } from 'node:util'
import {
  createPrompt,
  isDownKey,
  isEnterKey,
  isSpaceKey,
  isUpKey,
  makeTheme,
  Separator,
  useEffect,
  useKeypress,
  useMemo,
  usePagination,
  usePrefix,
  useState,
} from '@inquirer/core'
import figures from '@inquirer/figures'

const checkboxTheme = {
  icon: {
    checked: styleText('green', figures.circleFilled),
    unchecked: figures.circle,
    cursor: figures.pointer,
    disabledChecked: styleText('green', figures.circleDouble),
    disabledUnchecked: '-',
  },
  style: {
    disabled: (text: string) => styleText('dim', text),
    searchTerm: (text: string) => styleText('cyan', text),
    description: (text: string) => styleText('cyan', text),
    renderSelectedChoices: (selectedChoices: { short: string }[]) =>
      selectedChoices.map(choice => choice.short).join(', '),
    keysHelpTip: (keys: [string, string][]) =>
      keys
        .map(([key, action]) => `${styleText('bold', key)} ${styleText('dim', action)}`)
        .join(styleText('dim', ' • ')),
  },
}

interface Choice<Value> {
  value: Value
  name?: string
  description?: string
  short?: string
  disabled?: boolean | string
}

function isSelectable<Value>(item: Choice<Value> | Separator): item is Choice<Value> {
  return !Separator.isSeparator(item) && !item.disabled
}

function normalizeChoices<Value>(choices: (Choice<Value> | Separator)[]): (Choice<Value> | Separator)[] {
  return choices.map((choice) => {
    if (Separator.isSeparator(choice))
      return choice
    const name = choice.name ?? String(choice.value)
    return {
      value: choice.value,
      name,
      short: choice.short ?? name,
      disabled: choice.disabled ?? false,
      description: choice.description,
    }
  })
}

export const searchCheckbox = createPrompt(
  <Value>(
    config: {
      message: string
      source: (term: string | undefined, opt: { signal: AbortSignal }) => Promise<(Choice<Value> | Separator)[]>
      pageSize?: number
      validate?: (items: Value[]) => boolean | string | Promise<boolean | string>
      theme?: any
      defaultSelected?: { value: Value, short: string }[]
    },
    done: (value: Value[]) => void,
  ) => {
    const { pageSize = 7, validate = () => true, defaultSelected = [] } = config
    const theme = makeTheme(checkboxTheme as any, config.theme) as any
    const [status, setStatus] = useState('loading')
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState<(Choice<Value> | Separator)[]>([])
    const [searchError, setSearchError] = useState<string | undefined>()

    // Manage selected items
    const [selectedItems, setSelectedItems] = useState<{ value: Value, short: string }[]>(defaultSelected)

    const prefix = usePrefix({ status, theme })

    const bounds = useMemo(() => {
      const first = searchResults.findIndex(isSelectable)
      const last = searchResults.findLastIndex(isSelectable)
      return { first, last }
    }, [searchResults])

    const [active = bounds.first, setActive] = useState<number>()

    useEffect(() => {
      const controller = new AbortController()
      setStatus('loading')
      setSearchError(undefined)

      const fetchResults = async () => {
        try {
          const results = await config.source(searchTerm || undefined, {
            signal: controller.signal,
          })

          if (!controller.signal.aborted) {
            const normalized = normalizeChoices(results)
            setActive(normalized.findIndex(isSelectable) !== -1 ? normalized.findIndex(isSelectable) : undefined)
            setSearchError(undefined)
            setSearchResults(normalized)
            setStatus('idle')
          }
        }
        catch (error) {
          if (!controller.signal.aborted && error instanceof Error) {
            setSearchError(error.message)
          }
        }
      }

      void fetchResults()

      return () => {
        controller.abort()
      }
    }, [searchTerm])

    const selectedChoice = active !== undefined ? searchResults[active] : undefined

    useKeypress(async (key, rl) => {
      if (isEnterKey(key)) {
        setStatus('loading')
        const selection = selectedItems.map(i => i.value)
        const isValid = await validate(selection)
        setStatus('idle')

        if (isValid === true) {
          setStatus('done')
          done(selection)
        }
        else {
          setSearchError(isValid || 'You must provide a valid value')
        }
      }
      else if (isSpaceKey(key)) {
        // Just selecting the item, but restoring the search loop context?
        if (selectedChoice && isSelectable(selectedChoice)) {
          const isChecked = selectedItems.some(i => i.value === selectedChoice.value)
          if (isChecked) {
            setSelectedItems(selectedItems.filter(i => i.value !== selectedChoice.value))
          }
          else {
            setSelectedItems([...selectedItems, { value: selectedChoice.value, short: selectedChoice.short! }])
          }
        }
      }
      else if (status !== 'loading' && (isUpKey(key) || isDownKey(key))) {
        // rl.clearLine(0);
        if (
          active !== undefined
          && ((isUpKey(key) && active !== bounds.first)
            || (isDownKey(key) && active !== bounds.last))
        ) {
          const offset = isUpKey(key) ? -1 : 1
          let next = active
          do {
            next = (next + offset + searchResults.length) % searchResults.length
          } while (!isSelectable(searchResults[next]))
          setActive(next)
        }
      }
      else {
        setSearchTerm(rl.line)
      }
    })

    const message = theme.style.message(config.message, status)

    // Disable usePagination loop feature for now by default to avoid issues finding active
    const page = usePagination({
      items: searchResults,
      active: active ?? 0,
      renderItem({ item, isActive }) {
        if (Separator.isSeparator(item)) {
          return ` ${item.separator}`
        }

        const isChecked = selectedItems.some(i => i.value === item.value)
        const checkbox = isChecked ? theme.icon.checked : theme.icon.unchecked
        const cursor = isActive ? theme.icon.cursor : ' '

        if (item.disabled) {
          const disabledLabel = typeof item.disabled === 'string' ? item.disabled : '(disabled)'
          const cb = isChecked ? theme.icon.disabledChecked : theme.icon.disabledUnchecked
          return theme.style.disabled(`${cursor}${cb} ${item.name} ${disabledLabel}`)
        }

        const color = isActive ? theme.style.highlight : (x: string) => x
        return color(`${cursor}${checkbox} ${item.name}`)
      },
      pageSize,
      loop: false,
    })

    if (status === 'done') {
      const answer = theme.style.answer(theme.style.renderSelectedChoices(selectedItems))
      return [prefix, message, answer].filter(Boolean).join(' ')
    }

    let error
    if (searchError) {
      error = theme.style.error(searchError)
    }
    else if (searchResults.length === 0 && searchTerm !== '' && status === 'idle') {
      error = theme.style.error('No results found')
    }

    const helpLine = theme.style.keysHelpTip([
      ['↑↓', 'navigate'],
      ['space', 'select'],
      ['⏎', 'submit'],
    ])

    const searchStr = theme.style.searchTerm(searchTerm)
    const description = selectedChoice && !Separator.isSeparator(selectedChoice) ? selectedChoice.description : undefined

    const header = [prefix, message, searchStr].filter(Boolean).join(' ').trimEnd()
    const body = [
      error ?? page,
      ' ',
      description ? theme.style.description(description) : '',
      helpLine,
    ]
      .filter(Boolean)
      .join('\n')
      .trimEnd()

    return [header, body]
  },
)
