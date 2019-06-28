import { Set as ImmutableSet, Map as ImmutableMap, List } from 'immutable';

import { AggregationLeaf, AggregationDescription } from '../../shared/js/finance/AggregationDataStructures.js'

var fromEntries = require('object.fromentries');

const FORMULA_MAP = {
    'DEPENSE': 'D',
    'RECETTE': 'R',
    'INVESTISSEMENT': 'I',
    'FONCTIONNEMENT': 'F',
}

function rdfiFromSection (row) {
    const parts = row['Niveau 1 - Section'].trim().split(' ')

    //returns first and last parts of the Section string
    //-> [RD, FI]
    return [ parts[0], parts.pop() ]
}

function fixLabels(row) {
    return fromEntries(
        Object.entries(row).map(([key, value], i, array) => {
            return [ key, value !== '-' ? value : array[i-1][1] ]
        })
    )
}

function makeFormulaFromMontreuilRows(rows){
    const rowsByRDFI = new Map()

    for(const row of rows){
        const RDFI = FORMULA_MAP[row['Sens']] + FORMULA_MAP[row['Section']]

        let rdfiRows = rowsByRDFI.get(RDFI)
        if(!rdfiRows){
            rdfiRows = []
            rowsByRDFI.set(RDFI, rdfiRows)
        }
        rdfiRows.push(row) // mutating array used as map value
    }

    return [...rowsByRDFI.entries()].map(([RDFI, rows]) => {
        const rowsFormula = rows.map(r => {
            // the two following lines seem to have weird characters in the property names
            // I've copied-pasted the values from agregation-Montreuil-v4
            // if only rewriting by hand via easily-accessible keyboard keys, it does not work :-/
            const fonction = r["Fonction - Code"]
            const nature = r['Nature - Code']

            return `F${fonction}*N${nature}`
        })
        .join(' + ')

        return `${RDFI}*(${rowsFormula})`
    }).join(' + ')

}

function makeTagsFromMontreuilRows (rows) {
    let tags = new ImmutableMap();

    rows.forEach(row => {
        const [Politique, SousPolitique] = [row['Niveau a - Politique'], row['Niveau b - Sous Politique']]
        const [Fonction, Nature] = [row["Fonction - Code"], row['Nature - Code']];

        tags = tags.updateIn([Politique, SousPolitique], (val=List()) => val.push(makeFonctionNatureCombo(Fonction, Nature)))
    });

    return tags.toJS();
}

function getMontreuilNomenclatureRowKeys(MontreuilNomenclatureRow){
    return [
        'Sens',
        'Section',
        'Niveau 2 - Catégorie',
        'Niveau 3 - Type'
    ].map(key => MontreuilNomenclatureRow[key])
}

function nomenclatureNodeToAggregationNode(node, label, id){

    if(ImmutableMap.isMap(node)){
        return new AggregationDescription({
            id,
            label,
            children: new ImmutableSet(
                node.entrySeq()
                    .map(([childName, childNode]) => nomenclatureNodeToAggregationNode(childNode, childName, id+' '+childName)))
        })
    }
    else{
        // ImmutableSet.isSet(node) === true
        return new AggregationLeaf({
            id,
            label,
            formula: makeFormulaFromMontreuilRows(node),
            tags: makeTagsFromMontreuilRows(node),
        })
    }
}

function makeFonctionNatureCombo(fonction, nature){
    return fonction + '-' + nature
}

export default function MontreuilNomenclatureToAggregationDescription(montreuilNomenclature, docBudgs){
    let map = new ImmutableMap()

    const docBudgsFonctionNatureCombos = new Set()
    for(const {rows} of docBudgs){
        for(const {Nature, Fonction} of rows){
            docBudgsFonctionNatureCombos.add(makeFonctionNatureCombo(Fonction, Nature))
        }
    }

    montreuilNomenclature = montreuilNomenclature
        .map(row => {
            // we patch the Sens and Section from the Niveau 1 label
            // this is used to override where a content can be located
            // see https://github.com/dtc-innovation/dataviz-finances-montreuil/issues/101
            const [Sens, Section] = rdfiFromSection(row)
            return {...row, Sens, Section}
        })
        .filter(r => r["Nature Mvt"] === "REELLE" &&
            docBudgsFonctionNatureCombos.has(makeFonctionNatureCombo(r["Fonction - Code"], r['Nature - Code']))
        )

    for(const row of montreuilNomenclature){
        const fixedRow = fixLabels(row)
        map = map.updateIn(getMontreuilNomenclatureRowKeys(fixedRow), val => val ? val.add(fixedRow) : new ImmutableSet([fixedRow]))
    }

    return nomenclatureNodeToAggregationNode(map, 'Budget Montreuil', 'Budget Montreuil');
}
