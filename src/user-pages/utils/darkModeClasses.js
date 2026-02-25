// Create new file: src/user-pages/utils/darkModeClasses.js

export const darkModeClasses = {
  // Backgrounds
  bg: {
    primary: 'bg-white dark:bg-[#1a1f2e]',
    secondary: 'bg-gray-50 dark:bg-[#0f1422]',
    card: 'bg-white dark:bg-[#1e2436]',
    cardHover: 'hover:bg-gray-50 dark:hover:bg-[#2a3042]',
    accent: 'bg-[#5EE6FE] dark:bg-[#5EE6FE]',
    accentLight: 'bg-[#EAFBFD] dark:bg-[#1e3a4a]',
    accentLighter: 'bg-[#E8FBFF] dark:bg-[#1e3a4a]/30',
    gradient: 'from-[#E8FBFF] to-[#FDFDFD] dark:from-[#1e3a4a]/30 dark:to-[#1e2436]',
  },
  
  // Text colors
  text: {
    primary: 'text-gray-800 dark:text-gray-100',
    secondary: 'text-gray-600 dark:text-gray-300',
    muted: 'text-gray-500 dark:text-gray-400',
    light: 'text-gray-400 dark:text-gray-500',
    accent: 'text-[#5EE6FE] dark:text-[#5EE6FE]',
    inverse: 'text-white dark:text-gray-100',
    danger: 'text-[#d93025] dark:text-[#f28b82]',
  },
  
  // Borders
  border: {
    light: 'border-gray-200 dark:border-gray-700',
    medium: 'border-gray-300 dark:border-gray-600',
    accent: 'border-[#5EE6FE] dark:border-[#5EE6FE]',
    accentLight: 'border-[#D6F0F3] dark:border-[#2a4a4f]',
  },
  
  // Cards
  card: {
    default: 'bg-white dark:bg-[#1e2436] border border-gray-200 dark:border-gray-700',
    hover: 'hover:shadow-lg dark:hover:shadow-gray-900/50 transition-shadow',
    selected: 'border-[#5EE6FE] bg-[#EAFBFD] dark:bg-[#1e3a4a] dark:border-[#5EE6FE]',
  },
  
  // Buttons
  button: {
    primary: 'bg-[#5EE6FE] hover:bg-[#3ecbe0] text-white dark:bg-[#5EE6FE] dark:hover:bg-[#4ac7dd] dark:text-white',
    secondary: 'bg-white dark:bg-[#2a3042] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#353b4d]',
    outline: 'border border-[#5EE6FE] text-[#5EE6FE] hover:bg-[#5EE6FE] hover:text-white dark:border-[#5EE6FE] dark:text-[#5EE6FE] dark:hover:bg-[#5EE6FE] dark:hover:text-white',
    disabled: 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed',
    danger: 'bg-[#d93025] hover:bg-[#b32c1e] text-white dark:bg-[#d93025] dark:hover:bg-[#b32c1e]',
  },
  
  // Inputs
  input: {
    default: 'bg-white dark:bg-[#2a3042] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#5EE6FE] focus:ring-[#5EE6FE]',
    readonly: 'bg-gray-50 dark:bg-[#1e2436] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300',
  },
  
  // Modals
  modal: {
    overlay: 'bg-black/40 dark:bg-black/60 backdrop-blur-sm',
    content: 'bg-white dark:bg-[#1e2436] shadow-xl',
  },
  
  // Calendar specific
  calendar: {
    day: 'bg-white dark:bg-[#1e2436] text-gray-800 dark:text-gray-200',
    daySelected: 'bg-[#5EE6FE] text-white dark:bg-[#5EE6FE]',
    dayDisabled: 'opacity-40 dark:opacity-30 cursor-not-allowed',
    dayHover: 'hover:bg-[#EEF8FA] dark:hover:bg-[#2a3042]',
  },
  
  // Sidebar (from your existing)
  sidebar: {
    item: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a3042]',
    active: 'text-[#5EE6FE] dark:text-[#5EE6FE] bg-[#5EE6FE]/10 dark:bg-[#5EE6FE]/20',
    section: 'text-gray-700 dark:text-gray-200',
  },
  
  // Tabs
  tab: {
    active: 'text-[#5EE6FE] dark:text-[#5EE6FE]',
    inactive: 'text-gray-400 dark:text-gray-500',
    indicator: 'bg-[#5EE6FE] dark:bg-[#5EE6FE]',
  },
  
  // Time slots
  timeSlot: {
    available: 'bg-white dark:bg-[#1e2436] border border-gray-100 dark:border-gray-700 hover:bg-[#EEF8FA] dark:hover:bg-[#2a3042]',
    selected: 'bg-[#5EE6FE] text-white dark:bg-[#5EE6FE]',
    booked: 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed',
  },
};