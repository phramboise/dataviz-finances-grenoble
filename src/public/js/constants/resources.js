export const FINANCE_DATA = 'FINANCE_DATA';

export const AGGREGATED_ATEMPORAL = "AGGREGATED_ATEMPORAL";
export const AGGREGATED_TEMPORAL = "AGGREGATED_TEMPORAL";
export const M52_FONCTION_ATEMPORAL = "M52_FONCTION_ATEMPORAL";
export const M52_FONCTION_TEMPORAL = "M52_FONCTION_TEMPORAL";

export const CORRECTIONS_AGGREGATED = "CORRECTIONS_AGGREGATED";

const {BASE_URL} = process.env;

if (!BASE_URL) {
    throw new TypeError('Please define a BASE_URL env variable. The README will tell you more.');
}

export const assets = {
    // finance data
    [FINANCE_DATA]: `${BASE_URL}/build/finances/finance-data.json`,
    [CORRECTIONS_AGGREGATED]: `${BASE_URL}/data/finances/corrections-agregation.csv`,

    // texts
    [AGGREGATED_ATEMPORAL]: `${BASE_URL}/data/texts/aggregated-atemporal.csv`,
    [AGGREGATED_TEMPORAL]: `${BASE_URL}/data/texts/aggregated-temporal.csv`
}
