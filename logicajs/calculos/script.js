function resenhar(){
    var n1 = parseFloat(document.getElementById("n1").value);
    var n2 = parseFloat(document.getElementById("n2").value);

    resp = document.getElementById("resposta");
    resp.textContent = n1+n2;
}

function resenharAoContrario(){
    var n4 = parseFloat(document.getElementById("n3").value);
    var n5 = parseFloat(document.getElementById("n4").value);

    resp = document.getElementById("respostaMenos");
    resp.textContent = n4-n5;
}

function resenharCapitalismo(){
    var n5 = parseFloat(document.getElementById("n5").value);
    var n6 = parseFloat(document.getElementById("n6").value);

    resp = document.getElementById("capitalismo");
    resp.textContent = n5*n6;
}

function resenharComunismo(){
    var n7 = parseFloat(document.getElementById("n7").value);
    var n8 = parseFloat(document.getElementById("n8").value);

    resp = document.getElementById("comunismo");

    if(n8 !== 0){
        resp.textContent = n7/n8;
    } else{
        resp.textContent = "Você não sabe usar matematica seu imbecil do caralho não da pra dividir por zero porra"
    }
}