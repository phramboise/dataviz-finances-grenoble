import { Map as ImmutableMap, List } from "immutable";

import React, {Component} from "react";
import { connect } from "react-redux";

import { sum } from "d3-array";

import {
    RF,
    RI,
    DF,
    DI,
    EXPENDITURES,
    REVENUE
} from "../../../../shared/js/finance/constants";

import {
    hierarchicalByFunction,
    m52ToAggregated,
    hierarchicalAggregated
} from "../../../../shared/js/finance/memoized";
import { flattenTree } from "../../../../shared/js/finance/visitHierarchical.js";
import makeAggregateFunction from "../../../../shared/js/finance/makeAggregateFunction.js"


import PageTitle from "../../../../shared/js/components/gironde.fr/PageTitle";
import DownloadSection from "../../../../shared/js/components/gironde.fr/DownloadSection";
import PrimaryCallToAction from "../../../../shared/js/components/gironde.fr/PrimaryCallToAction";

import Markdown from "../../../../shared/js/components/Markdown";
import MoneyAmount, {SVGMoneyAmount} from "../../../../shared/js/components/MoneyAmount";

import Donut from "../../../../shared/js/components/Donut.js";
import LegendList from "../../../../shared/js/components/LegendList.js";

import { assets } from "../../constants/resources";

import BubbleChartCluster from "../../../../shared/js/components/BubbleChartCluster.js";

const MAX_HEIGHT = 30;



export class ExploreBudget extends Component{

    constructor(props) {
        super(props);
        this.state = {
            RD: 'D',
            FI: 'F'
        };
    }

    render(){
        const { currentYear, totals, recetteTree, dépenseTree } = this.props
        const {RD, FI} = this.state

        const expenditures = totals.get(EXPENDITURES);
        const revenue = totals.get(REVENUE);

        const expenditureItems = new List([
            { id: 'DF', colorClassName:'rdfi-D rdfi-F', text: 'Dépenses de fonctionnement', value: totals.get(DF) },
            { id: 'DI', colorClassName:'rdfi-D rdfi-I', text: 'Dépenses d\'investissement', value: totals.get(DI) },
        ]);

        const revenueItems = new List([
            { id: 'RF', colorClassName:'rdfi-R rdfi-F', text: 'Recettes de fonctionnement', value: totals.get(RF) },
            { id: 'RI', colorClassName:'rdfi-R rdfi-I', text: 'Recettes d\'investissement', value: totals.get(RI) },
        ]);

        // PROBLEM This is super-hardcoded
        const displayedTree = dépenseTree && RD === 'D' && FI === 'F' ? 
            dépenseTree
                .children.find(c => c.id.includes('FONCTIONNEMENT'))
                .children.find(c => c.id.includes('Gestion courante'))
            : undefined;

        console.log('render ExploreBudget', RD, FI, displayedTree)

        return <article className="explore-budget">
            <PageTitle text={`Exploration des comptes ${currentYear}`} />

            <section>
                <Markdown>
    Le contexte financier dans lequel s’est déroulée l’exécution de ce troisième
    budget de la mandature a été marqué par l’accentuation de la contribution des
    collectivités locales à la réduction des déficits publics et par une modification
    des compétences résultant de la mise en œuvre des transferts de compétences avec
    la Région et Bordeaux Métropole issus des lois MAPTAM de 2014 et NOTRe de 2015.

    Dans un contexte national où les contraintes financières se sont durcies, l’année
    2017 confirme le dynamisme des dépenses de solidarité obligatoires et incompressibles et la difficulté d’accentuer encore la maitrise des dépenses de gestion courante.

    Le Département voit également ses recettes de fonctionnement évoluer plus
    favorablement que prévu grâce aux droits de mutation recette conjoncturelle
    mais non pérenne liée au fort dynamisme de l’immobilier et à l’attraction du
    département.

    Ainsi les résultats financiers de la Gironde pour cet exercice se traduisent par :

    -	Une épargne brute qui s’améliore fortement
    -	Une réduction importante du besoin de financement par l’emprunt</Markdown>
            </section>

            <section className="yearly-budget">
                <h2>Le budget {currentYear}</h2>

                <figure className="side-by-side" role="table">
                    <Donut items={revenueItems} padAngle={0.015}>
                        <MoneyAmount amount={revenue} />
                        de recettes
                    </Donut>

                    <Donut items={expenditureItems} padAngle={0.015}>
                        <MoneyAmount amount={expenditures} />
                        de dépenses
                    </Donut>

                    <Markdown className="todo">
                        Les chiffres étant issus du compte administratif, la différence entre
                        le montant des recettes et le montant des dépenses représente l’excédent
                        de l’exercice.
                    </Markdown>

                    <LegendList items={new List([
                        { text: 'Fonctionnement', colorClassName: 'rdfi-F' },
                        { text: 'Investissement', colorClassName: 'rdfi-I' },
                    ])} />
                </figure>
            </section>

            <section>
                <h2>Explorer le budget</h2>
                <nav className="rdfi-choice">
                    <ul>
                        <li>
                            <label>
                                <input type="radio" name="rd" value="R" onClick={() => this.setState({ RD: 'R' })} defaultChecked={RD === 'R'} /> recettes
                            </label>
                        </li>
                        <li>
                            <label>
                                <input type="radio" name="rd" value="D" onClick={() => this.setState({ RD: 'D' })} defaultChecked={RD === 'D'} /> dépenses
                            </label>
                        </li>
                    </ul>

                    <ul>
                        <li>
                            <label>
                                <input type="radio" name="fi" value="F" onClick={() => this.setState({ FI: 'F' })} defaultChecked={FI === 'F'} /> fonctionnement
                            </label>
                        </li>
                        <li>
                            <label>
                                <input type="radio" name="fi" value="I" onClick={() => this.setState({ FI: 'I' })} defaultChecked={FI === 'I'} /> investissement
                            </label>
                        </li>
                    </ul>
                </nav>

                <BubbleChartCluster tree={displayedTree} />
            </section>

            <DownloadSection />
        </article>;
    }
}

export default connect(
    state => {
        const {
            docBudgByYear,
            aggregationDescription,
            currentYear
        } = state;

        const documentBudgetaire = docBudgByYear.get(currentYear);
        const aggregate = aggregationDescription && makeAggregateFunction(aggregationDescription)

        const hierAgg = documentBudgetaire && aggregate && aggregate(documentBudgetaire);

        let totals = new ImmutableMap();
        if (documentBudgetaire) {
            totals = new ImmutableMap({
                [REVENUE]: sum(documentBudgetaire.rows.filter(r => r.CodRD === 'R').map(r => r.MtReal).toArray()),
                [EXPENDITURES]: sum(documentBudgetaire.rows.filter(r => r.CodRD === 'D').map(r => r.MtReal).toArray()),
                [DF]: hierarchicalByFunction(documentBudgetaire, DF).total,
                [DI]: hierarchicalByFunction(documentBudgetaire, DI).total,
                [RF]: hierarchicalByFunction(documentBudgetaire, RF).total,
                [RI]: hierarchicalByFunction(documentBudgetaire, RI).total
            });
        }

        return {
            currentYear,
            totals,
            recetteTree: hierAgg && hierAgg.children.find(c => c.id.includes('RECETTE')),
            dépenseTree: hierAgg && hierAgg.children.find(c => c.id.includes('DEPENSE')),
        };
    },
    () => ({})
)(ExploreBudget);
