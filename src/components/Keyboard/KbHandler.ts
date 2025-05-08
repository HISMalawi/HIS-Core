export default function kbHandler(newInput: string, accumulator: string, casing?: 'lowercase' | 'uppercase'): string {
    let output = accumulator
    if (newInput.match(/enter/i)) {
        return `${output}\r\n`
    }
    if (newInput.match(/clear/i)) {
        return ''
    } else if (newInput.match(/delete|del/i)) {
        // Override Unknown text with new input
        if (output.match(/unknown/i) || output.match(/n\/a/i)) {
            output = ''
        } else {
            output = output.substring(0, output.length - 1)
        }
    } else if (newInput.match(/space/i)) {
        output = `${accumulator} `
    } else if (newInput.match(/unknown/i)) {
        output = 'Unknown'
    } else if (newInput.match(/n\/a/i)) {
        output = 'N/A'
    } else {
        // Override Unknown text with new input
        if (output.match(/unknown/i) || output.match(/n\/a/i)) {
            output = newInput
        } else {
            output = `${accumulator}${newInput}`
        }
    }
    if (typeof output === 'string' && output) {
        switch (casing) {
            case 'lowercase':
                output = output.toLowerCase()
                break;
            case 'uppercase':
                output = output.toUpperCase()
                break;
            default:
                output = output.charAt(0).toUpperCase() + output.slice(1)
                break;
        }
    }
    return output
}
