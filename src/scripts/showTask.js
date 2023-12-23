function paintFunction(numVariables, objFunc = []) {
    const functionBlock = document.querySelector('.function-equation');
    functionBlock.innerHTML = ''
    const constraintsNonNegativity = document.querySelector('.constraints-non-negativity');
    constraintsNonNegativity.innerHTML = '';
    for (let i = 0; i < numVariables; i++) {
        const funInputElem = getInputElem(i);
        funInputElem.value = objFunc[i] ?? 1;

        const funLabelElem = document.createElement('label');
        funLabelElem.className = 'variable-name';
        funLabelElem.innerHTML = `X <sub>${i + 1}</sub>`;

        if (i === numVariables - 1) {
            functionBlock.append(funInputElem, funLabelElem);
        } else {
            functionBlock.append(funInputElem, funLabelElem, '+');
        }
        constraintsNonNegativity.innerHTML += `x<sub>${i + 1}</sub>, `;
    }
    constraintsNonNegativity.innerHTML = constraintsNonNegativity.innerHTML.slice(0, -2);
    constraintsNonNegativity.innerHTML += ' ≥ 0';

    functionBlock.insertAdjacentHTML('beforeend', ' <span>&#8594</span>' +
        '                <select name="select-objective" id="select-objective" class="select">' +
        '                    <option value="Max">Max</option>' +
        '                    <option value="Min">Min</option>' +
        '                </select>')

}

function paintConstraints(numVariables, numConstraints, constraints = [], upperBounds = [], signs = []) {
    const constraintsEquationsBlock = document.querySelector('.constraints-equations');
    constraintsEquationsBlock.innerHTML = '';

    for (let i = 0; i < numConstraints; i++) {
        const constraintBlock = document.createElement('div');
        constraintBlock.className = 'constraint-block';
        constraintBlock.id = `constraint-${i + 1}`;
        for (let j = 0; j < numVariables; j++) {
            const constrInputElem = getInputElem(j);
            constrInputElem.id = `x${j + 1}-${i + 1}`;

            if (constraints.length > 0 && constraints[i] !== undefined) {
                constrInputElem.value = constraints[i][j] ?? 1;
            }

            const constrLabelElem = document.createElement('label');
            constrLabelElem.className = 'variable-name';
            constrLabelElem.innerHTML = `X <sub>${j + 1}</sub>`;

            if (j === numVariables - 1) {
                constraintBlock.append(constrInputElem, constrLabelElem);
            } else {
                constraintBlock.append(constrInputElem, constrLabelElem, '+');
            }
        }

        if (signs.length > 0) {
            constraintBlock.insertAdjacentHTML('beforeend', `<select id="sign${i + 1}">' +
            '                        <option ${signs[i] === "≤" ? "selected" : ""} value="≤">≤</option>' +
            '                        <option ${signs[i] === "≥" ? "selected" : ""} value="≥">≥</option>' +
            '                        <option ${signs[i] === "=" ? "selected" : ""} value="=">=</option>' +
            '                    </select>`);
        } else {
            constraintBlock.insertAdjacentHTML('beforeend', `<select id="sign${i + 1}">' +
            '                        <option value="≤">≤</option>' +
            '                        <option value="≥">≥</option>' +
            '                        <option value="=">=</option>' +
            '                    </select>`);

        }

        const constrInputElem = getInputElem(i);
        constrInputElem.id = `y${i + 1}`;
        if (upperBounds.length > 0) {
            constrInputElem.value = upperBounds[i] ?? 1;
        }

        constraintBlock.append(constrInputElem);

        constraintsEquationsBlock.append(constraintBlock)
    }
}

const getInputElem = (i) => {
    const funInputElem = document.createElement('input');
    funInputElem.className = 'variable-input';
    // funInputElem.placeholder = "0";
    funInputElem.value = "1"
    funInputElem.type = "text";
    funInputElem.id = `x${i + 1}`;
    // funInputElem.pattern = "^-?\\d+(?:\\.\\d+)?(?:\\/\\d+)?$";
    // funInputElem.title = "Принимаются только целые числа, десятичные дроби (с точкой) и дроби";
    // funInputElem.pattern = "^-?\\d+(?:\\.\\d+)?$";
    // funInputElem.title = "Принимаются только целые числа, десятичные дроби (с точкой)";
    funInputElem.pattern = "^-?\\d*\\.{0,1}\\d+$";
    funInputElem.title = "Принимаются только целые числа";

    funInputElem.inputMode = "numeric";
    funInputElem.required = true;

    return funInputElem;
}


export {paintFunction, paintConstraints}