/**
 * Получение симплекс-таблицы.
 *
 * @param{Array.<number>} objFunc - Коэффициенты линейной целевой функции
 * @param{Array.<Array.<number>>} constraints - Матрица ограничений неравенства.
 * @param{Array.<number>} upperBounds - Вектор ограничения неравенства. Элементы это верхние границы соответствующего значения A
 */
function getTableau(objFunc, constraints, upperBounds) {
    const slackForm = getSlackForm(constraints);

    const tableau = Array(slackForm.length + 1).fill(null).map(() =>
        Array(slackForm[0].length + 2).fill(0)
    );

    for (let i = 0; i < slackForm.length; i++) {
        for (let j = 0; j < slackForm[i].length; j++) {
            tableau[i][j + 1] = slackForm[i][j];
        }
    }

    for (let i = 0; i < upperBounds.length; i++) {
        tableau[i][0] = upperBounds[i];
    }

    for (let i = 0; i < objFunc.length; i++) {
        tableau[tableau.length - 1][i + 1] = objFunc[i];
    }

    for (let i = 0; i < upperBounds.length; i++) {
        tableau[i][tableau[i].length - 1] = Math.min();
    }

    return tableau;
}

function getSlackForm(constraints) {
    const slackForm = JSON.parse(JSON.stringify(constraints));

    const res = Array(constraints.length).fill(null).map(() => Array(constraints.length).fill(0));

    for (let i = 0; i < slackForm.length; i++) {
        res[i][i] = 1;
        for (let j = 0; j < res.length; j++) {
            slackForm[i].push(res[i][j]);
        }
    }

    return slackForm;
}

function getVariables(constraints) {
    const basicVariables = [];
    const nonBasicVariables = [];

    for (let i = 0; i < constraints[0].length + constraints.length; i++) {
        if (i >= constraints[0].length) {
            basicVariables.push(i + 1);
            continue;
        }
        nonBasicVariables.push(i + 1)
    }

    return [basicVariables, nonBasicVariables];
}


export default getTableau;
export {getVariables};