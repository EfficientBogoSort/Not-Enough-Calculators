let calc = {num:[], 
    opSelected: true, 
    numSelected:false,
    openParCount:0, 
    closeParCount:0, 
    specialSym:false, 
    dot:false, 
    resDisplayed: false};
const ZERO_DIV_ERROR = 'Division by zero';
const INVALID_EXPR_ERROR = 'Invalid expression';
const PI_SYM = 'π';

// functions for each operation
function sumNums(a,b){
    return a+b;
}
function subNums(a,b){
    return a-b;
}
function mulNums(a,b){
    return a*b;
}
function divNums(a,b){
    if (b === 0){
        return ZERO_DIV_ERROR;
    }
    return a/b;
}
function expNums(a,b){
    return Math.pow(a,b);
}

let opDict = {
    '+': sumNums,
    '-': subNums,
    '*': mulNums,
    '/': divNums,
    '^': expNums
}

document.onkeydown = function (e){
    event.preventDefault();
    if (e.key >= '0' && e.key <= '9'){
        concatNum(e.key);
    } else if (e.key === 'Backspace'){
        delInp();
    } else if (e.key in opDict){
        addOp(e.key);
    }
}

function addOp(p){
    if (calc.resDisplayed){
        let startNum = document.getElementById('lower').textContent.split('')
        clear();
        calc.num = startNum;
        calc.resDisplayed = false;
        
    } else if (calc.opSelected){
        if (p !== '-'){
            return;
        } else if (!(calc.num.length === 0 ||
            calc.num[calc.num.length - 1] === '(')){
            return;
        }
        
    }
    if (calc.numSelected){
        calc.numSelected = false;
    }
    calc.num.push(p);
    calc.opSelected = true;
    calc.specialSym = false;
    calc.dot = false;

    updtDisp();
}

function checkNewExpr(){
    if (!calc.resDisplayed){
        return;
    }
    clear();
    calc.resDisplayed = false;
}

function concatNum(n){
    if (calc.specialSym){
        return;
    }
    checkNewExpr();
    calc.num.push(n);
    if (calc.opSelected){
        calc.opSelected = false;
    }
    if (!calc.numSelected){
        calc.numSelected = true;
    }
    updtDisp();
}

function addSpecialSym(symb){
    if (calc.numSelected || 
        (!calc.opSelected && !calc.num.length) || calc.specialSym){
        return;
    }
    calc.num.push(symb);
    calc.opSelected = false;
    calc.specialSym = true;
    updtDisp();
}
function delInp(){
    if (calc.resDisplayed){
        return;
    }
    let deleted = calc.num.pop();
    if (deleted === '.'){
        calc.dot = false;
    }
    const opSym = new Set("+-*/^")
    let last = calc.num[calc.num.length - 1];

    // make sure that the calculator parameters are correct
    if (last >= '0' && last <= '9'){
        if (!calc.numSelected){
            calc.numSelected = true;
        }
        if (calc.opSelected){
            calc.opSelected = false;
        }  
    } 
    else if (opSym.has(last)){
        calc.numSelected = false;
        calc.opSelected = true;
        calc.specialSym = false;
    } 
    else if (last === '('){
        calc.openParCount--;
    } else if (last === ')'){
        calc.closeParCount--;
    } else if (last === PI_SYM || last === 'e'){
        calc.opSelected = false;
        calc.specialSym = true;
        calc.numSelected = false;
    }
    updtDisp();
}

function addButtFunct(){
    let numButts = document.getElementsByClassName("num");
    let opButts = document.getElementsByClassName("op");
    for (let i = 0; i < numButts.length; ++i){
        numButts[i].addEventListener('click', function(){
            concatNum(this.textContent);
         }); 
     }
     for (let i = 0; i < opButts.length; ++i){
        opButts[i].addEventListener('click', function(){
            addOp(this.textContent);
        });
    }
}


function clearDisp(){
    let butts = document.getElementsByClassName("disp");
    for (let i = 0; i < butts.length; ++i){
        butts[i].textContent = '';
    }
}

function updtDisp(){
    if (calc.num.length === 0){
        clearDisp();
    } else{
        document.getElementById("upper").textContent = calc.num.join("");
    }
}

function clear(){
    calc.num.length = 0;
    calc.openParCount = 0;
    calc.closeParCount = 0;
    calc.numSelected = false;
    updtDisp();
    calc.opSelected = true;
    calc.dot = false;
    
}

function isNumeric(term){
    return !isNaN(term) && !isNaN(parseFloat(term));
}
/*before adding to the current expression,
tokens that are array or square roots are split.
Numeric values are added directly
*/
function processTok(tok, currExpr){
    if (tok[0] === '(' && tok[tok.length-1] === ')'){
        tok = splitExpr(tok.substring(1, tok.length-1),  new Set('+-*/^'));
    } else if (tok[0] === '√'){
        let tmp;
        if (tok[1] === '('){
            tmp = splitExpr(tok.substring(2, tok.length-1))
        } else{
            tmp = tok.substring(2, tok.length);
        }
        tok = ['√', tmp];
    }
    currExpr.push(tok);
}
/* flattens out an expression into arrays
Does not concern with order of operations.
eg: "1+3(5*5)" --> [1, +, [5,*,5]]
*/
function splitExpr(expr){
    const sign = new Set('+-*/^');
    let finalExpr = [];
    let curr = '';
    let pCount = 0;
    for (let i = 0; i < expr.length; ++i){
        if (!sign.has(expr[i])){
             if (expr[i] === ')'){
                pCount--;
            } else if (expr[i] === '('){
                pCount++;
            } 
            curr += expr[i];
        } else{
            // have to remember that negative sign can go in front
            // of another number without a number before it
            if (pCount > 0 ||
                (expr[i] === '-' && (sign.has(expr[i-1]) || i === 0) ||
                expr[i-1] === '(')){
                curr += expr[i];
            } else{
                processTok(curr, finalExpr);
                finalExpr.push(expr[i]);
                curr = '';
            }
        }

    }
    if (curr){
        processTok(curr, finalExpr);
    }
    return finalExpr;

}

function getNumValue(num){
    if (num === PI_SYM){
        return Math.PI;
    } else if (num === 'e'){
        return Math.E;
    } else if (isNumeric(num)){
        return parseFloat(num);
    } else{
        return false;
    }
}
/* solves a flattened expression following PEMDAS*/ 
function solve(expr){
    const ops = [new Set("^"), new Set("*/"), new Set("+-")];
    for (let j = 0; j < ops.length; ++j){
        let i = 0;
        while (i < expr.length){
            if (expr[i] === ZERO_DIV_ERROR || expr[i] === INVALID_EXPR_ERROR){
                return expr[i];
            }
            if (Array.isArray(expr[i])){
                if (expr[i][0] === '√'){
                    expr[i] = Math.sqrt(solve(expr[i][1]))
                } else{
                    expr[i] = solve(expr[i]);
                }
            } else{
                let n1 = getNumValue(expr[i]), n2 = getNumValue(expr[i+2]);
                if (n1 !== false && n2 !== false && ops[j].has(expr[i+1])){
                    let tmp = opDict[expr[i+1]](n1, n2);
                    if (tmp === ZERO_DIV_ERROR){
                        return ZERO_DIV_ERROR;
                    }
                    expr.splice(i, 3, tmp);
                } else{
                    i += 2;
                }
            }
        }
        
    }

    
    if (expr.length > 1){
        return INVALID_EXPR_ERROR;
    }
    return expr[0];

}

function displayResult(){
    document.getElementById('lower').textContent = solve(splitExpr(calc.num));
    calc.resDisplayed = true;
}

document.getElementById('dot').addEventListener('click', ()=>{
    if (calc.dot){
        return;
    }
    checkNewExpr();
    calc.num.push('.');
    calc.dot = true;
    updtDisp();
})


document.getElementById('result').addEventListener('click', displayResult);

document.getElementById("sqrt").addEventListener('click', function(){
    if (calc.numSelected || !calc.opSelected){
        return;
    }
    calc.num.push(this.textContent);
    updtDisp();
})
document.getElementById('pi').addEventListener('click', function(){
   addSpecialSym(this.textContent);
})

document.getElementById('euler').addEventListener('click', function(){
    addSpecialSym(this.textContent);
})
// only allow the user to input an opening parenthesis
// only when there is an operator before, so the calculator
// knows what operation to applt to this parenthesis
document.getElementById("openPar").addEventListener('click',function(){
    if (calc.numSelected || !calc.opSelected){
        return;
    }
    calc.openParCount++;
    calc.num.push(this.textContent);
    updtDisp();
    return
    
})
// only allow the user to put a closing parenthesis if there
// is an opening parenthesis that can be closed
// also it can't be placed after an operator as that would
// be invalid
document.getElementById("closePar").addEventListener('click', function(){
    if ((calc.openParCount <= calc.closeParCount) || calc.opSelected){
        return;
    }
    calc.num.push(this.textContent);
    calc.closeParCount++;
    updtDisp();
    return;
    
})

addButtFunct();

// depending on the last input after deleting,
// we have to make sure that the variables
// are correct to prevent unexpected functionality
document.getElementById('del').addEventListener('click', delInp);

document.getElementById("clear").addEventListener('click', clear);