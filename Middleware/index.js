const express = require("express")
const exec = require('child_process').exec;
const readLastLines = require('read-last-lines')
const nodemailer = require('nodemailer');
const cors = require('cors')
const axios = require('axios')
const app = express()
const port = 5000
const ip = '127.0.0.1'

app.use(express.json());
app.use(express.static(__dirname + '/public'))
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

var currentPort =4001
var servers = [];
var reqId = 1
var requests=[];
var responses = [];

addServer();

setInterval(()=>{
    if(requests[0]){
        let server = servers.shift();

        if(server){
            sendImage(server, requests.shift());
        }
    }
    servers.forEach(ss=>{
        exec(`sh watch.sh ${ip} ${ss.port}`, (error, stout, stderr) => {
            if (error !== null) {
                console.log(`exec error: ${error}`);
            }
        })
    });
	readLastLines.read('log.txt', servers.length).then((text) => {
        let lines = text.split('\n');
        lines.splice(lines.length - 1)
        let data;
        let serverIndex;
        
        for (var i = 0; i < lines.length; i++) {
           data = lines[i].split(' ');
           serverIndex = servers.findIndex(ss => ss.port == data[1])
		   
            if(serverIndex != undefined){
                servers[serverIndex].monitor.time = data[0];
                    if (data[2]=="server"){
                        servers[serverIndex].monitor.status = true
                    }
                    else {
                        servers[serverIndex].monitor.status = false
                    }  
            }
            console.log("aquuui"+servers[serverIndex].monitor.status)
        }
    });
},1000);

function addServer(){
	let port = currentPort++
	console.log(`sh add-server.sh ${port}`);
	exec(`sh add-server.sh ${port}`, (error, stout, stderr) => {
        if (error !== null) {
        	if(`${error}`.includes("port is already allocated")){
            	servers.push({port, monitor:{ time:null, status:false }})
            	console.log(`Connected to server ${ip}:${port}`);
        	}else{
        		console.log(`No se pudo conectar a ${ip}:${port}`);
        	}
        }else{
            servers.push({port, monitor:{ time:null, status:false }})
            console.log(`Connected to server ${port}`);
        }
    })
}

var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'sistem.dist2021@gmail.com',
		pass: '201710359'
	}
});
function sendEmail(destino, encabezado, texto){
    var mailOptions ={
		to: destino,
		subject: encabezado,
		text: texto
	}
	
	transporter.sendMail(mailOptions,(error, info)=>{
		if (error) {
			console.log("EMail",error);
	   	} else {
			console.log('Email enviado: ' + info.response);
	   	}
	});
}

function sendImage(server, req){
	let serverURL = 'http://' + ip + ':' + server.port;
    console.log("Selected server", serverURL);
    req.body.image.name = req.id + req.body.image.name;
    console.log(req.body.image.name)
    axios({
        method: 'post',
        url: serverURL + '/receiveImage',
        data: req.body.image
    }).then(imgRes=>{
        let data = imgRes.data;
        console.log("Image returns", data.ok);
        
        if(data.ok){
            data.imgURL = serverURL + '/' + req.body.image.name;
        }else{
            console.log("receive image", imgRes);
        }

        servers.push(server);
        responses.push({id:req.id, data});
    }).catch(err=>{
        sendEmail(req.body.email, "Error con servidor",`El servidor ${ip}:${server.port} no sirve.`)
        console.log(err);
    });
}

app.get("/add-server", (req, res) => {
	addServer();
	res.send("ok")
});

app.get("/send-email", (req, res) => {
	sendEmail("neyder.rodriguez@uptc.edu.co","prueba","hola desde server");
	res.send("ok")
});
app.get("/logs", (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

app.post("/", (req, res) => {
    res.send(servers)
});

app.post("/uploadData",(req, res) => {
	console.log("Connection by client");
	let rId = reqId++;
	requests.push({id: rId, body:req.body });
	
	const interval = setInterval(()=>{
		let resp = responses.find(rr => rr.id == rId);

		if(resp){
			res.send(resp.data);
			responses.splice(responses.indexOf(resp),1)
			clearInterval(interval);
		}
	}, 1000);
});

app.listen(port, () => {
	console.log(`App is listening to port ${port}`);
});  