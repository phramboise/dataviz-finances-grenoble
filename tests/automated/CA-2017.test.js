import {Set as ImmutableSet} from 'immutable'

import {readFileSync} from 'fs'
import {join} from 'path'

import * as matchers from 'jest-immutable-matchers';

import { DocumentBudgetaire, LigneBudgetRecord } from 'document-budgetaire/Records.js';
import hierarchicalByFunction from '../../src/shared/js/finance/hierarchicalByFunction';

import { EXPENDITURES, REVENUE, DF, RF, RI, DI } from '../../src/shared/js/finance/constants';

jest.addMatchers(matchers);

const docBudgs = require('../../build/finances/finance-data.json').documentBudgetaires.map(db => {
    db.rows = new ImmutableSet( db.rows.map(LigneBudgetRecord) )
    return DocumentBudgetaire(db)
});
const docBudg = docBudgs.find(db => db['Exer'] === 2017);

const MILLION = 1000000;

/**
 * RDFI
 */

test(`Pour le CA 2017, DF devrait représenter ~192,3 millions d'euros`, () => {
    const total = hierarchicalByFunction(docBudg, DF).total;

    expect(total).toBeCloseTo(192300929.59, 1);
});

test(`Pour le CA 2017, DI devrait représenter ~46,2 millions d'euros`, () => {
    const total = hierarchicalByFunction(docBudg, DI).total;

    expect(total).toBeCloseTo(46204100.86, 1);
});

test(`Pour le CA 2017, RF devrait représenter ~212,15 millions d'euros`, () => {
    const total = hierarchicalByFunction(docBudg, RF).total;

    expect(total).toBeCloseTo(212154779.95, 1);
});

test(`Pour le CA 2017, RI devrait représenter ~34,03 millions d'euros`, () => {
    const total = hierarchicalByFunction(docBudg, RI).total;

    expect(total).toBeCloseTo(34037415.36, 1);
});
