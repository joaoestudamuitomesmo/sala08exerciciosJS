function calculaminhanotaaaaaaaaaaaaaaaaa(){
    n1 = parseFloat(document.getElementById('n1').value)
    n2 = parseFloat(document.getElementById('n2').value)
    n3 = parseFloat(document.getElementById('n3').value)

    document.getElementById("resposta").textContent = (n1+n2+n3)/3

    if(((n1+n2+n3)/3) === 67){
        document.getElementById("TuffOrNot").textContent="TUFF MOMENTS 67 AURUDO 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
    }else{
        document.getElementById("TuffOrNot").textContent=""
    }
}