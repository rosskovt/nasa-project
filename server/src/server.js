const http = require('http');
const path = require('path');

const app = require(path.join(__dirname, 'app'));

const { loadPlanetsData } = require('./models/planets.model');

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
    await loadPlanetsData();
    
    server.listen(PORT, ()=>{
        console.log(`The server is ready on port ${PORT}`);
    });
}

startServer();