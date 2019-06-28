import {fromJS, mergeDeep} from 'immutable';
import {flattenTree} from './visitHierarchical.js';


function findElement(elements, {Nature, Fonction}) {
    return elements
        .find(el => el.Nature === Nature && el.Fonction === Fonction)
}

function hydrateTags (tags, elements) {
    return tags.map(tag => {
        const [Fonction, Nature] = tag.split('-')
        return findElement(elements, {Nature, Fonction})
    }).filter(el => el)
}

function sum (elements, valFn) {
    return elements.reduce((total, el) => total + valFn(el), 0)
}

export default function hierarchicalByPolitique (rootNode) {
    const nodes = flattenTree(rootNode).filter(node => 'elements' in node)
    const allElements = fromJS(nodes).flatMap(node => node.get('elements')).toJS()

    let tree = {}

    nodes.forEach(({tags}) => {
        tree = mergeDeep(tree, tags)
    })

    function buildTree(tree, nodes, rootId) {
        Object.entries(nodes).forEach(([key, value]) => {
            let children = []
            let elements = []
            let total = 0
            const id = `${rootId}.${key}`

            if (Array.isArray(value)) {
                elements = hydrateTags(value, allElements)
                total = sum(elements, c => c['MtReal'])
            }
            else {
                children = buildTree([], value, id)
                total = sum(children, c => c.total)
            }

            tree.push({
                id,
                label: key,
                total,
                children,
                elements,
            })
        })

        return tree
    }


    return buildTree([], tree, rootNode.id)
}
