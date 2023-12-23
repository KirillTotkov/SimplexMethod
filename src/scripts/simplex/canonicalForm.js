/**
 * Преобразование задачи в стандартную форму
 * @param{Simplex} simplex
 * @param simplexChanges
 * @return {Simplex}
 */
function toStandardForm(simplex, simplexChanges) {
    const standardSimplex = JSON.parse(JSON.stringify(simplex))
    simplexChanges.canonical.indexesLess = getAllIndexes(standardSimplex.signs, SignsRestriction.LessOrEqual);

    greaterToLess(standardSimplex.constraints, standardSimplex.upperBounds, standardSimplex.signs, simplexChanges);
    equalToLess(standardSimplex.constraints, standardSimplex.upperBounds, standardSimplex.signs, simplexChanges);
    maximize(standardSimplex.objFunc, standardSimplex.type);

    simplexChanges.canonical.canonicalForm = standardSimplex;

    return standardSimplex;
}

function maximize(objFunc, type) {
    if (type === TypeTask.Maximize) {
        oppositeArray(objFunc);
    }
}

/**
 * Ограничения-равенства преобразуются в ограничения неравенства заменой
 * на 2 неравенства. P.S. Поскольку x = y тогда и только тогда, когда
 * справедливы оба неравенства x <= y и x >= y, можно заменить ограничение-равенство
 * парой ограничений-неравенств.
 *
 * @param constraints
 * @param upperBounds
 * @param signs
 * @param simplexChanges
 */
function equalToLess(constraints, upperBounds, signs, simplexChanges) {
    const indexesEquals = getAllIndexes(signs, SignsRestriction.Equal);
    let numAddedRow = 0;

    indexesEquals.forEach(i => {
        signs[i + numAddedRow] = SignsRestriction.LessOrEqual;
        constraints.splice(i + 1 + numAddedRow, 0, constraints[i + numAddedRow].map(x => x * -1));
        upperBounds.splice(i + 1 + numAddedRow, 0, upperBounds[i + numAddedRow] * -1);
        signs.splice(i + 1 + numAddedRow, 0, SignsRestriction.GreaterOrEqual);
        numAddedRow++;
    });

    simplexChanges.canonical.indexesEquals = indexesEquals;
}


/**
 *  Ограничения вида "больше или равно" преобразуются
 *  в ограничения "меньше или равно" путем умножения
 *  этих ограничений на -1
 */
function greaterToLess(constraints, upperBounds, signs, simplexChanges) {
    const indexesGreater = getAllIndexes(signs, SignsRestriction.GreaterOrEqual);
    indexesGreater.forEach(x => {
        oppositeArray(constraints[x]);
        upperBounds[x] *= -1;
        signs[x] = SignsRestriction.LessOrEqual;
    });

    simplexChanges.canonical.indexesGreater = indexesGreater;
}

const TypeTask = {Minimize: 'Min', Maximize: 'Max'}
const SignsRestriction = {
    LessOrEqual: '≤',
    Equal: '=',
    GreaterOrEqual: '≥',
}

function getAllIndexes(arr, val) {
    let indexes = [];
    for (let i = 0; i < arr.length; i++)
        if (arr[i] === val)
            indexes.push(i);
    return indexes;
}

function oppositeArray(array) {
    for (let i = 0; i < array.length; i++) {
        array[i] *= -1;
    }
}

export default toStandardForm;
export {TypeTask, SignsRestriction}