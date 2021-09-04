const express = require('express')
const fs = require('fs')
const app = express()
const port = 4000
var quotes = [];
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(__dirname + '/public'))

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
function writeImage(fileName, imageCaption) {
    var Jimp = require("jimp");
    var loadedImage;

    return Jimp.read(fileName).then(image => {
        loadedImage = image;
        return Jimp.loadFont(Jimp.FONT_SANS_16_ORANGE);
    }).then(font => {
        loadedImage.print(font, 15, loadedImage.bitmap.height - 10, imageCaption).write(fileName);
        return true;
    }).catch(err => {
        console.error(err);
        return false;
    });
}
function base64_decode(data) {
    return new Buffer(data, 'base64');
}

app.get('/', (req, res) => {
    console.log("frase "+ quoteRandom()); 
    res.send("ok")
})
app.get('/status', (req, res) => { 
    res.send("server ok")
})
app.post('/receiveImage', (req, res) => {
    console.log("Receive image from middleware", req.body.name);
    let imgPath = 'public/' + req.body.name;
    fs.writeFileSync(imgPath, base64_decode(req.body.image64.split(",")[1]));
    console.log("Saved image");

    writeImage(imgPath, quoteRandom()).then(im=>{
        console.log("Return state", im);
        res.send({ok: im})
      
    });
})
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
