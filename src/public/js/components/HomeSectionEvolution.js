import React, {Fragment} from 'react';

export default function EvolutionSection ({children, evolutionRef, currentYearrdfiTree, RDFIcon, onTabClick, onSelect, years, revenueItems, expenditureItems, financeDetailId}) {
    if (!currentYearrdfiTree) {
        return null;
    }

    return (<section ref={evolutionRef} id="evolution">
        <h2>Évolution et répartition du budget<br />de {years[0]} à {years[ years.length - 1]}</h2>

        <p className="h4">Sélectionner la catégorie du budget à afficher :</p>

        <ul className="tabs tabs--rdfi" role="tablist">
            {revenueItems.concat(expenditureItems).map(item => {
                const Icon = RDFIcon(item.id);
                return (<li key={item.id} role="presentation">
                    <a href={`#!/explorer/${item.id}`} aria-selected={financeDetailId.includes(item.id)} className={item.colorClassName} onClick={() => onTabClick(item)} role="tab">
                        <Icon className="icon" aria-hidden={true} />
                        {item.text}
                    </a>
                </li>)
            })}
        </ul>
        <div className="tabpanel" role="tabpanel">
            <p className="h4" aria-hidden={true}>
                <label htmlFor="select-tree-root">Afficher</label>
                <select id="select-tree-root" value={financeDetailId} onChange={onSelect}>
                    {revenueItems.concat(expenditureItems).map(item => {
                        if (currentYearrdfiTree && financeDetailId.includes(item.id)) {
                            return (<Fragment key={item.id}>
                                <option value={item.id} className="selected">{item.text}</option>
                                {currentYearrdfiTree.children.map(node => (
                                    <option key={node.id} value={node.id}>{'\u2003'}{node.label}</option>
                                ))}
                            </Fragment>);
                        }
                        else {
                            return (<option key={item.id} value={item.id}>{item.text}</option>);
                        }
                    })}
                </select>
            </p>

            {{...children}}
        </div>
    </section>);
}
