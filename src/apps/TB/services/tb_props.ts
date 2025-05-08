import { GlobalPropertyService } from "@/services/global_property_service";

export enum TB_PREFS {
  SITE_TB_CODE = "tb_site_prefix",
  FACILITY_CATCHMENT_POPULATION = "facility_catchment_population",
  LAB_CONFIGURATION = "test_turnaround",
  FUNCTIONAL_SPUTUM_COLLECTION_POINTS = "functional_sputum_collection_points_in_catchment",
  NEWLY_ESTABLISHED_SPUTUM_COLLECTION_POINTS = "newly_established_sputum_collection_points",
}

const getSiteTbCode = () => {
    return GlobalPropertyService.get(TB_PREFS.SITE_TB_CODE);
}

const getSiteCatchmentPopulation = () => {
    return GlobalPropertyService.get(TB_PREFS.FACILITY_CATCHMENT_POPULATION);
}

const getFunctionalSputumCollectionPoints = () => {
    return GlobalPropertyService.get(TB_PREFS.FUNCTIONAL_SPUTUM_COLLECTION_POINTS);
}

const getNewlyEstablishedSputumCollectionPoints = () => {
    return GlobalPropertyService.get(TB_PREFS.NEWLY_ESTABLISHED_SPUTUM_COLLECTION_POINTS);
}

const setSiteTbCode = (tbCode: string) => {
    return GlobalPropertyService.set(TB_PREFS.SITE_TB_CODE, tbCode);
}

const setSiteCatchmentPopulation = (population: string) => {
    return GlobalPropertyService.set(TB_PREFS.FACILITY_CATCHMENT_POPULATION, population);
}

const setFunctionalSputumCollectionPoints = (points: string) => {
    return GlobalPropertyService.set(TB_PREFS.FUNCTIONAL_SPUTUM_COLLECTION_POINTS, points);
}

const setNewlyEstablishedSputumCollectionPoints = (points: string) => {
    return GlobalPropertyService.set(TB_PREFS.NEWLY_ESTABLISHED_SPUTUM_COLLECTION_POINTS, points);
}

export default {
    getSiteTbCode,
    getSiteCatchmentPopulation,
    getFunctionalSputumCollectionPoints,
    getNewlyEstablishedSputumCollectionPoints,
    setSiteTbCode,
    setSiteCatchmentPopulation,
    setFunctionalSputumCollectionPoints,
    setNewlyEstablishedSputumCollectionPoints
};
