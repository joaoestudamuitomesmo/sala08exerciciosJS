function mostrar(){
    var textinhoPo = document.getElementById("i1").value
    var printTexto = document.getElementById('printexto')
    printTexto.textContent = 'O texto digitado foi : ' + textinhoPo

    var corzinhapo = document.getElementById("i2").value
    var printcorzinhapo = document.getElementById('printcor')
    printcorzinhapo.innerHTML = corzinhapo
}