const express = require("express")
const exec = require('child_process').exec;
const readLastLines = require('read-last-lines')
const nodemailer = require('nodemailer');

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

let serverAStatus = false;
let serverBStatus = false;
let time='';
let states = [];
const port = 5000
const ip = '127.0.0.1'
var servers = [];
var currentPort =4000
var requests=[];
var responses = [];

app.listen(port, () => {
	console.log(`App is listening to port ${port}`);
  });  

setInterval(()=>{
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
        console.log("aquiii "+lines)
        for (var i = 0; i < lines.length; i++) {
           data = lines[i].split(' ');
           serverIndex = servers.findIndex(ss => ss.port == data[1])

           if(serverIndex != undefined){
               servers[serverIndex].monitor.time = data[0];
               servers[serverIndex].monitor.status = data[2] == "Server"
           }
        }
    });
	updateStates(serverAStatus, serverBStatus);
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

app.get("/add-server", (req, res) => {
	addServer;
	res.send("ok")
});

app.get("/send-email", (req, res) => {
	sendEmail("neyder.rodriguez@uptc.edu.co","prueba","hola desde server");
	res.send("ok")
});
app.get("/", (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

