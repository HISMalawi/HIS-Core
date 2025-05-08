import { validateScanFormLinkageCode, zeroPadAdigit, dammCheckDigit } from "@/utils/Damm"
import { describe, it, expect } from "vitest"

describe('Validates Damm algorithm check digit generation', () => {
    it('Generates a valid check digit from strings', () => {
        const codes = ['1234/002/01', '1234-002-01','123400201']
        codes.forEach((code) => {
            expect(dammCheckDigit(code)).toMatch('9')
        })
    })
})

describe('Validates zero padded Digit utility function', () => {
    it('Applies two zeros to single digit of limit 3', () => {
        expect(zeroPadAdigit(3, 3)).toMatch('003')
    })
    it('Applies one zero to two digits of limit 3', () => {
        expect(zeroPadAdigit(30, 3)).toMatch('030')
    })
    it('Does not apply zero padding if limit is reached', () => {
        expect(zeroPadAdigit(302, 3)).toMatch('302')
    })
})

describe('Validate Damm check digit validation', () => {
    it('Verifies that the linkage code is valid', () => {
        const validLinkageCodes = ['1234-2-1-z','1234-2-1-Z', '1234-002-01-Z']
        validLinkageCodes.forEach((linkageCode) => {
            expect(validateScanFormLinkageCode(linkageCode)).toBeTruthy()
        })
    })
    it('Flags invalid linkage codes as false', () => {
        const invalidLinkageCodes = [
            '1234/2/1/Z',
            '1234-2-1-9', // Using actual check digit number instead of placeholder string "Z"
            '1234-2-1-N', 
            '1234210', 
            '323232A', 
            '1234-2-1-',
            '-2-1',
            '',
            '0'
        ]
        invalidLinkageCodes.forEach((linkageCode) => {
            expect(validateScanFormLinkageCode(linkageCode)).toBeFalsy()
        })
    })
})