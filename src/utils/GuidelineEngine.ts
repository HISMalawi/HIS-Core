/**
 * Compares patient facts against a predefined guideline Object.
*/
export interface DescriptionInterface {
    color?: 'primary' | 'secondary' | 'danger' | 'warning';
    info: (facts: FactsInterface) => any;
    text?: string;
    show: 'onChecked' | 'always';
}

export interface GuideLineInterface {
    title?: string;
    concept?: string;
    weight?: number;
    priority?: number;
    conditions: ConditionsInteface;
    actions?: Record<string, any>; //TODO: should <key, Function>
    data?: Record<string, any>;
    description?: DescriptionInterface;
    target?: string;
    targetEvent?: string;
}

export type FactsInterface = Record<string, any>
export type ConditionResolver = (value: any, facts: FactsInterface) => boolean | RegExpMatchArray | null
export type ConditionsInteface = Record<string, ConditionResolver>

/**
 * Match the facts with guidelines
 * @param facts 
 * @param conditions 
 * @returns 
 */
function isCondition(facts: FactsInterface, conditions: ConditionsInteface): boolean {
    const state = [] 
    const ignored = [-1, '', null, undefined]

    for(const prop in conditions) {
        if (!(prop in facts)) 
            continue
        
        const value = facts[prop]
        if (ignored.includes(value)) {
            state.push(false)
            continue
        }

        state.push(conditions[prop](value, facts))
    }
    return state.every(Boolean)
}

/**
 * Sort guidelines in the order of importance/relevance
 * @param findings 
 * @returns 
 */
function sortByPriority(findings: GuideLineInterface[]) {
    return findings.sort((a, b) => (a.priority && b.priority) && a.priority < b.priority ? -1 : 1)
}

function sortByWeight(findings: GuideLineInterface[]) {
    return findings.sort((a, b) => (a.weight && b.weight) && a.weight > b.weight ? -1 : 1)
}

export function logFindingsByWeight(guidelines: Record<string, GuideLineInterface>) {
    const findings: any = Object.keys(guidelines).map(i => ({ name: i, weight: guidelines[i].weight}))
    console.log(sortByWeight(findings).map((i: any) => `${i.weight} -> ${i.name}`))
}

/**
 * Check the guideline for matching facts and return matching object 
 * @param facts: key value pair for used for searching in guidelines
 * @param guidelines: A dictionary containing fixed rules/validations that conforms to GuideLineInterface
 * @param target: Used for matching a target defined in a guidlines before executing conditions
 * @param targetEvent: used for matching a target event in a guideline before executing conditions
 * @returns
 */
export function matchToGuidelines(
    facts: FactsInterface, 
    guidelines: Record<string, GuideLineInterface>,
    target='', 
    targetEvent='',
    sortBy='priority' as 'priority' | 'weight'): Array<GuideLineInterface> {
    const matches = []
    for(const guidelineIndex in guidelines) {
        const data: GuideLineInterface = guidelines[guidelineIndex]
        const targetValidations = [
            (data.target && target && data.target != target),
            (data.targetEvent && targetEvent 
                && data.targetEvent != targetEvent)
        ]

        if (targetValidations.some(Boolean)) {
            continue
        }

        if (isCondition(facts, data.conditions)) {
            data.title = guidelineIndex
            if (data.description) {
                data.description.text = data.description.info(facts)
            }
            matches.push(data)
        }
    }
    return sortBy === 'priority' ? sortByPriority(matches) : sortByWeight(matches)
}
