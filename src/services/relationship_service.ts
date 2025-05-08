import { Service } from '@/services/service'
import { getFullName } from '@/interfaces/name'
import { Relationship } from '@/interfaces/relationship'
import { getPersonAttribute } from '@/interfaces/personAttribute';
import { get } from 'lodash';
export class RelationshipService extends Service {
	constructor() {
		super()
	}

	static getRelationships(patientID: number) {
		return super.getJson(`/people/${patientID}/relationships`);
	}

	static async getGuardianDetails(patientID: number) {
		return await this.getRelationships(patientID).then((relation: Relationship[]) => {
			return relation.map((element: Relationship) => {
				const names = get(element, "relation.names[0]");
				return {
					name: names ? getFullName(names) : "",
					relationshipType: get(element, "type.b_is_to_a", ''),
					phoneNumber: getPersonAttribute(get(element, "relation.person_attributes", []), 12)
				}
			});
		});
	}
}