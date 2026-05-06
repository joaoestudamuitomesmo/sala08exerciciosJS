function mostrar(){
    var textinhoPo = document.getElementById("i1").value
    var printTexto = document.getElementById('printexto')
    printTexto.textContent = 'O texto digitado foi : ' + textinhoPo

    var corzinhapo = document.getElementById("i2").value
    var printcorzinhapo = document.getElementById('printcor')
    printcorzinhapo.innerHTML = `A cor escolhida foi : ${corzinhapo}`

    var datinhapo = document.getElementById("i3").value
    var printdatinhapo = document.getElementById('printdata')
    printdatinhapo.innerText = `A data escolhida foi : ${datinhapo}`

    var checkboxzinhopo = document.getElementById("i4").checked
    var printcheckboxzinhopo = document.getElementById('printcheckbox')
    printcheckboxzinhopo.innerText = `A checkbox deu : ${checkboxzinhopo}`
}