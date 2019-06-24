import { Record, Set as ImmutableSet } from 'immutable';

import memoize from 'fast-memoize'

const sumReducer = (total, value) => total + value

/*

interface AggregationDescription extends AggregationNode, Readonly<{
    children: ImmutableSet<AggregationDescription | AggregationLeaf>
}>{}

interface AggregationNode extends Readonly<{
    id: string,
    label: string
}>{}

interface AggregationLeaf extends AggregationNode, Readonly<{
    formula: string
}>{}

interface AggregatedDocumentBudgetaire extends Readonly<{
    id: string,
    label: string,
    // in non-leaf nodes, total and elements are computed fields accumulating the children values
    total: number
    elements: ImmutableSet<LigneBudget>,
    rdfi: string,
    children?: ImmutableSet<AggregatedDocumentBudgetaire>
}>{}

interface AggregateMaker {
    (desc: AggregationDescription):
        (doc: DocumentBudgetaire) => AggregatedDocumentBudgetaire;
}

*/

const AggregationNodeFields = {
    'id': undefined,
    'label': undefined,
}

export const AggregationLeaf = Record(
    Object.assign(
        {formula: undefined, tags: undefined},
        AggregationNodeFields
    )
)

export const AggregationDescription = Record(
    Object.assign(
        {children: undefined, tags: undefined},
        AggregationNodeFields
    )
)

export const AggregatedDocumentBudgetaire = Record({
    id: undefined,
    label: undefined,
    elements: undefined,
    children: undefined,
    tags: undefined
})


function rawAggregatedDocumentBudgetaireNodeElements(node){
    if(!node.children)
        return node.elements
    else{
        return ImmutableSet.union(node.children.map(aggregatedDocumentBudgetaireNodeElements))
    }
}

export const aggregatedDocumentBudgetaireNodeElements = memoize(rawAggregatedDocumentBudgetaireNodeElements)


function rawAggregatedDocumentBudgetaireNodeTotal(node){
    return aggregatedDocumentBudgetaireNodeElements(node)
        .map(row => row['MtReal'])
        .reduce(sumReducer, 0)
}

export const aggregatedDocumentBudgetaireNodeTotal = memoize(rawAggregatedDocumentBudgetaireNodeTotal)
