import {getItemBlock} from "./showHistory.js";
import {paintConstraints, paintFunction} from "./showTask.js";
import {showBriefly, showDetails} from "./showResult.js";
import simplexSolve from "./simplex/simplexSolve.js";


function addSimplex(simplex, resultVars, resultFunc, resultType) {
    const history = getHistory();
    simplex.resultVars = resultVars;
    simplex.resultFunc = resultFunc;
    simplex.resultType = resultType;
    history.push(simplex);
    window.localStorage.setItem('history', JSON.stringify(history));
}

function getHistory() {
    const history = window.localStorage.getItem('history');
    if (history === null) {
        initHistory();
        return JSON.parse('[]');
    }

    return JSON.parse(history).reverse();
}

function initHistory() {
    window.localStorage.setItem('history', '[]');
}


const drawer = document.querySelector('.drawer-scrolling');
const drawerOpenBtn = document.querySelector('.history')
drawerOpenBtn.addEventListener('click', () => drawer.show());

const removeAllButton = drawer.querySelector('.remove-all')
removeAllButton.addEventListener('click', () => {
    if (getHistory().length > 0) {
        removeAllItems();
    }
});


// TODO Добавить подтверждение
const removeItem = (index) => {
    const history = getHistory();
    history.splice(index, 1)
    window.localStorage.setItem('history', JSON.stringify(history));
    renderHistory();
}

const removeAllItems = () => {
    window.localStorage.setItem('history', '[]');
    renderHistory();
}

const openItem = (ind) => {
    const history = getHistory();
    const simplex = history[ind];

    document.querySelector('#numVariables').value = simplex.objFunc.length;
    document.querySelector('#numConstraints').value = simplex.constraints.length;

    paintFunction(simplex.objFunc.length, simplex.objFunc);
    paintConstraints(simplex.objFunc.length, simplex.constraints.length, simplex.constraints, simplex.upperBounds, simplex.signs);

    document.querySelector('#select-objective').value = simplex.type;

    const [resultVars, resultFunc, simplexChanges, resultType] = simplexSolve(simplex);
    showBriefly(resultVars, resultFunc, resultType);
    showDetails(simplexChanges, resultType);
}

const renderHistory = () => {
    const listItemBlock = document.querySelector('.drawer-list');
    listItemBlock.innerHTML = '';
    try {
        const history = getHistory();
        if (history.length === 0) {
            listItemBlock.textContent = 'Пусто'
            return;
        }

        history.forEach(item => {
            const itemBlock = getItemBlock(item);
            listItemBlock.append(itemBlock)
        });

        const openButtons = document.querySelectorAll('.open_item');
        openButtons.forEach((item, ind) => {
            item.addEventListener('click', () => openItem(ind));
        });

        const removeButtons = document.querySelectorAll('.remove_item');
        removeButtons.forEach((item, ind) => {
            item.addEventListener('click', () => removeItem(ind));
        });

    } catch (err) {
        console.error(err);
    }
}

export default renderHistory;

export {addSimplex};