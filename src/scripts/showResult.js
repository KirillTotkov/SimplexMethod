import {SignsRestriction, TypeTask} from "./simplex/canonicalForm.js";
import {ResultTypes} from "./simplex/simplexSolve.js";

let numIterations = 0;

/**
 * Ввывод подробного решения задачи
 * @param simplexChanges
 * @param resultType
 */
function showDetails(simplexChanges, resultType) {
    const detailsSolveElem = document.querySelector('.solve-details');
    detailsSolveElem.innerHTML = '<h3>Решение</h3>';
    detailsSolveElem.append(getInitialForm(simplexChanges.simplex));
    detailsSolveElem.append(getCanonicalForm(
        simplexChanges.simplex, simplexChanges.canonical.indexesGreater,
        simplexChanges.canonical.indexesEquals,
        simplexChanges.canonical.indexesLess,
        simplexChanges.canonical.canonicalForm
    ));
    detailsSolveElem.innerHTML += '<b>2. Составляем симплекс-таблицу:</b>';
    numIterations = 0;
    detailsSolveElem.append(getSimplexTable(simplexChanges.tableau, simplexChanges.nonBasicVariables, simplexChanges.basicVariables, true));
    detailsSolveElem.append(getValidSolution(simplexChanges.iterationsValid, resultType) ?? '');
    if (resultType === ResultTypes.NotExist) {
        return;
    }
    detailsSolveElem.append(getOptimalSolution(simplexChanges.iterationsOptimal, resultType) ?? '');
    if (resultType === ResultTypes.Unbounded) {
        return;
    }
    detailsSolveElem.append(getResult(simplexChanges.result) ?? '');
}

function getResult(result) {
    if (result === undefined) {
        return null;
    }
    const resultElem = document.createElement('div');
    resultElem.className = 'result';
    resultElem.innerHTML += `<p>Задача решена. Все коэффициенты при целевой функции неотрицательны.</p>`;
    resultElem.append(getSimplexTable(result.tableau, result.nonBasicVariables, result.basicVariables, true));
    resultElem.innerHTML += `<p>Значения переменных: </p>`;
    for (let i = 0; i < result.resultVars.length; i++) {
        resultElem.innerHTML += `<p><b>x<sub>${i + 1}</sub> = ${Math.round(result.resultVars[i] * 100) / 100}</b></p>`;
    }
    if (result.taskType === TypeTask.Maximize) {
        resultElem.innerHTML += `<p>Значение целевой функции: </p>`;
    } else {
        resultElem.innerHTML +=
            `<p>Так как исходной задачей был поиск минимума, оптимальное решение есть свободный 
                член строки F, взятый с противоположным знаком: </p>`;
    }
    resultElem.innerHTML += `<p><b>F = ${Math.round(result.resultFunc * 100) / 100}</b></p>`;

    return resultElem;
}


/**
 *
 * @param{Array.<{resolvingColumn: number, resolvingRow: number, tableau: Array.<Array.<number>>, basicVariables: Array.<number>, nonBasicVariables: Array.<number>}>} iterationsOptimal
 * @param resultType
 */
function getOptimalSolution(iterationsOptimal, resultType) {
    if (iterationsOptimal.length === 0) {
        return null;
    }

    const optimalSolution = document.createElement('div');
    optimalSolution.className = 'optimal-solution';

    for (let i = 0; i < iterationsOptimal.length - 1; i++) {
        const iterationBefore = iterationsOptimal[i];
        const iteration = iterationsOptimal[i + 1];

        const iterationElem = document.createElement('div');
        iterationElem.className = 'iteration';
        iterationElem.innerHTML +=
            '<p>Среди коэффициентов целевой функции выбираем максимальный по модулю отрицательный элемент. ' +
            'Он будет задавать разрешающий столбец.</p>' +
            '<p>Разрешающая строка берется, такая что отношение свободного члена к элементу находящемуся на ' +
            'пересечении разрешающего столбца, и выбранной строки было минимальным и не отрицательным</p>';

        iterationElem.innerHTML += `<p>Разрешающий столбец: <b>x<sub>${iterationBefore.resolvingColumn}</sub></b></p>
                                     <p>Разрешающая строка: <b>x<sub>${iterationBefore.basicVariables[iterationBefore.resolvingRow]}</sub></b></p>`;

        const iterationTableBefore = getSimplexTable(iterationBefore.tableau,
            iterationBefore.nonBasicVariables, iterationBefore.basicVariables, false,
            iterationBefore.resolvingColumn, iterationBefore.resolvingRow);
        iterationElem.append(iterationTableBefore);

        iterationElem.innerHTML += `<p>Пересчитываем таблицу <b>(Итерация ${++numIterations})</b></p>`

        const iterationTable = document.createElement('div');
        iterationTable.className = 'iteration-table';
        iterationTable.append(getSimplexTable(iteration.tableau,
            iteration.nonBasicVariables,
            iteration.basicVariables, false));

        iterationElem.append(iterationTable);
        optimalSolution.append(iterationElem);
    }

    if (resultType === ResultTypes.Unbounded) {
        optimalSolution.innerHTML += '<p>Так как существует столбец, в котором нет положительных элементов:</p>';
        const iteration = iterationsOptimal.at(-1);
        optimalSolution.append(getSimplexTable(iteration.tableau, iteration.nonBasicVariables, iteration.basicVariables,
            true, iteration.resolvingColumn, null));
        optimalSolution.innerHTML += '<p>То данная задача не ограничена и оптимального решения не существует.</p>';
    }

    return optimalSolution;

}

//  переходы к допустимому решению
function getValidSolution(iterationsValid, resultType) {
    if (iterationsValid.length === 0) {
        return null;
    }

    const validSolution = document.createElement('div');
    validSolution.className = 'valid-solution';

    for (let i = 0; i < iterationsValid.length - 1; i++) {
        const iterationBefore = iterationsValid[i];
        const iteration = iterationsValid[i + 1];

        const iterationElem = document.createElement('div');
        iterationElem.className = 'iteration';
        iterationElem.innerHTML +=
            '<p>Т.к. среди свободных членов есть отрицательные значения, то решение недопустимое, и сначала нужно перейти ' +
            'к допустимому решению. Для этого находим среди свободных членов максимальное отрицательное число по модулю. ' +
            'Это число будет задавать разрешающую (ведущую) строку.</p>';

        iterationElem.innerHTML +=
            '<p>В этой строке так же находим максимальный по модулю отрицательный элемент, ' +
            'который будет разрешающим (ведущим) столбцом.</p>';

        iterationElem.innerHTML +=
            `<p>Разрешающий столбец: <b>x<sub>${iterationBefore.maxNegColumn}</sub></b></p>
             <p>Разрешающая строка: <b>x<sub>${iterationBefore.basicVariables[iterationBefore.maxNegRow]}</sub></b></p>`;

        const iterationTableBefore = getSimplexTable(iterationBefore.tableau,
            iterationBefore.nonBasicVariables, iterationBefore.basicVariables, true,
            iterationBefore.maxNegColumn, iterationBefore.maxNegRow);
        iterationElem.append(iterationTableBefore);

        iterationElem.innerHTML += `<p>Пересчитываем таблицу <b>(Итерация ${++numIterations})</b></p>`

        const iterationTable = document.createElement('div');
        iterationTable.className = 'iteration-table';
        iterationTable.append(getSimplexTable(iteration.tableau,
            iteration.nonBasicVariables,
            iteration.basicVariables, true));

        iterationElem.append(iterationTable);
        validSolution.append(iterationElem);

    }

    if (resultType === ResultTypes.NotExist) {
        validSolution.innerHTML += '<p>Так как в строке с отрицательным свободным членом нет отрицательных элементов:</p>'
        const iteration = iterationsValid.at(-1);
        validSolution.append(getSimplexTable(iteration.tableau, iteration.nonBasicVariables, iteration.basicVariables,
            true, null, iteration.maxNegRow));
        validSolution.innerHTML += '<p>То система ограничений не совместна, и задача не имеет решения.</p>';
    }


    return validSolution;
}


/**
 * Возвращает HTML элемент содержащий симплекс-таблицу
 * @param tableau
 * @param nonBasicVariables
 * @param basicVariables
 * @param isInitial
 * @param resolvingColumn
 * @param resolvingRow
 * @return {HTMLDivElement}
 */
function getSimplexTable(tableau, nonBasicVariables, basicVariables, isInitial = false, resolvingColumn = null, resolvingRow = null) {
    const simplexTable = document.createElement('div');
    simplexTable.className = 'simplex-table';

    const table = document.createElement('table');
    table.className = 'simplex-table-table';
    const tableHead = document.createElement('thead');
    const tableHeadRow = document.createElement('tr');
    const tableBody = document.createElement('tbody');

    const tableHeadCell = document.createElement('th');
    tableHeadRow.append(tableHeadCell);

    const tableHeadCellB = document.createElement('th');
    tableHeadCellB.innerHTML = 'b';
    tableHeadRow.append(tableHeadCellB);

    for (let i = 2; i < tableau[0].length; i++) {
        const tableHeadCell = document.createElement('th');
        tableHeadCell.innerHTML = `x<sub>${i - 1}</sub>`;
        if (i - 1 === resolvingColumn) {
            tableHeadCell.className = 'table-elem-resolving';
        }
        tableHeadRow.append(tableHeadCell);
    }
    const tableHeadCellEmpty = document.createElement('th');
    tableHeadRow.append(tableHeadCellEmpty);

    tableHead.append(tableHeadRow);
    table.append(tableHead);

    for (let i = 0; i < tableau.length - 1; i++) {
        const tableBodyRow = document.createElement('tr');
        const tableBodyCell = document.createElement('th');
        tableBodyCell.innerHTML = `x<sub>${basicVariables[i]}</sub>`;
        if (i === resolvingRow) {
            tableBodyCell.className = 'table-elem-resolving';
        }
        tableBodyRow.append(tableBodyCell);
        for (let j = 0; j < tableau[i].length; j++) {
            const tableBodyCell = document.createElement('td');
            if (isNaN(tableau[i][j]) || tableau[i][j] === Infinity || tableau[i][j] === -Infinity || (isInitial && j === tableau[i].length - 1)) {
                tableBodyCell.innerHTML = ' ';
            } else {
                tableBodyCell.innerHTML = Math.round(tableau[i][j] * 100) / 100;
            }
            if (i === resolvingRow || j === resolvingColumn) {
                tableBodyCell.className = 'table-elem-resolving';
            }
            if (i === resolvingRow && j === resolvingColumn) {
                tableBodyCell.className = 'table-elem-resolving-number';
            }
            tableBodyRow.append(tableBodyCell);
        }
        tableBody.append(tableBodyRow);
    }

    const tableBodyRow = document.createElement('tr');
    const tableBodyCell = document.createElement('th');
    tableBodyCell.innerHTML = 'F';
    tableBodyRow.append(tableBodyCell);
    for (let i = 0; i < tableau[tableau.length - 1].length - 1; i++) {
        const tableBodyCell = document.createElement('td');
        tableBodyCell.innerHTML = Math.round(tableau[tableau.length - 1][i] * 100) / 100;
        if (i === resolvingColumn) {
            tableBodyCell.className = 'table-elem-resolving';
        }
        tableBodyRow.append(tableBodyCell);
    }
    const tableBodyCellEmpty = document.createElement('td');
    tableBodyRow.append(tableBodyCellEmpty);

    tableBody.append(tableBodyRow);
    table.append(tableBody);

    simplexTable.append(table);
    return simplexTable;
}


/**
 * Возвращает HTML элемент описывающий приведение к канонической форме
 *
 * @param{Simplex} simplex - исходная задача
 * @param indexesGreater - индексы неравенств типа >=
 * @param indexesEquals - индексы неравенств типа =
 * @param indexesLess - индексы неравенств типа <=
 * @param canonicalSimplex - каноническая форма
 * @return {HTMLDivElement}
 */
function getCanonicalForm(simplex, indexesGreater, indexesEquals, indexesLess, canonicalSimplex) {
    const canonicalForm = document.createElement('div');
    canonicalForm.className = 'canonical-form';
    canonicalForm.innerHTML = '<b>Приведение к канонической форме:</b>';

    const CanonicalStageType = {
        greaterToLess: 'greaterToLess',
        equalToLess: 'equalToLess',
        lessToGreater: 'lessToGreater'
    }

    let useBasicsVars = 0
    // этапы приведения к канонической форме
    for (let i = 0; i < simplex.constraints.length; i++) {
        const stage = document.createElement('div');
        stage.className = 'stage';
        const stageType = () => {
            if (indexesGreater.includes(i)) {
                useBasicsVars++;
                return CanonicalStageType.greaterToLess;
            } else if (indexesEquals.includes(i)) {
                useBasicsVars += 2
                return CanonicalStageType.equalToLess;
            } else if (indexesLess.includes(i)) {
                useBasicsVars++;
                return CanonicalStageType.lessToGreater;
            }
        }
        switch (stageType()) {
            case CanonicalStageType.lessToGreater:
                stage.innerHTML =
                    `${i + 1}) Преобразуем ${i + 1}-ое неравенство ${SignsRestriction.LessOrEqual} 
                               в равенство, введением дополнительной переменной x<sub>${simplex.constraints[i].length + useBasicsVars}</sub>`;
                break;
            case CanonicalStageType.greaterToLess:
                stage.innerHTML =
                    `${i + 1}) Преобразуем ${i + 1}-ое неравенство ${SignsRestriction.GreaterOrEqual} в в равенство,
                          введением дополнительной переменной -x<sub>${simplex.constraints[i].length + useBasicsVars}</sub>, 
                          и чтобы избавиться от отрицательного значения в базисной переменной, домножаем это неравенство на -1`;
                break;
            case CanonicalStageType.equalToLess:
                stage.innerHTML =
                    `${i + 1}) В ${i + 1} - ом ограничении базисная переменная не найдена. 
                            Поэтому вводим в систему еще одно такое же ограничение, но с противоположенными знаками. 
                            После этого, в текущее и в новое ограничение вводим базисные переменные 
                            x<sub>${simplex.constraints[i].length + useBasicsVars - 1}</sub> и x<sub>${simplex.constraints[i].length + useBasicsVars}</sub>`;
                break;
        }
        canonicalForm.append(stage);
    }
    if (simplex.type === TypeTask.Maximize) {
        const stage = document.createElement('div');
        stage.className = 'stage';
        stage.innerHTML = `${simplex.constraints.length + 1}) Т.к. в исходной задаче необходимо найти максимум функции - то знаки коэффициентов целевой функции меняем на противоположные`;
        canonicalForm.append(stage);
    }

    const equationsElem = document.createElement('div');
    equationsElem.className = 'canonical-form-equations';

    const objFuncElem = document.createElement('div');
    objFuncElem.className = 'canonical-form-obj_func';
    setObjFuncHtml(canonicalSimplex.objFunc, simplex.type, objFuncElem);

    const constraintsElem = document.createElement('div');
    constraintsElem.className = 'canonical-form-constraints';
    setConstraintsHtml(canonicalSimplex.constraints, canonicalSimplex.upperBounds, canonicalSimplex.signs, constraintsElem, true);
    equationsElem.append(objFuncElem);
    equationsElem.append(constraintsElem);

    canonicalForm.append(equationsElem);

    return canonicalForm;
}

/**
 * Возвращает HTML элемент описывающий исходную задачу
 * @param simplex
 * @return {HTMLDivElement}
 */
function getInitialForm(simplex) {
    const initialForm = document.createElement('div');
    initialForm.className = 'initial-form';
    initialForm.innerHTML = '<b>Исходная задача:</b>';

    const equationsElem = document.createElement('div');
    equationsElem.className = 'initial-form-equations';

    const objFuncElem = document.createElement('div');
    objFuncElem.className = 'initial-form-obj_func';
    setObjFuncHtml(simplex.objFunc, simplex.type, objFuncElem);

    const constraintsElem = document.createElement('div');
    constraintsElem.className = 'initial-form-constraints';
    setConstraintsHtml(simplex.constraints, simplex.upperBounds, simplex.signs, constraintsElem);

    equationsElem.append(objFuncElem);
    equationsElem.append(constraintsElem);

    initialForm.append(equationsElem);

    return initialForm;
}

function setObjFuncHtml(objFunc, type, elem) {
    elem.innerHTML = `F<sub>${type.toLowerCase()}</sub> = `;
    for (let i = 0; i < objFunc.length; i++) {
        if (objFunc[i] >= 0 && i !== 0) {
            elem.innerHTML += ' + ';
        } else if (objFunc[i] < 0) {
            elem.innerHTML += ' - ';
        }
        elem.innerHTML += `${Math.abs(objFunc[i])}x<sub>${i + 1}</sub>`;
    }
}

function setConstraintsHtml(constraints, upperBounds, signs, elem, isCanonicalForm = false) {
    for (let i = 0; i < constraints.length; i++) {
        for (let j = 0; j < constraints[i].length; j++) {
            if (constraints[i][j] >= 0 && j !== 0) {
                elem.innerHTML += ' + ';
            } else if (constraints[i][j] < 0) {
                elem.innerHTML += ' - ';
            }
            elem.innerHTML += `${Math.abs(constraints[i][j])}x<sub>${j + 1}</sub>`;
        }
        if (isCanonicalForm) {
            elem.innerHTML += ` + x<sub>${constraints[0].length + i + 1}</sub>`;
        }
        elem.innerHTML += ` ${isCanonicalForm ? '=' : signs[i]} ${upperBounds[i]}`;
        elem.innerHTML += '<br>';
    }
}

function showBriefly(resultVars, resultFunc, resultType) {
    const briefSolveElem = document.querySelector('.solve-briefly');
    let resultString = '';

    if (resultType === ResultTypes.Unbounded) {
        resultString = 'Функция не ограничена. Оптимальное решение отсутствует.';
        briefSolveElem.innerHTML = resultString;
        return;
    }
    if (resultType === ResultTypes.NotExist) {
        resultString = 'Решение задачи не существует.';
        briefSolveElem.innerHTML = resultString;
        return;
    }

    for (let i = 0; i < resultVars.length; i++) {
        resultString += `x<sub>${i + 1}</sub> = ${Math.round(resultVars[i] * 100) / 100}, `;
    }

    resultString += ` F = ${Math.round(resultFunc * 100) / 100}`

    briefSolveElem.innerHTML = resultString;
}


export {showBriefly, showDetails}