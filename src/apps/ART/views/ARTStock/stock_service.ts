import { Service } from "@/services/service"

interface Drug {
	drugID: number;
	shortName: string;
	fullName: string;
	packSizes: number[];
	categories?: string[];
}
const finalList: Drug[] = [
	{
		drugID: 105,
		shortName: "Acyclovir 200mg",
		fullName: "Acyclovir 200mg",
		packSizes: [30]
	},
	{
		drugID: 1044,
		shortName: "ABC 120 /3TC 60mg",
		fullName: "Abacavir and Lamivudine 120mg pack of 60 tablets",
		packSizes: [60],
		categories: ['p']
	},
	{
		drugID: 969,
		shortName: "ABC 600 / 3TC 300mg",
		fullName: "Abacavir sulfate 600mg / Lamivudine 300mg, tin of 30 tablets",
		packSizes: [30],
		categories: ['a']
	},
	{
		drugID: 932,
		shortName: "ATV 300 / r 100mg",
		fullName: "Atazanavir / Ritonavir 300 / 100mg, tin of 30 tablets",
		packSizes: [30],
		categories: ['a']
	},
	{
		drugID: 39,
		shortName: "AZT 300 /3TC 150mg",
		fullName: "Zidovudine / lamivudine 300 / 150mg, tin of 60 tablets"
		, packSizes: [60],
		categories: ['a']
	},
	{
		drugID: 731,
		shortName: "AZT 300 / 3TC 150 / NVP 200mg",
		fullName: "Zidovudine / lamivudine /Nevirapine 300 / 150 / 200mg, tin of 60 tablets"
		, packSizes: [60],
		categories: ['a']
	},
	{
		drugID: 732,
		shortName: "AZT 60 / 3TC 30 / NVP 50mg",
		fullName: "Zidovudine / lamivudine /Nevirapine 60 / 30 / 50mg, tin of 60 tablets"
		, packSizes: [60],
		categories: ['p']
	},
	{
		drugID: 736,
		shortName: "AZT 60 / 3TC 30mg",
		fullName: "Zidovudine / lamivudine 60 / 30mg, tin of 60 tablets"
		, packSizes: [60],
		categories: ['p']
	},
	{
		drugID: 963,
		shortName: "CPT 120mg",
		fullName: "Cotrimoxazole 120mg, blister pack of 1000 dispersible tablets",
		packSizes: [1000],
		categories: ['p']
	},
	{
		drugID: 297,
		shortName: "CPT 480mg",
		fullName: "Cotrimoxazole 480mg, tin of 1000 tablets",
		packSizes: [1000],
		categories: ['a']
	},
	{
		drugID: 576,
		shortName: "CPT 960mg",
		fullName: "Cotrimoxazole 960mg, blister pack of 1000 tablets"
		, packSizes: [1000],
		categories: ['a']
	},
	{
		drugID: 976,
		shortName: "DRV 600mg",
		fullName: "Darunavir 600mg pack of 60 tablets",
		packSizes: [60],
		categories: ['a']
	},
	{
		drugID: 980,
		shortName: "DTG 10mg",
		fullName: "Dolutegravir 10mg pack of 90 tablets",
		packSizes: [90]
	},
	{
		drugID: 982,
		shortName: "DTG 50mg",
		fullName: "Dolutegravir 50mg pack of 30 tablets",
		packSizes: [30],
		categories: ['a']
	},
	{
		drugID: 30,
		shortName: "EFV 200mg",
		fullName: "Efavirenz 200mg, tin of 90 tablets",
		packSizes: [90],
		categories: ['p']
	},
	{
		drugID: 11,
		shortName: "EFV 600mg",
		fullName: "Efavirenz 600mg, tin of 30 tablets"
		, packSizes: [30],
		categories: ['a']
	},
	{
		drugID: 978,
		shortName: "ETV 100mg",
		fullName: "Etravirine 100mg, tin of 120 tablets"
		, packSizes: [120],
		categories: ['a']
	},
	{
		drugID: 24,
		shortName: "Isoniazid 100mg",
		fullName: "Isoniazid (H) 100mg, blist packs of 100 tablets"
		, packSizes: [100],
		categories: ['p']
	},
	{
		drugID: 991,
		shortName: "Isoniazid 300mg",
		fullName: "Isoniazid (H) 300mg, blist packs of 1000 tablets"
		, packSizes: [1000, 672]
	},
	{
		drugID: 74,
		shortName: "LPV 100 / r 25mg",
		fullName: "Lopinavir / Ritonavir 100 / 25mg, tin of 60 tablets"
		, packSizes: [60],
		categories: ['p']
	},
	{
		drugID: 73,
		shortName: "LPV 200 / r 50mg",
		fullName: "Lopinavir / Ritonavir 200 / 50mg, tin of 120 tablets"
		, packSizes: [120],
		categories: ['a']
	},
	{
		drugID: 1045,
		shortName: "LPV 40 / r 10mg granules",
		fullName: "Lopinavir/Ritonavir(LPV/r ), 40/10mg granules, pack of 120 sachets"
		, packSizes: [120]
	},
	{
		drugID: 979,
		shortName: "LPV 40 / r 10mg pellets",
		fullName: "Lopinavir/Ritonavir(LPV/r ), 40/10mg granules, pack of 120 pellets"
		, packSizes: [120],
		categories: ['p']
	},
	{
		drugID: 22,
		shortName: "NVP 200mg",
		fullName: "Nevirapine 200mg, tin of 60 tablets"
		, packSizes: [60],
		categories: ['a']
	},
	{
		drugID: 968,
		shortName: "NVP 50mg",
		fullName: "Nevirapine 50mg, tin of 60 tablets"
		, packSizes: [60],
		categories: ['p']
	},
	{
		drugID: 1039,
		shortName: "Pyridoxine 25mg",
		fullName: "Pyridoxine (25mg)"
		, packSizes: [1000],
		categories: ['a']
	},
	{
		drugID: 977,
		shortName: "r 100mg",
		fullName: "Ritonavir 100mg pack of 60 tablets"
		, packSizes: [60],
		categories: ['a']
	},
	{
		drugID: 1043,
		shortName: "RAL 25mg",
		fullName: "Raltegravir 25mg pack of 60 tablets"
		, packSizes: [60],
		categories: ['p']
	},
	{
		drugID: 954,
		shortName: "RAL 400mg",
		fullName: "Raltegravir 400mg pack of 60 tablets"
		, packSizes: [60],
		categories: ['a']
	},
	{
		drugID: 1056,
		shortName: "Rifapentine 150mg",
		fullName: "Rifapentine 150mg pack of 24 tablets"
		, packSizes: [24],
		categories: ['a']
	},
	{
		drugID: 734,
		shortName: "TDF 300 / 3TC 300mg ",
		fullName: "Lamivudine / Tenofovir disoproxil fumarate 300 / 300mg, tin of 30 tablets"
		, packSizes: [30],
		categories: ['a']
	},
	{
		drugID: 735,
		shortName: "TDF 300 / 3TC 300 / EFV 600mg",
		fullName: "Tenofovir disoproxil fumarate / Lamivudine / Efavirenz 300 / 300 / 600mg, tin of 30 tablets"
		, packSizes: [30],
		categories: ['a']
	},
	{
		drugID: 983,
		shortName: "TDF 300 / 3TC 300 / DTG 50mg",
		fullName: "Tenofovir Disoproxil Fumarate/Lamivudine/Dolutegravir (TDF/3TC /DTG), 300/300/50mg, pack of 90 tablets"
		, packSizes: [90],
		categories: ['a']
	}
] as any
export class StockService extends Service {
	constructor() {
		super()
	}
	batchUpdate(batch: Record<string, any>) {
		return Service.postJson('/pharmacy/items/batch_update', batch)
	}
	postItems(items: any) {
		return Service.postJson('/pharmacy/batches', items);
	}
	getItems() {
		return Service.getJson('pharmacy/items', { paginate: false })
	}
	getItem(drugID: number) {
		return Service.getJson('pharmacy/items', { 'drug_id': drugID })
	}
	updateItem(batchID: number, vals: any) {
		return Service.putJson(`pharmacy/items/${batchID}`, vals)
	}
	relocateItems(batchID: number, items: any) {
		return Service.postJson(`pharmacy/items/${batchID}/reallocate`, items)
	}
	disposeItems(batchID: number, items: any) {
		return Service.postJson(`pharmacy/items/${batchID}/dispose`, items)
	}
	getConsumptionRate(drugID: number) {
		return Service.getJson(`pharmacy/drug_consumption`, {'drug_id': drugID})
	}
	drugList() {
		return finalList;
	}
	static getShortName(drugID: number) {
		const drugs = finalList.filter(d => d.drugID === drugID);
		return drugs.length > 0 ? drugs[0].shortName : ''
	}
	static getPackSize(drugID: number) {
		const drugs = finalList.filter(d => d.drugID === drugID);
		return drugs.length > 0 ? drugs[0].packSizes[0] : 30
	}
	static getPaedeatricDrugs() {
		console.log(finalList.filter(d => d.categories?.includes('p')))
		return finalList.filter(d => d.categories?.includes('p'));
	}
	static getAdultDrugs() {
		return finalList.filter(d => d.categories?.includes('a'));
	}
	static getPackSizes (drugId: number) {
		return finalList.find(drug => drug.drugID === drugId)?.packSizes || []
	}
}