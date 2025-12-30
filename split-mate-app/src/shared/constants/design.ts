export const SPACING = {
  /** Extra small: 4px */
  xs: 4,
  /** Small: 8px */
  sm: 8,
  /** Medium: 12px */
  md: 12,
  /** Large: 16px */
  lg: 16,
  /** Extra large: 20px */
  xl: 20,
  /** 2x Extra large: 24px */
  "2xl": 24,
  /** 3x Extra large: 32px */
  "3xl": 32,
} as const;

export const BORDER_RADIUS = {
  /** Small: 8px - for small buttons and tags */
  sm: 8,
  /** Medium: 12px - for inputs, standard buttons, and small cards */
  md: 12,
  /** Large: 16px - for cards and containers */
  lg: 16,
  /** Extra large: 20px - for modals and full-width buttons */
  xl: 20,
  /** Full/circular: 9999px */
  full: 9999,
} as const;

export const FONT_SIZE = {
  /** Extra small: 12px - for captions and labels */
  xs: 12,
  /** Small: 14px - for secondary text */
  sm: 14,
  /** Base: 16px - for body text */
  base: 16,
  /** Large: 18px - for emphasized text and section titles */
  lg: 18,
  /** Extra large: 20px - for card titles and subtitles */
  xl: 20,
  /** 2x Extra large: 24px - for sub-headings */
  "2xl": 24,
  /** 3x Extra large: 32px - for large amounts */
  "3xl": 32,
  /** 4x Extra large: 36px - for page titles */
  "4xl": 36,
} as const;

export const FONT_WEIGHT = {
  normal: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  extrabold: "800" as const,
} as const;

export const ICON_SIZE = {
  /** Small: 16px - for inline icons */
  sm: 16,
  /** Medium: 20px - for buttons and list items */
  md: 20,
  /** Large: 24px - for navigation and settings */
  lg: 24,
  /** Extra large: 28px - for action buttons */
  xl: 28,
  /** 2x Extra large: 32px - for featured icons */
  "2xl": 32,
  /** 3x Extra large: 48px - for empty states and large CTAs */
  "3xl": 48,
} as const;

export const AVATAR_SIZE = {
  /** Small: 32px - for compact lists */
  sm: 32,
  /** Medium: 40px - for standard lists */
  md: 40,
  /** Large: 48px - for featured items */
  lg: 48,
} as const;

export const CARD_STYLES = {
  /** Padding for standard cards */
  padding: SPACING.lg,
  /** Border radius for cards */
  borderRadius: BORDER_RADIUS.lg,
  /** Margin bottom between cards */
  marginBottom: SPACING.md,
  /** Shadow styles for elevated cards */
  shadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
} as const;

export const HEADER_STYLES = {
  /** Page title font size */
  titleSize: FONT_SIZE["4xl"],
  /** Subtitle font size */
  subtitleSize: FONT_SIZE.lg,
  /** Margin bottom for headers */
  marginBottom: SPACING["2xl"],
  /** Gap between title and subtitle */
  titleGap: SPACING.sm,
} as const;

export const SECTION_STYLES = {
  /** Section title font size */
  titleSize: FONT_SIZE.lg,
  /** Margin bottom for sections */
  marginBottom: SPACING["2xl"],
  /** Gap between section title and content */
  titleGap: SPACING.md,
} as const;

export const INPUT_STYLES = {
  /** Padding horizontal */
  paddingHorizontal: SPACING.lg,
  /** Padding vertical */
  paddingVertical: SPACING.md,
  /** Font size */
  fontSize: FONT_SIZE.base,
  /** Border radius */
  borderRadius: BORDER_RADIUS.md,
  /** Border width */
  borderWidth: 1,
} as const;

export const BUTTON_STYLES = {
  /** Border radius */
  borderRadius: BORDER_RADIUS.md,
  /** Icon spacing */
  iconGap: SPACING.sm,
} as const;

export const EMPTY_STATE_STYLES = {
  /** Padding for empty state containers */
  padding: SPACING["2xl"],
  /** Border radius */
  borderRadius: BORDER_RADIUS.lg,
  /** Icon size */
  iconSize: ICON_SIZE["3xl"],
  /** Title font size */
  titleSize: FONT_SIZE.lg,
  /** Gap between icon and title */
  iconGap: SPACING.md,
  /** Gap between title and description */
  textGap: SPACING.sm,
} as const;
