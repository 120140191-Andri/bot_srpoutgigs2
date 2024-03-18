const express = require('express');
const port = 3800;
const axios = require('axios');
const { Client, LocalAuth } = require('whatsapp-web.js');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

const client = new Client({
    authStrategy: new LocalAuth(),
    // puppeteer: {
    //     headless: false
    // },
});

client.initialize();

let idJob = "335d9b59150a";
let total = 0;

function kirim_pesan(pesan){
    const number = "+6289634130573";
    const number1 = "+6285366367457";
    const chatId = number.substring(1) + "@c.us";
    const chatId1 = number1.substring(1) + "@c.us";
    client.sendMessage(chatId, pesan);
    client.sendMessage(chatId1, pesan);
}

io.on('connection', function(socket) {

    client.on('qr', (qr) => {
        qrcode.toDataURL(qr, (err, url) => {
            socket.emit('qr', url);
            socket.emit('message', 'QR Code received, scan please!');
        });
        console.log(qr);
    });

    client.on('authenticated', () => {
        console.log('AUTHENTICATED');
        socket.emit('authenticated', 'Whatsapp is authenticated!');
        socket.emit('message', 'Auth Berhasil!');
    });

    client.on('ready', () => {
        console.log('Client is ready!');
        socket.emit('message', 'Client is ready!');

        kirim_pesan('Server Dimulai');
        startServer();
    });

    client.on('message', (message) => {
        if(message.body.toUpperCase() == 'STR'){
            ResumeJob();
        }else if(message.body.toUpperCase() == 'STP'){
            PausedJob();
        }else if(message.body.toUpperCase() == 'STS'){
            total = 0;
        }
    })

})

app.get('/', (req, res) => {
    res.sendFile('index.html', {
      root: __dirname
    });
});

server.listen(port, function() {
    console.log('App running on *: ' + port);
});

const ResumeJob = async () => {

    await axios.post(
		`https://sproutgigs.com/api/jobs/job-resume.php`,
        {
            "job_id": `${idJob}`
        },
		{
			headers: {
				'Authorization': 'Basic ZDRmMDA4Y2M6ZmIuVURZbmlwNjNEajRIdjliclo3dS9NUEluWWgudDg=',
			}
		}
	).then(async response => {
        
        kirim_pesan('Job Dijalankan');
        
    })
    .catch(error => {
      // Handle errors here
      console.error('Error:', error.message);
    });
}

const PausedJob = async () => {
    
    await axios.post(
		`https://sproutgigs.com/api/jobs/job-pause.php`,
        {
            "job_id": `${idJob}`
        },
		{
			headers: {
				'Authorization': 'Basic ZDRmMDA4Y2M6ZmIuVURZbmlwNjNEajRIdjliclo3dS9NUEluWWgudDg=',
			}
		}
	).then(async response => {

        kirim_pesan('Job Di Stop');
        
    })
    .catch(error => {
      // Handle errors here
      console.error('Error:', error.message);
    });
}

function cek(){
    axios.get(
		`https://sproutgigs.com/api/jobs/get-rated-tasks.php?job_id=${idJob}`,
		{
			headers: {
				'Authorization': 'Basic ZDRmMDA4Y2M6ZmIuVURZbmlwNjNEajRIdjliclo3dS9NUEluWWgudDg=',
			}
		}
	).then(async response => {

        let jum = response.data.tasks.length;
        if(!isNaN(jum)){
            if(jum != total){
                total = jum;
                kirim_pesan(`${total} Task Telah Diselesaikan`);
            }else{
    
            }
        }

    })
    .catch(error => {
      // Handle errors here
      console.error('Error:', error.message);
    });
}

function startServer() {
    console.log('Server Jalan');
    cek();
    const delayId = setInterval(async () => {
        await clearInterval(delayId);
        startServer();
    }, 3000);
}

