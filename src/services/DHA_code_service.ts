
export class DHAVerificationService {

	BASE30_DIGITS_INDEX = {} as any;
	BASE30_DIGITS: any;
	// static BASE30_DIGITS: any;
	constructor() {

		this.BASE30_DIGITS = '0123456789ABCDEFGHJKLMNPRTVWXY'.split('');
		this.BASE30_DIGITS.forEach((digit: any, decimalValue: any) => this.BASE30_DIGITS_INDEX[digit] = decimalValue);
	}

	//   BASE30_DIGITS.forEach((digit, decimalValue) => BASE30_DIGITS_INDEX[digit] = decimalValue);
	convertFromDecimal(number: any, toBase = 30) {
		if (toBase < 2 || toBase > 30) throw ("Invalid base ${toBase}");

		let result = '';

		while (number > 0) {
			result = this.BASE30_DIGITS[number % toBase] + result;
			number = Math.floor(number / toBase);
		}

		return result;
	}
	static calculateLuhnCheckDigit(number: any) {
		const digits = number.toString().split('').map((digit: string) => Number.parseInt(digit, 10));
		const parity = digits.length % 2;

		let sum = 0;

		digits.forEach((digit: any, position: any) => {
			if (position % 2 === parity) digit *= 2;
			if (digit > 9) digit -= 9;

			sum += digit;
		});

		const checksum = sum % 10;
		return checksum === 0 ? 0 : 10 - checksum;
	}

	/**
	 * @param code {String}
	 *
	 * @returns {Boolean}
	 */
	isValidDHACode(code: any) {
		try {
			const decimalCode = this.convertToDecimal(code).toString();
			const computedCheckDigit = DHAVerificationService.calculateLuhnCheckDigit(Number.parseInt(decimalCode, 10) * 10);
			return computedCheckDigit === 0;
		} catch (exception) {
			console.error(exception);
			return false;
		}
	}
	convertToDecimal(number: any): any {
		if (number.length == 0) return 0;

		const decimalValue = this.BASE30_DIGITS_INDEX[number[0]];

		if (decimalValue === undefined || decimalValue === null)
			throw ("Invalid base ${fromBase} number: ${number}");

		return decimalValue * 30 ** (number.length - 1) + this.convertToDecimal(number.slice(1));
	}

	//   return {isValidDHACode};
}
// const DHACodes = (() => {

//   /**
//    * Converts any number in the DHA base 30 character set to a decimal value.
//    * 
//    * @param number {String}
//    * @param fromBase {Number}
//    *
//    * @returns Number
//    */


//   /**
//    * Convert any decimal value to any base within DHA's base 30 character set.
//    * 
//    * @param number {Number}
//    * @param toBase {Number}
//    *
//    * @returns {String}
//    */


//   /**
//    * Returns the Luhn checksum for given number.
//    * 
//    * @param number {Number}
//    * @returns {Number}
//    */

// })();
