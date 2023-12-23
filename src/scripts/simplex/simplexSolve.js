import toStandardForm, {TypeTask} from "./canonicalForm.js";
import getTableau, {getVariables} from "./getTableau.js";
import toValidSolution from "./validSolution.js";

/**
 * @param{Simplex} simplex
 */
function simplexSolve(simplex) {
    const simplexChanges = {}
    simplexChanges.simplex = simplex;

    simplexChanges.canonical = {
        indexesGreater: [],
        indexesEquals: [],
        indexesLess: [],
        canonicalForm: {}
    };
    const standardSimplex = toStandardForm(simplex, simplexChanges);

    let tableau = getTableau(standardSimplex.objFunc, standardSimplex.constraints, standardSimplex.upperBounds, standardSimplex.type);
    let [basicVariables, nonBasicVariables] = getVariables(standardSimplex.constraints);

    simplexChanges.tableau = JSON.parse(JSON.stringify(tableau));
    simplexChanges.basicVariables = [...basicVariables];
    simplexChanges.nonBasicVariables = [...nonBasicVariables];

    simplexChanges.iterationsValid = [];
    simplexChanges.iterationsOptimal = [];
    simplexChanges.result = {
        resultType: null,
    };

    tableau = toValidSolution(tableau, nonBasicVariables, basicVariables, simplexChanges.iterationsValid);

    // Решение не существует.
    if (tableau === null) {
        simplexChanges.result.resultType = ResultTypes.NotExist;
        return [undefined, undefined, simplexChanges, ResultTypes.NotExist];
    }

    while (!checkOptimal(tableau, standardSimplex.type)) {
        simplexChanges.iterationsOptimal.push({
            basicVariables: [...basicVariables],
            nonBasicVariables: [...nonBasicVariables],
            tableau: [],
            resolvingColumn: null,
            resolvingRow: null,
        });

        const resolvingColumn = getResolvingColumn(tableau, standardSimplex.type);
        const resolvingRow = getResolvingRow(tableau, resolvingColumn);

        simplexChanges.iterationsOptimal[simplexChanges.iterationsOptimal.length - 1].tableau = JSON.parse(JSON.stringify(tableau));

        // Неограниченность
        if (resolvingRow === -1) {
            simplexChanges.result.resultType = ResultTypes.Unbounded;
            simplexChanges.iterationsOptimal[simplexChanges.iterationsOptimal.length - 1].resolvingColumn = resolvingColumn;
            return [null, null, simplexChanges, ResultTypes.Unbounded];
        }

        const resolvingNumber = tableau[resolvingRow][resolvingColumn];

        [nonBasicVariables[nonBasicVariables.indexOf(resolvingColumn)], basicVariables[resolvingRow]] =
            [basicVariables[resolvingRow], nonBasicVariables[nonBasicVariables.indexOf(resolvingColumn)]];

        tableau = rectangleRule(tableau, resolvingColumn, resolvingRow);

        simplexChanges.iterationsOptimal[simplexChanges.iterationsOptimal.length - 1].resolvingColumn = resolvingColumn;
        simplexChanges.iterationsOptimal[simplexChanges.iterationsOptimal.length - 1].resolvingRow = resolvingRow;
    }

    simplexChanges.iterationsOptimal.push({
        basicVariables: [...basicVariables],
        nonBasicVariables: [...nonBasicVariables],
        tableau: JSON.parse(JSON.stringify(tableau)),
        resolvingColumn: null,
        resolvingRow: null,
    });

    let resultVars = new Array(nonBasicVariables.length + basicVariables.length).fill(0);
    for (let i = 0; i < basicVariables.length; i++) {
        resultVars[basicVariables[i] - 1] = tableau.map(row => row[0])[i];
    }
    resultVars = resultVars.slice(0, simplex.constraints.length);

    let resultFunc = tableau.at(-1)[0];
    if (simplex.type === TypeTask.Minimize) {
        resultFunc *= -1;
    }

    simplexChanges.result = {
        resultVars: resultVars,
        resultFunc: resultFunc,
        basicVariables: basicVariables,
        nonBasicVariables: nonBasicVariables,
        tableau: tableau,
        taskType: simplex.type,
    }

    return [resultVars, resultFunc, simplexChanges, ResultTypes.Optimal]
}

const ResultTypes = Object.freeze({
    Optimal: 0,
    NotExist: 1,
    Unbounded: 2,
});


function checkOptimal(tableau) {
    return tableau.at(-1).slice(1, -1).every(x => x >= 0);
}

function getResolvingColumn(tableau) {
    return tableau.at(-1).slice(1, -1).indexOf(Math.min(...tableau.at(-1).slice(1, -1))) + 1;
}

/**
 *
 * @param{Array.<Array.<number>>} tableau
 * @param{number} resColumnInd
 */
function getResolvingRow(tableau, resColumnInd) {
    for (let i = 0; i < tableau.length - 1; i++) {
        tableau[i][tableau[i].length - 1] = tableau[i][0] / tableau[i][resColumnInd];
    }
    const tmp = tableau.map(x => x.at(-1)).slice(0, -1).filter(x => x >= 0 && !isNaN(x));
    if (tmp.length === 0) {
        return -1;
    }
    return tableau.map(x => x.at(-1)).slice(0, -1).indexOf(Math.min(...tmp));
}

/**
 * Перерасщет коэфициентов.
 *
 * b_i = при i != resRowInd: b_i - (b_resRowInd / a_resRowInd_resColumnInd) * a_i_resColumnInd;
 *       при i == resRowInd: b_resRowInd / a_resRowInd_resColumnInd;
 *
 * a_i_j = при i != resRowInd: a_i_j - (a_resRowInd_j / a_resRowInd_resColumnInd) * a_i_resColumnInd;
 *         при i == resRowInd: a_resRowInd_j / a_resRowInd_resColumnInd;
 *
 * @param{Array.<Array.<number>>} tableau
 * @param{number} resColumnInd
 * @param{number} resRowInd
 */
function rectangleRule(tableau, resColumnInd, resRowInd) {
    let newTableau = JSON.parse(JSON.stringify(tableau));

    for (let i = 0; i < tableau.length; i++) {
        for (let j = 0; j < tableau[i].length - 1; j++) {
            if (j === 0) {
                if (i !== resRowInd) {
                    newTableau[i][j] = tableau[i][j] - (tableau[resRowInd][j] / tableau[resRowInd][resColumnInd]) * tableau[i][resColumnInd];
                } else {
                    newTableau[i][j] = tableau[i][j] / tableau[resRowInd][resColumnInd];
                }
            } else {
                if (i !== resRowInd) {
                    newTableau[i][j] = tableau[i][j] - (tableau[resRowInd][j] / tableau[resRowInd][resColumnInd]) * tableau[i][resColumnInd];
                } else {
                    newTableau[i][j] = tableau[resRowInd][j] / tableau[resRowInd][resColumnInd];
                }
            }
        }
    }

    return newTableau;
}


export default simplexSolve;
export {ResultTypes, rectangleRule};