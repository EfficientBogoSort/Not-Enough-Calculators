let num = [];
let numButts = document.getElementsByClassName("num");
let opButts = document.getElementsByClassName("op");
let disp = document.getElementById("disp");
let clearButt = document.getElementById("clear");
let openPar = document.getElementById("openPar");
let closePar = document.getElementById("closePar");
let sqrt = document.getElementById("sqrt");
let del = document.getElementById('del');
let piButt = document.getElementById('pi');
let opSelected = true;
let numSelected = false;
let openParCount = 0;
let closeParCount = 0;
let opSym = new Set();


sqrt.addEventListener('click', function(){
    if (numSelected || !opSelected){
        return;
    }
    num.push(this.textContent);
    updtDisp();
})
piButt.addEventListener('click', function(){
    if (numSelected || (!opSelected && !num.length) || num[num.length-1] === this.textContent){
        return;
    }
    num.push(this.textContent);
    opSelected = false;
    updtDisp();
})

// only allow the user to input an opening parenthesis
// only when there is an operator before, so the calculator
// knows what operation to applt to this parenthesis
openPar.addEventListener('click',function(){
    if (numSelected || !opSelected || !num.length){
        return;
    }
    openParCount++;
    num.push(this.textContent);
    updtDisp();
    return
    
})
// only allow the user to put a closing parenthesis if there
// is an opening parenthesis that can be closed
// also it can't be placed after an operator as that would
// be invalid
closePar.addEventListener('click', function(){
    if ((openParCount <= closeParCount) || opSelected){
        return;
    }
    num.push(this.textContent);
    closeParCount++;
    updtDisp();
    return;
    
})


function addOp(){
    if (opSelected){
        return;
    }
    if (numSelected){
        numSelected = false;
    }
    num.push(this.textContent);
    opSelected = true;

    updtDisp();
}

for (let i = 0; i < numButts.length; ++i){
   numButts[i].addEventListener('click',function(){
       if (num[num.length - 1] === 'π'){
           return;
       }
       num.push(this.textContent);
       if (opSelected){
           opSelected = false;
       }
       if (!numSelected){
           numSelected = true;
       }
       updtDisp();
       
   }) 
}
for (let i = 0; i < opButts.length; ++i){
    opButts[i].addEventListener('click', addOp);
    opSym.add(opButts[i].textContent);
}


// depending on the last input after deleting,
// we have to make sure that the variables
// are correct to prevent unexpected functionality
del.addEventListener('click', function(){
    num.pop();
    let last = num[num.length - 1];
    if (last >= '0' && last <= '9'){
    } 
    else if (opSym.has(last)){
        numSelected = false;
        opSelected = true;
    } 
    else if (last === '('){
        openParCount--;
    } else if (last === ')'){
        closeParCount--;
    } else if (last === 'π'){
        opSelected = true;
    }
    updtDisp();
})



function numify(){
    if (num.length === 0){
        return "";
    }
    return num.join("");
}

function updtDisp(){
    disp.textContent = numify();
}

function clear(){
    num.length = 0;
    openParCount = 0;
    closeParCount = 0;
    numSelected = false;
    updtDisp();
    opSelected = true;
}
clearButt.addEventListener('click', clear);
