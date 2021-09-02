const express = require('express')
const app = express()
const port = 4000
var quotes = [];
getQuote();
function getQuote(){
    var Request = require("request");
    Request.get("https://raw.githubusercontent.com/bitgary/hola-mundo/master/citas.json", (error, response, body) => {
        if(error) {
            return console.dir(error);
        }
        var data =JSON.parse(body)
        for (var i = 0; i < data.length; i++) {
            
            var quote = data[i].cita
            quotes.push(quote)
         }
    });
}
function aleatorio(minimo,maximo){
    return Math.round(Math.random() * (maximo - minimo) + minimo);
}
function quoteRandom(){
    var index = aleatorio(0,quotes.length);
    return quotes[index]
}

app.get('/', (req, res) => {
    console.log("frase "+ quoteRandom()); 
    res.send("ok")
})
app.get('/status', (req, res) => { 
    res.send("ok")
})
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
