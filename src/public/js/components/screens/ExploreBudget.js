import { Map as ImmutableMap, List } from "immutable";

import React from "react";
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
import SecundaryTitle from "../../../../shared/js/components/gironde.fr/SecundaryTitle";
import DownloadSection from "../../../../shared/js/components/gironde.fr/DownloadSection";
import PrimaryCallToAction from "../../../../shared/js/components/gironde.fr/PrimaryCallToAction";

import Markdown from "../../../../shared/js/components/Markdown";
import MoneyAmount, {SVGMoneyAmount} from "../../../../shared/js/components/MoneyAmount";

import Donut from "../../../../shared/js/components/Donut.js";
import LegendList from "../../../../shared/js/components/LegendList.js";

import { assets } from "../../constants/resources";

import M52ByFonction from "../M52ByFonction";
import BubbleChartCluster from "../../../../shared/js/components/BubbleChartCluster.js";

const MAX_HEIGHT = 30;

export function TotalBudget({
    currentYear,
    totals,
    m52Instruction,
    recetteTree,
    dépenseTree,
    labelsById,
    assets: {
        expenditures: expURL,
        revenue: revURL,
        rf,
        ri,
        df,
        di,
        byFonction
    },
    screenWidth
}) {
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

            <BubbleChartCluster recetteTree={recetteTree} dépenseTree={dépenseTree} />
        </section>

        <section className="m52">
            <SecundaryTitle text="Les comptes par fonction (norme M14)" />
            <M52ByFonction  m52Instruction={m52Instruction}
                urlByFonction={byFonction}
                labelsById={labelsById}
                screenWidth={screenWidth} />
        </section>

        <DownloadSection />
    </article>;
}

export default connect(
    state => {
        const {
            docBudgByYear,
            aggregationDescription,
            currentYear,
            textsById,
            screenWidth
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
            m52Instruction: documentBudgetaire,
            recetteTree: hierAgg && hierAgg.children.find(c => c.id.includes('RECETTE')),
            dépenseTree: hierAgg && hierAgg.children.find(c => c.id.includes('DEPENSE')),
            labelsById: textsById.map(texts => texts.label),
            assets: {
                expenditures: "#!/finance-details/" + EXPENDITURES,
                revenue: "#!/finance-details/" + REVENUE,
                rf: "#!/finance-details/" + RF,
                ri: "#!/finance-details/" + RI,
                df: "#!/finance-details/" + DF,
                di: "#!/finance-details/" + DI,
                byFonction: {
                    "M52-DF-0": `#!/finance-details/M52-DF-0`,
                    "M52-DF-1": `#!/finance-details/M52-DF-1`,
                    "M52-DF-2": `#!/finance-details/M52-DF-2`,
                    "M52-DF-3": `#!/finance-details/M52-DF-3`,
                    "M52-DF-4": `#!/finance-details/M52-DF-4`,
                    "M52-DF-5": `#!/finance-details/M52-DF-5`,
                    "M52-DF-6": `#!/finance-details/M52-DF-6`,
                    "M52-DF-7": `#!/finance-details/M52-DF-7`,
                    "M52-DF-8": `#!/finance-details/M52-DF-8`,
                    "M52-DF-9": `#!/finance-details/M52-DF-9`,
                    "M52-DI-0": `#!/finance-details/M52-DI-0`,
                    "M52-DI-1": `#!/finance-details/M52-DI-1`,
                    "M52-DI-2": `#!/finance-details/M52-DI-2`,
                    "M52-DI-3": `#!/finance-details/M52-DI-3`,
                    "M52-DI-4": `#!/finance-details/M52-DI-4`,
                    "M52-DI-5": `#!/finance-details/M52-DI-5`,
                    "M52-DI-6": `#!/finance-details/M52-DI-6`,
                    "M52-DI-7": `#!/finance-details/M52-DI-7`,
                    "M52-DI-8": `#!/finance-details/M52-DI-8`,
                    "M52-DI-9": `#!/finance-details/M52-DI-9`
                }
            },
            screenWidth
        };
    },
    () => ({})
)(TotalBudget);
