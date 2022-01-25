let calc = {num:[], opSelected: true, numSelected:false,openParCount:0, closeParCount:0};


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
    if (calc.opSelected){
        if (p !== '-'){
            return;
        } else if (!(calc.num.length === 0 ||calc.num[calc.num.length - 1] === '(')){
            return;
        }
        
    }
    if (calc.numSelected){
        calc.numSelected = false;
    }
    calc.num.push(p);
    calc.opSelected = true;

    updtDisp();
}

function concatNum(n){
    if (calc.num[calc.num.length - 1] === 'π' ||
    (n === '0' && calc.num[calc.num.length-1] === '/')){
        return;
    }
    calc.num.push(n);
    if (calc.opSelected){
        calc.opSelected = false;
    }
    if (!calc.numSelected){
        calc.numSelected = true;
    }
    updtDisp();
}

function delInp(){
    calc.num.pop();
    const opSym = new Set("+-*/^")
    let last = calc.num[calc.num.length - 1];
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
    } 
    else if (last === '('){
        calc.openParCount--;
    } else if (last === ')'){
        calc.closeParCount--;
    } else if (last === 'π'){
        calc.opSelected = true;
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

function numify(){
    if (calc.num.length === 0){
        return "";
    }
    return calc.num.join("");
}

function updtDisp(){
    document.getElementById("disp").textContent = numify();
}

function clear(){
    calc.num.length = 0;
    calc.openParCount = 0;
    calc.closeParCount = 0;
    calc.numSelected = false;
    updtDisp();
    calc.opSelected = true;
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

/* solves a flattened expression following PEMDAS*/ 
function solve(expr){
    const ops = [new Set("^"), new Set("*/"), new Set("+-")];
    for (let j = 0; j < ops.length; ++j){
        let i = 0;
        while (i < expr.length){
            if (Array.isArray(expr[i])){
                if (expr[i][0] === '√'){
                    expr[i] = Math.sqrt(solve(expr[i][1]))
                } else{
                    expr[i] = solve(expr[i]);
                }
            } else{
                if (isNumeric(expr[i]) && ops[j].has(expr[i+1])){
                    expr.splice(i, 3,  opDict[expr[i+1]](parseFloat(expr[i]), parseFloat(expr[i+2])));
                } else{
                    i += 2;
                }
            }
        }
        
    }
    return expr[0];

}

document.getElementById("sqrt").addEventListener('click', function(){
    if (calc.numSelected || !calc.opSelected){
        return;
    }
    calc.num.push(this.textContent);
    updtDisp();
})
document.getElementById('pi').addEventListener('click', function(){
    if (calc.numSelected || (!calc.opSelected && !calc.num.length) || calc.num[calc.num.length-1] === this.textContent){
        return;
    }
    calc.num.push(this.textContent);
    calc.opSelected = false;
    updtDisp();
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