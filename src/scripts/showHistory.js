import {ResultTypes} from "./simplex/simplexSolve.js";

const getItemBlock = (item) => {
    const {objFunc, constraints, upperBounds, signs, type} = item;

    const itemBlock = document.createElement('div');
    itemBlock.className = 'drawer_item';
    itemBlock.innerHTML =
        '<div class="drawer_item__header">\n' +
        '    <sl-icon-button class="open_item" slot="header-actions" name="box-arrow-in-up-left"></sl-icon-button>\n' +
        '    <sl-icon-button class="remove_item" slot="header-actions" name="dash-lg"></sl-icon-button>\n' +
        '</div>';

    const itemContent = document.createElement('div');
    itemContent.className = 'drawer_item__content';

    itemContent.append(getFunctionBlock(objFunc, type));
    itemContent.append(getConstraintsListBlock(constraints, upperBounds, signs))
    itemContent.append(getResultBlock(item.resultVars, item.resultFunc, item.resultType));

    itemBlock.append(itemContent);

    return itemBlock;
}

const getResultBlock = (resultVars, resultFunc, resultType) => {
    const resultBlock = document.createElement('div');
    resultBlock.innerHTML += '<div class="drawer_item__result-label">Результат:</div>';

    if (resultType === ResultTypes.NotExist) {
        resultBlock.innerHTML += 'Решений нет';
        return resultBlock;
    }
    if (resultType === ResultTypes.Unbounded) {
        resultBlock.innerHTML += 'Функция не ограничена';
        return resultBlock;
    }

    for (let i = 0; i < resultVars.length; i++) {
        resultBlock.innerHTML += `x<sub>${i + 1}</sub> = ${resultVars[i]}, `;
    }
    resultBlock.innerHTML += `F = ${resultFunc}`

    return resultBlock;
}

const getFunctionBlock = (objFunc, type) => {
    const functionValueBlock = document.createElement('div');
    functionValueBlock.className = 'drawer_item__function_value';
    for (let i = 0; i < objFunc.length; i++) {
        functionValueBlock.innerHTML += `${objFunc[i]}x<sub>${i + 1}</sub> + `
    }
    functionValueBlock.innerHTML = functionValueBlock.innerHTML.substring(0, functionValueBlock.innerHTML.length - 2);
    functionValueBlock.innerHTML += `<span>&#8594;</span> ${type}`;

    const functionBlock = document.createElement('div');
    functionBlock.className = 'drawer_item__function';
    functionBlock.innerHTML = '<div class="drawer_item__function-label">Целевая функция:</div>';
    functionBlock.append(functionValueBlock)

    return functionBlock;
}

const getConstraintsListBlock = (constraints, upperBounds, sings) => {
    const constraintsListBlock = document.createElement('div');
    constraintsListBlock.className = 'drawer_item__constraints-list';
    for (let i = 0; i < constraints.length; i++) {
        const item = document.createElement('div');
        item.className = 'drawer_item__constraints-item';
        for (let j = 0; j < constraints[i].length; j++) {
            item.innerHTML += `${constraints[i][j]}x<sub>${j + 1}</sub> + `
        }
        item.innerHTML = item.innerHTML.substring(0, item.innerHTML.length - 2);
        switch (sings[i]) {
            case '≤':
                item.innerHTML += '<span>≤</span>';
                break;
            case '≥':
                item.innerHTML += '<span>≥</span>';
                break;
            case '=':
                item.innerHTML += '<span>=</span>';
                break;
        }

        item.innerHTML += ` ${upperBounds[i]}`;

        constraintsListBlock.append(item);
    }

    const constraintsBlock = document.createElement('div');
    constraintsBlock.className = 'drawer_item__constraints';
    constraintsBlock.innerHTML = '<div class="drawer_item__constraints-label">Ограничения:</div>\n'
    constraintsBlock.append(constraintsListBlock)

    return constraintsBlock;
}


export {getItemBlock}