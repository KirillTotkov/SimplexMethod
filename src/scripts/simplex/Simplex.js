import simplexSolve from "./simplexSolve.js";

class Simplex {
    /**
     * @param{Array.<number>} objFunc - Коэффициенты линейной целевой функции
     * @param{Array.<Array.<number>>} constraints - Матрица ограничений неравенства.
     * @param{Array.<number>} upperBounds - Вектор ограничения неравенства. Элементы это верхние границы соответствующего значения A
     * @param{Array.<string>} signs - Знак каждого ограничения
     * @param{string} type - Тип задачи: задача максимизации или минимизации
     */
    constructor(objFunc, constraints, upperBounds, signs, type) {
        this.objFunc = objFunc;
        this.constraints = constraints;
        this.upperBounds = upperBounds;
        this.signs = signs;
        this.type = type;
        this.resultVars = [];
        this.resultFunc = null;
        this.resultType = null;
    }

    solve() {
        return simplexSolve(this);
    }

}

export default Simplex;