import { Map as ImmutableMap, List, Set as ImmutableSet } from 'immutable';

import React from 'react';
import { connect } from 'react-redux';

import page from 'page';

import { max } from 'd3-array';

import {makeLigneBudgetId}  from 'document-budgetaire/Records.js';
import {m52ToAggregated, hierarchicalAggregated, hierarchicalByFunction}  from '../../../../shared/js/finance/memoized';
import makeAggregateFunction from "../../../../shared/js/finance/makeAggregateFunction.js"
import {default as visit, flattenTree} from '../../../../shared/js/finance/visitHierarchical.js';
import {aggregatedDocumentBudgetaireNodeTotal, aggregatedDocumentBudgetaireNodeElements} from '../../../../shared/js/finance/AggregationDataStructures.js';


import { DF, DI } from '../../../../shared/js/finance/constants';



import {fonctionLabels, natureLabels} from '../../../../../build/finances/finance-strings.json';

import StackChart from '../../../../shared/js/components/StackChart';
import {makeAmountString, default as MoneyAmount} from '../../../../shared/js/components/MoneyAmount';

import PageTitle from '../../../../shared/js/components/gironde.fr/PageTitle';
import SecundaryTitle from '../../../../shared/js/components/gironde.fr/SecundaryTitle';
import DownloadSection from '../../../../shared/js/components/gironde.fr/DownloadSection';

import {CHANGE_EXPLORATION_YEAR} from '../../constants/actions';

import colorClassById from '../../colorClassById';

import FinanceElementContext from '../FinanceElementContext';
import RollingNumber from '../RollingNumber';

/*
    In this component, there are several usages of dangerouslySetInnerHTML.

    In the context of the public dataviz project, the strings being used are HTML generated by
    a markdown parser+renderer. This part is considered trusted enough.

    The content being passed to the markdown parser is created and reviewed by the project team and likely
    by the communication team at the Département de la Gironde. So this content is very very unlikely to ever
    contain anything that could cause any harm.

    For these reasons, the usages of dangerouslySetInnerHTML are fine.
*/



/*

interface FinanceElementProps{
    contentId: string,
    amount, // amount of this element
    aboveTotal, // amount of the element in the above category
    topTotal // amount of total expenditures or revenue
    texts: FinanceElementTextsRecord,

    // the partition will be displayed in the order it's passed. Sort beforehand if necessary
    partition: Array<{
        contentId: string,
        partAmount: number,
        texts: FinanceElementTextsRecord,
        url: stringMarkdown
    }>
}

*/


export function FinanceElement({contentId, element, year, resources}) {
    /*const label = texts && texts.label || '';
    const atemporalText = texts && texts.atemporal;
    const temporalText = texts && texts.temporal;

    const amount = amountByYear.get(year);

    const years = partitionByYear.keySeq().toJS();

    // sort all partitions part according to the order of the last year partition
    let lastYearPartition = partitionByYear.get(max(years))
    lastYearPartition = lastYearPartition && lastYearPartition.sort((p1, p2) => p2.partAmount - p1.partAmount);
    const partitionIdsInOrder = lastYearPartition && lastYearPartition.map(p => p.contentId) || [];

    // reorder all partitions so they adhere to partitionIdsInOrder
    partitionByYear = partitionByYear.map(partition => {
        // indexOf inside a .map leads to O(n^2), but lists are 10 elements long max, so it's ok
        return partition && partition.sort((p1, p2) => partitionIdsInOrder.indexOf(p1.contentId) - partitionIdsInOrder.indexOf(p2.contentId))
    })

    let thisYearPartition = partitionByYear.get(year);

    let barchartPartitionByYear = partitionByYear;
    if(contentId === 'DF'){
        // For DF, for the split thing at the end, the whole partition is needed.
        // However, DF-1 === DF-2, so for the barchart, we only want one of them with the label "solidarité"
        barchartPartitionByYear = barchartPartitionByYear.map(partition => {
            partition = partition.remove(partition.findIndex(p => p.contentId === 'DF-1'))

            const df2 = partition.find(p => p.contentId === 'DF-2');

            return partition.set(partition.findIndex(p => p.contentId === 'DF-2'), {
                contentId: df2.contentId,
                partAmount: df2.partAmount,
                texts: df2.texts && df2.texts.set('label', [
                    'Actions sociales ',
                    React.createElement('a', {href: '#!/finance-details/DF-1'}, '(par prestation)'),
                    ' - ',
                    React.createElement('a', {href: '#!/finance-details/DF-2'}, '(par public)')
                ]),
                url: undefined
            });
        })

        // temporarily don't display DF-1
        thisYearPartition = thisYearPartition && thisYearPartition.remove(
            thisYearPartition.findIndex(p => p.contentId === 'DF-1')
        )
    }

    const legendItemIds = barchartPartitionByYear
        .map(partition => partition.map(part => part.contentId).toSet())
        .toSet().flatten().toArray()
        .sort( (lid1, lid2) => {
            return partitionIdsInOrder.indexOf(lid1) - partitionIdsInOrder.indexOf(lid2)
        } );

    const legendItems = legendItemIds.map(id => {
        let found;

        barchartPartitionByYear.find(partition => {
            found = partition.find(p => p.contentId === id )
            return found;
        })

        return {
            id: found.contentId,
            className: found.contentId,
            url: found.url,
            text: found.texts && found.texts.label,
            colorClassName: colorClassById.get(found.contentId)
        }
    });



    const RDFIText = RDFI === DF ?
        'Dépense de fonctionnement' :
        RDFI === DI ?
            `Dépense d'investissement`:
            '';

    const isLeaf = !(thisYearPartition && thisYearPartition.size >= 2);*/

    console.log('element', element)
    const total = element && aggregatedDocumentBudgetaireNodeTotal(element)
    const lignesBudget = element && aggregatedDocumentBudgetaireNodeElements(element)

    return React.createElement('article', {className: 'finance-element'},
        React.createElement('header', {},
            element ? React.createElement('h1', {}, `${element.label} : ${total}€`) : undefined,
            React.createElement('h2', {}, year)
        ),

        /*React.createElement('section', {},
            React.createElement('div', {className: 'top-infos'},
                contextElements ? React.createElement(FinanceElementContext, { contextElements }) : undefined,
                React.createElement('div', {},
                    React.createElement('h2', {}, React.createElement(RollingNumber, {amount})),
                    atemporalText ? React.createElement('div', {className: 'atemporal', dangerouslySetInnerHTML: {__html: atemporalText}}) : undefined
                )
            )
        ),

        React.createElement('section', {},
            React.createElement(SecundaryTitle, {text: 'Évolution sur ces dernières années'}),
            React.createElement('div', {className: 'temporal', dangerouslySetInnerHTML: {__html: temporalText}}),
            React.createElement(StackChart, {
                WIDTH: screenWidth >= 800 + 80 ?
                    800 :
                    (screenWidth - 85 >= 600 ? screenWidth - 85 : (
                        screenWidth <= 600 ? screenWidth - 10 : 600
                    )),
                portrait: screenWidth <= 600,
                xs: years,
                ysByX: barchartPartitionByYear.map(partition => partition.map(part => part.partAmount)),
                selectedX: year,
                onSelectedXAxisItem: changeExplorationYear,
                onBrickClicked: !isLeaf ? (year, id) => {
                    const url = barchartPartitionByYear.get(year).find(e => e.contentId === id).url;
                    page(url);
                } : undefined,
                legendItems: !isLeaf ? legendItems : undefined,
                uniqueColorClass: isLeaf ? colorClassById.get(contentId) : undefined,
                yValueDisplay: makeAmountString,
                contentId,
            })
        ),*/

        lignesBudget ? React.createElement('section', { className: 'raw-data'},
            React.createElement(SecundaryTitle, {text: `Consultez ces données en détail à la norme comptable M14 pour l'année ${year}`}),
            React.createElement('table', {},
                React.createElement('thead', {},
                    React.createElement('tr', {},
                        React.createElement('th', {}, 'Fonction'),
                        React.createElement('th', {}, 'Nature'),
                        React.createElement('th', {}, 'Montant')
                    )
                ),
                React.createElement('tbody', {},
                    lignesBudget
                        .sort((r1, r2) => r2['MtReal'] - r1['MtReal'])
                        .map(ligne => {
                            return React.createElement('tr', {title: makeLigneBudgetId(ligne)},
                                React.createElement('td', {}, fonctionLabels[ligne['Fonction']]),
                                React.createElement('td', {}, natureLabels[ligne['Nature']]),
                                React.createElement('td', {},
                                    React.createElement(MoneyAmount, {amount: ligne['MtReal']})
                                )
                            )
                        })
                )
            )
        ) : undefined,

        React.createElement(DownloadSection, resources)
    );
}



export function makePartition(element, totalById, textsById, possibleChildrenIds){
    if(!element){
        return new List();
    }

    let children = element.children;
    children = children && typeof children.toList === 'function' ? children.toList() : children;

    if(!possibleChildrenIds){
        possibleChildrenIds = children.map(c => c.id);
    }

    return children && children.size >= 1 ?
        possibleChildrenIds.map(id => {
            // .find over all possibleChildrenIds is O(n²), but n is small (<= 10)
            const child = children.find(c => c.id === id);

            return {
                contentId: id,
                partAmount: child ? totalById.get(child.id) : 0,
                texts: textsById.get(id),
                url: `#!/finance-details/${id}`
            };
        }) :
        List().push({
            contentId: element.id,
            partAmount: totalById.get(element.id),
            texts: textsById.get(element.id),
            url: `#!/finance-details/${element.id}`
        });
}



const getElementById = (tree, id) => flattenTree(tree).find(node => node.id === id)

/**
 *
 * @param  {hierarchicalByFunction} tree [description]
 * @param  {WeakMap}         wm  Remonte le child au parent
 * @return {[type]}      [description]
 */
const makeChildToParent = tree => {
    const wm = new WeakMap()
    visit(tree, e => {
        if(e.children){
            e.children.forEach(c => {
                wm.set(c, e);
            })
        }
    });
    return wm
}

function makeContextList(element, childToParent){
    let contextList = [];
    let next = element;

    while(next){
        contextList.push(next);
        next = childToParent.get(next);
    }

    contextList = contextList
    // furtherest context first
        .reverse()
    // remove TOTAL
        .slice(1);

    if(contextList.length > 4){
        const [c1, c2, c3] = contextList;
        const [last] = contextList.slice(-1);

        contextList = [c1, c2, c3, last];
    }

    return contextList;
}


export default connect(
    state => {
        const {
            docBudgByYear,
            aggregationDescription,
            explorationYear,
            financeDetailId: displayedContentId,
            resources,
        } = state;

        const documentBudgetaire = docBudgByYear.get(explorationYear);
        const aggregate = aggregationDescription && makeAggregateFunction(aggregationDescription)

        const aggregationTree = documentBudgetaire && aggregate && aggregate(documentBudgetaire);

        const element = aggregationTree && getElementById(aggregationTree, displayedContentId);

        //const childToParent = aggregationTree && makeChildToParent(aggregationTree)

        // c'est la hiérarchie qui permet de créer le breadcrumb
        // si hierM52 est descendant, la contextList est ascendante
        //const contextList = makeContextList(element, childToParent);

        /*const elementByIdByYear = docBudgByYear.map(m52i => {
            return makeElementById(
                hierarchicalAggregated(m52ToAggregated(m52i, corrections)),
                RDFI ? hierarchicalByFunction(m52i, RDFI): undefined
            );
        });

        const displayedElementByYear = elementByIdByYear.map(elementById => {
            return elementById.get(displayedContentId);
        })

        // Depending on the year, all elements may not have the same children ids.
        // This is the set of all possible ids for the given years
        const displayedElementPossibleChildrenIds = displayedElementByYear.map(element => {
            if(!element)
                return new ImmutableSet();

            let children = element.children;
            children = children && typeof children.toList === 'function' ? children.toList() : children;

            if(!children)
                return new ImmutableSet();

            return new ImmutableSet(children).map(child => child.id);
        }).toSet().flatten().toList();

        const partitionByYear = elementByIdByYear.map((elementById) => {
            const yearElement = elementById.get(displayedContentId);

            return makePartition(yearElement, elementById.map(e => e.total), textsById, displayedElementPossibleChildrenIds)
        });

        const amountByYear = elementByIdByYear.map((elementById) => {
            const yearElement = elementById.get(displayedContentId);

            return yearElement && yearElement.total;
        });
        const m52Rows = element && (element.children || element.children.size !== 0) ?
            (isM52Element ?
                element.elements :
                element.elements.first()['M52Rows']
            ) :
            undefined;

        const texts = textsById.get(displayedContentId);

        */
        return {
            contentId: displayedContentId,
            element,
            year: explorationYear,
            resources,
            /*RDFI,
            amountByYear,
            contextElements: contextList.map((c, i) => ({
                id: c.id,
                url : c.id !== displayedContentId ? '#!/finance-details/'+c.id : undefined,
                proportion : c.total/contextList[0].total,
                colorClass : colorClassById.get(c.id),
                label: textsById.get(c.id).label +
                    (contextList.length >= 2 && i === contextList.length -1 ?
                        ` (${(c.total*100/contextList[0].total).toFixed(1)}%)` :
                        '')
            })),
            texts,
            partitionByYear,
            m52Rows,
            screenWidth*/
        }

    },
    dispatch => ({
        changeExplorationYear(year){
            dispatch({
                type: CHANGE_EXPLORATION_YEAR,
                year
            })
        }
    })
)(FinanceElement);
