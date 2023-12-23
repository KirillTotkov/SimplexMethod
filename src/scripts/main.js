import {paintConstraints, paintFunction} from "./showTask.js";
import {addSimplex} from "./history.js";
import renderHistory from './history.js';
import Simplex from "./simplex/Simplex.js";
import {showBriefly, showDetails} from "./showResult.js";

const btnSolve = document.querySelector('.solve');
const form = document.querySelector('form');

btnSolve.addEventListener('click', () => {
    if (!form.checkValidity()) {
        return;
    }
    newTask();
})


function newTask() {
    const objFunc = getObjFuncFromPage();
    const type = document.querySelector('#select-objective').value;
    const [constraints, upperBounds, signs] = getConstraintsFromPage();

    const simplex = new Simplex(objFunc, constraints, upperBounds, signs, type);

    const [resultVars, resultFunc, simplexChanges, resultType] = simplex.solve();

    showBriefly(resultVars, resultFunc, resultType);
    showDetails(simplexChanges, resultType);

    addSimplex(simplex, resultVars, resultFunc, resultType);
    renderHistory();
}

const variables = document.querySelector('#numVariables');
const constraints = document.querySelector('#numConstraints');

variables.addEventListener('change', () => {
    if (!form.reportValidity()) {
        return;
    }

    paintFunction(variables.value, getObjFuncFromPage());
    paintConstraints(variables.value, constraints.value, ...getConstraintsFromPage());
});
paintFunction(variables.value);

constraints.addEventListener('change', () => {
    if (!form.reportValidity()) {
        return;
    }
    paintConstraints(variables.value, constraints.value, ...getConstraintsFromPage());
});
paintConstraints(variables.value, constraints.value);

renderHistory();

// TODO Добавить подтверждение
const resetBtn = document.querySelector('.reset');
resetBtn.addEventListener('click', () => {
    const funcInputs = document.querySelectorAll('.function-equation input');
    for (const funcElement of funcInputs) {
        funcElement.value = 1;
    }
    const allConstraints = document.querySelectorAll('.constraint-block');
    for (const constraintsBlock of allConstraints) {
        const constraintInputs = constraintsBlock.querySelectorAll('input');
        for (const constraintInput of constraintInputs) {
            constraintInput.value = '1';
        }
    }
    const briefSolveElem = document.querySelector('.solve-briefly');
    briefSolveElem.textContent = '';
})

function getObjFuncFromPage() {
    const objFunc = []
    const funcInputs = document.querySelectorAll('.function-equation input');
    for (const funcElement of funcInputs) {
        objFunc.push(Number(funcElement.value));
    }
    return objFunc;
}

function getConstraintsFromPage() {
    const constraints = [];
    const upperBounds = [];
    const signs = [];

    const allConstraints = document.querySelectorAll('.constraint-block');
    for (const constraintsBlock of allConstraints) {
        const constraupperBoudoubndsintInputs = constraintsBlock.querySelectorAll('input');
        const row = []
        for (const constraintInput of constraintInputs) {
            if (constraintInput.id.includes('x')) {
                row.push(Number(constraintInput.value));
            } else {
                upperBounds.push(Number(constraintInput.value));
            }
        }
        constraints.push(row);

        const constraintIndex = [...constraintsBlock.parentNode.children].indexOf(constraintsBlock)
        const selectSignElem = constraintsBlock.querySelector(`#sign${constraintIndex + 1}`)
        signs.push(selectSignElem.value);
    }
    return [constraints, upperBounds, signs];
}