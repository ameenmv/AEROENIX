/**
 * Field Type Registry — Defines all CMS field types for the FieldTypePicker and field display.
 */
import type { CmsFieldType } from '@/types/cms'
import {
  Calendar03Icon,
  CheckmarkBadge01Icon,
  CodeIcon,
  ColorsIcon,
  Database01Icon,
  File01Icon,
  GridIcon,
  Heading01Icon,
  HierarchyIcon,
  Image01Icon,
  Key01Icon,
  ListViewIcon,
  Mail01Icon,
  TextIcon,
  TextNumberSignIcon,
} from '@hugeicons/core-free-icons'

export interface FieldTypeDefinition {
  value: CmsFieldType
  label: string
  labelKey: string
  description: string
  descriptionKey: string
  icon: any
  color: string
}

const fieldTypeDefinitions: FieldTypeDefinition[] = [
  {
    value: 'text',
    label: 'Text',
    labelKey: 'cms.type_text',
    description: 'Small or long text like title or description',
    descriptionKey: 'cms.type_text_desc',
    icon: TextIcon,
    color: 'blue',
  },
  {
    value: 'textarea',
    label: 'Textarea',
    labelKey: 'cms.type_textarea',
    description: 'Multi-line text input',
    descriptionKey: 'cms.type_textarea_desc',
    icon: Heading01Icon,
    color: 'violet',
  },
  {
    value: 'text_editor',
    label: 'Rich Text',
    labelKey: 'cms.type_richtext',
    description: 'Rich text editor with formatting options',
    descriptionKey: 'cms.type_richtext_desc',
    icon: CodeIcon,
    color: 'purple',
  },
  {
    value: 'number',
    label: 'Number',
    labelKey: 'cms.type_number',
    description: 'Numbers (integer, float, decimal)',
    descriptionKey: 'cms.type_number_desc',
    icon: TextNumberSignIcon,
    color: 'rose',
  },
  {
    value: 'boolean',
    label: 'Boolean',
    labelKey: 'cms.type_boolean',
    description: 'Yes or no, 1 or 0, true or false',
    descriptionKey: 'cms.type_boolean_desc',
    icon: CheckmarkBadge01Icon,
    color: 'emerald',
  },
  {
    value: 'date',
    label: 'Date',
    labelKey: 'cms.type_date',
    description: 'A date picker with optional time',
    descriptionKey: 'cms.type_date_desc',
    icon: Calendar03Icon,
    color: 'amber',
  },
  {
    value: 'email',
    label: 'Email',
    labelKey: 'cms.type_email',
    description: 'Email field with validation format',
    descriptionKey: 'cms.type_email_desc',
    icon: Mail01Icon,
    color: 'orange',
  },
  {
    value: 'password',
    label: 'Password',
    labelKey: 'cms.type_password',
    description: 'Password field with encryption',
    descriptionKey: 'cms.type_password_desc',
    icon: Key01Icon,
    color: 'red',
  },
  {
    value: 'color',
    label: 'Color',
    labelKey: 'cms.type_color',
    description: 'Color picker with configurable format',
    descriptionKey: 'cms.type_color_desc',
    icon: ColorsIcon,
    color: 'pink',
  },
  {
    value: 'enumeration',
    label: 'Enumeration',
    labelKey: 'cms.type_select',
    description: 'List of values, then pick one',
    descriptionKey: 'cms.type_select_desc',
    icon: ListViewIcon,
    color: 'teal',
  },
  {
    value: 'media',
    label: 'Media',
    labelKey: 'cms.type_media',
    description: 'Files like images, videos, etc',
    descriptionKey: 'cms.type_media_desc',
    icon: Image01Icon,
    color: 'pink',
  },
  {
    value: 'relation',
    label: 'Relation',
    labelKey: 'cms.type_relation',
    description: 'Link to another resource (one-to-one or one-to-many)',
    descriptionKey: 'cms.type_relation_desc',
    icon: HierarchyIcon,
    color: 'indigo',
  },
  {
    value: 'component',
    label: 'Component',
    labelKey: 'cms.type_component',
    description: 'Nested structured data',
    descriptionKey: 'cms.type_component_desc',
    icon: GridIcon,
    color: 'cyan',
  },
  {
    value: 'json',
    label: 'JSON',
    labelKey: 'cms.type_json',
    description: 'Data in JSON format',
    descriptionKey: 'cms.type_json_desc',
    icon: Database01Icon,
    color: 'slate',
  },
  {
    value: 'rich_text_blocks',
    label: 'Rich Text Blocks',
    labelKey: 'cms.type_rich_text_blocks',
    description: 'Block-based editor content',
    descriptionKey: 'cms.type_rich_text_blocks_desc',
    icon: File01Icon,
    color: 'violet',
  },
]

/** Get all field types for the picker dialog */
export function getPickerTypes(): FieldTypeDefinition[] {
  return fieldTypeDefinitions
}

/** Get a single field type definition by value */
export function getFieldTypeDef(type: CmsFieldType): FieldTypeDefinition | undefined {
  return fieldTypeDefinitions.find(d => d.value === type)
}
