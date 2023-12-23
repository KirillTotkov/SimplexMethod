import {rectangleRule} from "./simplexSolve.js";

function checkValid(tableau) {
    return tableau.map(row => row.at(0)).slice(0, -1).every(x => x >= 0);
}

function toValidSolution(tableau, nonBasicVariables, basicVariables, iterationsValid) {
    while (!checkValid(tableau)) {
        iterationsValid.push({
            basicVariables: [...basicVariables],
            nonBasicVariables: [...nonBasicVariables],
            tableau: JSON.parse(JSON.stringify(tableau)),
            maxNegColumn: null,
            maxNegRow: null,
        });

        // находим среди свободных членов(первый столбец) максимальное отрицательное число по модулю (индекс строки)
        // кроме последней строки, так как она является функцией
        const maxNegRow = tableau.map(row => row.at(0)).slice(0, -1).indexOf(Math.min(...tableau.map(row => row.at(0)).slice(0, -1)));
        iterationsValid[iterationsValid.length - 1].maxNegRow = maxNegRow;

        //  в строке с отрицательным свободным членом нет отрицательных элементов: решений нет
        if (tableau[maxNegRow].slice(1, -1).every(x => x >= 0)) {
            return null;
        }

        // В этой строке так же находим максимальный по модулю отрицательный элемент, который будет разрешающим столбцом
        // кроме последнего столбца
        const maxNegColumn = tableau[maxNegRow].slice(1, -1).indexOf(Math.min(...tableau[maxNegRow].slice(1, -1))) + 1;

        [nonBasicVariables[maxNegColumn - 1], basicVariables[maxNegRow]] =
            [basicVariables[maxNegRow], nonBasicVariables[maxNegColumn - 1]];

        // Пересчитываем таблицу
        tableau = rectangleRule(tableau, maxNegColumn, maxNegRow);

        iterationsValid[iterationsValid.length - 1].maxNegColumn = maxNegColumn;
        iterationsValid[iterationsValid.length - 1].maxNegRow = maxNegRow;
    }
    iterationsValid.push({
        basicVariables: [...basicVariables],
        nonBasicVariables: [...nonBasicVariables],
        tableau: JSON.parse(JSON.stringify(tableau)),
        maxNegColumn: null,
        maxNegRow: null,
    });


    for (let i = 0; i < tableau.length - 1; i++) {
        tableau[i][tableau[i].length - 1] = Math.min();
    }

    return tableau;
}

export default toValidSolution;