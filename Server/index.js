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
function writeImage(fileName, imageCaption) {
    var Jimp = require("jimp");
    var loadedImage;

    return Jimp.read(fileName).then(image => {
        loadedImage = image;
        return Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
    }).then(font => {
        loadedImage.print(font, 10, loadedImage.bitmap.height - 20, imageCaption).write(fileName);
        return true;
    }).catch(err => {
        console.error(err);
        return false;
    });
}
app.get('/', (req, res) => {
    console.log("frase "+ quoteRandom()); 
    res.send("ok")
})
app.get('/status', (req, res) => { 
    res.send("ok")
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
