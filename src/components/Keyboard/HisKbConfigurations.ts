/**
 * Default keyboard configurations.
 * 
 * Configuration consists of one or two keyboard layouts
 * to be displayed at once.
 */

import {
    NUMBER_PAD_LO,
    MONTHLY_DAYS_LO,
    ALPHABETICAL_LO,
    QWERTY_LO,
    SYMBOLS,
    PASSWORD_KEYBOARD,
    SPECIAL_CHARACTERS_LO_2
} from "@/components/Keyboard/KbLayouts";

export const SYMBOLS_CONFIG = [
    SYMBOLS,
    [
        ['', 'Delete']
    ]
]

export const NUMBERS_ONLY = [
    NUMBER_PAD_LO,
    [
        ['Delete']
    ]
]

export const NUMBERS_WITH_UNKNOWN = [
    NUMBER_PAD_LO,
    [
        ['Delete', 'Unknown']
    ]
]

export const NUMBERS_WITH_ESTIMATE = [
    NUMBER_PAD_LO,
    [
        ['N/A'],
        ['Delete', 'Unknown']
    ]
]

export const NUMBERS_WITHOUT_NA_UNKNOWN = [
    NUMBER_PAD_LO,
    [
        ['Delete']
    ]
]

export const NUMBERS = [
    NUMBER_PAD_LO,
    [
        ['Unknown', 'Delete'],
        ['Qwerty', 'A-Z'],
    ]
]

export const MONTHLY_DAYS = [
    MONTHLY_DAYS_LO,
    [
        ['Unknown']
    ]
]

export const A_TO_Z = [
    ALPHABETICAL_LO,
    [
        ['0-9', 'Delete'],
        ['Qwerty', 'Unknown'],
        ['', 'Space']
    ]
]

export const QWERTY = [
    QWERTY_LO,
    [
        ['', 'Delete'],
        ['?123', '0-9'],
        ['Space', 'Unknown']
    ]
]

export const PASSWORD_KEYBOARD_CONFIG = [
    PASSWORD_KEYBOARD,
    [
        ['@#'],
        ['Delete']
    ]
]

export const NID_CONFIG = [
    PASSWORD_KEYBOARD,
    [
        ['Delete']
    ]
]

export const SPECIAL_CHAR_KEYBOARD = [
    SPECIAL_CHARACTERS_LO_2,
    [
        ['ABC'],
        ['Delete']
    ]
]

/**
 * Navigation map for switching between different keyboard layouts
 */
export const KEY_BTN_NAV = [
    {
        btn: "ABC",
        keyboard: PASSWORD_KEYBOARD_CONFIG
    },
    {
        btn: '@#',
        keyboard: SPECIAL_CHAR_KEYBOARD
    },
    {
        btn: '0-9',
        keyboard: NUMBERS
    },
    {
        btn: '?123',
        keyboard: SYMBOLS_CONFIG
    },
    {   
        btn: 'A-Z',
        keyboard: A_TO_Z 
    },
    {
        btn: 'Qwerty',
        keyboard: QWERTY
    }
]
