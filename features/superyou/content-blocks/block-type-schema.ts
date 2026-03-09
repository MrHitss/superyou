/**
 * Block type schema types aligned to block_types API response.
 * Used to drive block-wise edit forms (pencil icon) from JSON schema only.
 */

export type SchemaFieldType =
  | 'text'
  | 'textarea'
  | 'url'
  | 'image'
  | 'select'
  | 'boolean'
  | 'schedule';

export interface SchemaFieldDef {
  type: SchemaFieldType;
  group?: string;
  label?: string;
  order?: number;
  required?: boolean;
  default?: string | number | boolean;
  max_length?: number;
  options?: string[];
  source?: string; // e.g. 'user_forms'
}

export interface SchemaContent {
  [fieldKey: string]: SchemaFieldDef;
}

export interface SchemaSettings {
  [fieldKey: string]: SchemaFieldDef;
}

export interface SchemaContainer {
  max_items?: number;
  min_items?: number;
  allowed_children?: string[];
}

export interface BlockTypeSchemaJson {
  content?: SchemaContent;
  settings?: SchemaSettings;
  container?: SchemaContainer;
}

export interface BlockTypeDefinition {
  uuid: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  handler_key: string;
  schema_json: BlockTypeSchemaJson;
  version: number;
  is_active: boolean;
  is_pro: boolean;
  sort_order: number;
}

/** Static block type definitions matching block_types API response */
export const BLOCK_TYPE_DEFINITIONS: BlockTypeDefinition[] = [
  {
    uuid: '6ea042c3-4daf-4914-ba4d-f90a91fa4b49',
    name: 'Header',
    slug: 'header',
    description: 'Profile header with title and optional avatar',
    icon: 'heading',
    category: 'layout',
    handler_key: 'header',
    schema_json: {
      content: {
        title: {
          type: 'text',
          group: 'general',
          label: 'Header Text',
          order: 1,
          required: true,
          max_length: 120,
        },
      },
      settings: {
        alignment: {
          type: 'select',
          group: 'display',
          order: 1,
          default: 'center',
          options: ['left', 'center', 'right'],
        },
      },
    },
    version: 1,
    is_active: true,
    is_pro: false,
    sort_order: 1,
  },
  {
    uuid: 'c058a916-9006-49d0-9dac-2bb81b6e149b',
    name: 'Link',
    slug: 'link',
    description: 'Clickable link block with title, URL, and optional thumbnail',
    icon: 'link',
    category: 'content',
    handler_key: 'link',
    schema_json: {
      content: {
        cta: { type: 'text', group: 'general', order: 4, default: 'Visit' },
        url: { type: 'url', group: 'general', order: 5, required: true },
        title: { type: 'text', group: 'general', order: 1, required: true },
        thumbnail: { type: 'image', group: 'general', order: 3 },
        description: { type: 'textarea', group: 'general', order: 2 },
      },
      settings: {
        layout: {
          type: 'select',
          group: 'display',
          order: 1,
          options: ['card', 'minimal', 'outlined', 'full_width'],
        },
        schedule: { type: 'schedule', group: 'visibility', order: 4 },
        animation: {
          type: 'select',
          group: 'display',
          order: 2,
          options: ['none', 'fade', 'slide_up', 'zoom'],
        },
        is_highlight: { type: 'boolean', group: 'display', order: 3, default: false },
      },
    },
    version: 1,
    is_active: true,
    is_pro: false,
    sort_order: 2,
  },
  {
    uuid: '83aac54a-dd43-4cb5-b8cf-d409047da33b',
    name: 'WhatsApp',
    slug: 'whatsapp',
    description: 'DM me on WhatsApp button with optional prefilled message',
    icon: 'message-circle',
    category: 'content',
    handler_key: 'whatsapp',
    schema_json: {
      content: {
        cta: { type: 'text', group: 'general', order: 4, default: 'DM me on WhatsApp' },
        title: { type: 'text', group: 'general', order: 1, required: true },
        number: { type: 'text', group: 'whatsapp', order: 6, required: true },
        thumbnail: { type: 'image', group: 'general', order: 3 },
        phone_code: { type: 'text', group: 'whatsapp', order: 5, required: true },
        description: { type: 'textarea', group: 'general', order: 2 },
        prefilled_message: { type: 'textarea', group: 'whatsapp', order: 7 },
      },
      settings: {
        layout: {
          type: 'select',
          group: 'display',
          order: 1,
          options: ['card', 'minimal', 'outlined', 'full_width'],
        },
        schedule: { type: 'schedule', group: 'visibility', order: 3 },
        animation: {
          type: 'select',
          group: 'display',
          order: 2,
          options: ['none', 'fade', 'slide_up', 'zoom'],
        },
      },
    },
    version: 1,
    is_active: true,
    is_pro: false,
    sort_order: 3,
  },
  {
    uuid: '267e4244-827c-45b4-856a-84fa51921d34',
    name: 'Form',
    slug: 'form',
    description: 'Embed a lead form by form_id',
    icon: 'file-input',
    category: 'module',
    handler_key: 'form',
    schema_json: {
      content: {
        form_id: {
          type: 'select',
          group: 'general',
          order: 1,
          source: 'user_forms',
          required: true,
        },
      },
      settings: {
        layout: {
          type: 'select',
          group: 'display',
          order: 1,
          options: ['card', 'minimal', 'outlined', 'full_width'],
        },
        schedule: { type: 'schedule', group: 'visibility', order: 3 },
        animation: {
          type: 'select',
          group: 'display',
          order: 2,
          options: ['none', 'fade', 'slide_up', 'zoom'],
        },
      },
    },
    version: 1,
    is_active: true,
    is_pro: false,
    sort_order: 4,
  },
  {
    uuid: 'fc1f74d3-43d4-4ff0-9c7a-2f3c25054029',
    name: 'Carousel',
    slug: 'carousel',
    description: 'Container for link/whatsapp/form blocks',
    icon: 'layout-grid',
    category: 'layout',
    handler_key: 'carousel',
    schema_json: {
      content: {
        title: { type: 'text', group: 'general', order: 1, required: false },
      },
      settings: {
        schedule: { type: 'schedule', group: 'visibility', order: 2 },
        animation: {
          type: 'select',
          group: 'display',
          order: 1,
          options: ['none', 'fade', 'slide_up', 'zoom'],
        },
      },
      container: {
        max_items: 10,
        min_items: 1,
        allowed_children: ['link', 'whatsapp', 'form'],
      },
    },
    version: 1,
    is_active: true,
    is_pro: false,
    sort_order: 5,
  },
];

const BY_HANDLER = new Map<string, BlockTypeDefinition>(
  BLOCK_TYPE_DEFINITIONS.map((d) => [d.handler_key, d])
);

export function getBlockTypeByHandlerKey(
  handlerKey: string,
  definitions?: BlockTypeDefinition[]
): BlockTypeDefinition | undefined {
  if (definitions?.length) {
    return definitions.find((d) => d.handler_key === handlerKey);
  }
  return BY_HANDLER.get(handlerKey);
}

/** Block-wise features derived from schema: when to show Edit, WhatsApp, Copy, Favourite, Layout */
export interface BlockFeatures {
  /** Show Edit (pencil) – block has content fields (general group) */
  showEdit: boolean;
  /** Show WhatsApp icon – only for whatsapp block, opens whatsapp group fields */
  showWhatsApp: boolean;
  /** Copy – common for all blocks */
  showCopy: boolean;
  /** Favourite/Highlight – block schema has settings.is_highlight (boolean) */
  showFavourite: boolean;
  /** Layout – block schema has settings.layout (select) */
  showLayout: boolean;
}

export function getBlockFeatures(def: BlockTypeDefinition | undefined): BlockFeatures {
  if (!def) {
    return {
      showEdit: true,
      showWhatsApp: false,
      showCopy: true,
      showFavourite: false,
      showLayout: false,
    };
  }
  const content = def.schema_json?.content ?? {};
  const settings = def.schema_json?.settings ?? {};
  const hasContent = Object.keys(content).length > 0;
  const hasIsHighlight = typeof settings['is_highlight'] !== 'undefined';
  const hasLayout = typeof settings['layout'] !== 'undefined';

  return {
    showEdit: hasContent,
    showWhatsApp: def.handler_key === 'whatsapp',
    showCopy: true,
    showFavourite: hasIsHighlight,
    showLayout: hasLayout,
  };
}
