import nearley from 'nearley';
import memoize from 'fast-memoize'

import grammar from './grammar.js'

function matchesSimple(r, subset) {

    switch (subset) {
        case 'R':
        case 'D':
            return r['CodRD'] === subset;
        case 'F':
        case 'I':
            return r['FI'] === subset;
        case 'RF':
        case 'RI':
        case 'DF':
        case 'DI':
            return r['CodRD'] === subset[0] && r['FI'] === subset[1];
    }

    if (subset.startsWith('N'))
        return subset.slice(1) === r['Nature']
    if (subset.startsWith('F'))
        return r['Fonction'].startsWith(subset.slice(1))
    if (subset.startsWith('C'))
        return subset.slice(1) === r['Chapitre']

    console.warn('matchesSubset - Unhandled case', subset);
}

function matchesComplex(r, combo) {

    if (typeof combo === 'string')
        return matchesSimple(r, combo);
    
    // Array.isArray(combo)
    
    const [left, middle, right] = combo;
    
    if (left === '(' && right === ')')
        return matchesComplex(r, middle)
    else {
        const operator = middle;
    
        switch (operator) {
            case '+':
                return matchesComplex(r, left) || matchesComplex(r, right)
            case '*':
                return matchesComplex(r, left) && matchesComplex(r, right)
            case '-':
                return matchesComplex(r, left) && !matchesComplex(r, right)
            default:
                console.warn('matchesSubset - Unhandled case', operator, combo);
        }
    }
    
    console.warn('matchesSubset - Unhandled case', combo);
}

/*
    returns a function that can be used in the context of a documentBudgetaire.rows.filter()
*/
export default memoize(function makeLigneBudgetFilterFromFormula(formula) {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    parser.feed(formula);

    return memoize(budgetRow => matchesComplex(budgetRow, parser.results[0]))
})
