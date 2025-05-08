import { Service } from "./service";
import ConceptNameDictionary from "@/Data/ConceptNameDictionary"; 

export class ConceptService extends Service {
    constructor() {
        super()
    }

    static getConceptsByCategory(categoryName: string, useSortIndex=false) {
        const data = ConceptNameDictionary.filter((i: any) => {
            try {
                return i.categories.includes(categoryName)
            } catch (e) {
                // nothing of concern
                return false
            }
        })
        if (useSortIndex) return data.sort((a: any, b: any) =>{
            try {
                return a.sortIndex[categoryName] > b.sortIndex[categoryName] 
                    ? 1
                    : 0 
            }catch(e) {
                // Ooh well, that's life
                return 0
            }
        })
        return data
    }

    static async getConceptSet(conceptName: string, filter = '') {
        const conceptId = await this.getConceptID(conceptName)
        const concepts = super.getJson('concept_set', {
            id: conceptId,
            name: filter
        })

        if (concepts) return concepts
    }

    static async getConceptName(conceptId: number) {
        const concept = this.getCachedConceptName(conceptId)

        if (concept) return concept

        return this.getConceptNameFromApi(conceptId)
    }

    static getConceptID(conceptName: string, strictMode=false) {
        try {
            return this.getCachedConceptID(conceptName, strictMode)
        } catch (e) {
            return this.getConceptIDFromApi(conceptName)
        }
    }

    static getCachedConceptID(conceptName: string, strictMode=false) {
        const concepts = ConceptNameDictionary.filter(item => {
           if (!strictMode) return item.name.match(new RegExp(conceptName, 'i'))

           return item.name.toLowerCase() === conceptName.toLowerCase()
        })
        return this.resolveConcept(concepts, conceptName)
    }

    static async getConceptIDFromApi(name: string) {
        const concepts = await super.getJson(`concepts`, {name})
        return this.resolveConcept(concepts, name)
    }
    
    static async getConceptNameFromApi(conceptId: number) {
        const concept = await super.getJson(`concepts/${conceptId}`)

       
        if (concept) return concept.concept_names[0].name
    }

    static getCachedConceptName(conceptId: number) {
        const concepts = ConceptNameDictionary.filter(item => {
            return item.concept_id === conceptId
        })
        
        if (concepts.length >= 1) return concepts[0].name
    }

    private static resolveConcept(concepts: any, conceptName: string) {
        if (concepts.length === 1) return concepts[0].concept_id

        throw `Concept name ${conceptName} was not found or has a duplicates`
    }
}