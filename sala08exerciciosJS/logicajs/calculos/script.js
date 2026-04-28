function resenhar(){
    var n1 = document.getElementById("n1").valueAsNumber;
    var n2 = document.getElementById("n2").valueAsNumber;

    resp = document.getElementById("resposta");
    resp.textContent = n1+n2;
}

function resenharAoContrario(){
    var n4 = document.getElementById("n3").valueAsNumber;
    var n5 = document.getElementById("n4").valueAsNumber;

    resp = document.getElementById("respostaMenos");
    resp.textContent = n4-n5;
}

function resenharCapitalismo(){
    var n5 = document.getElementById("n5").valueAsNumber;
    var n6 = document.getElementById("n6").valueAsNumber;

    resp = document.getElementById("capitalismo");
    resp.textContent = n5*n6;
}

function resenharComunismo(){
    var n7 = document.getElementById("n7").valueAsNumber;
    var n8 = document.getElementById("n8").valueAsNumber;

    resp = document.getElementById("comunismo");
    resp.textContent = n7/n8;
}