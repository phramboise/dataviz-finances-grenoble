import { Map as ImmutableMap } from 'immutable';
import {flattenTree} from './visitHierarchical.js';

/**
 * Transforms an M52 instruction to its hierarchical form so it can be represented visually with hierarchy
 *
 */
export default function hierarchicalByPolitique (rootNode) {
    const nodes = flattenTree(rootNode)
    const families = new ImmutableMap();

    return families;
}
