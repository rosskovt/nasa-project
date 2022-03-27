const http = require('http');
const path = require('path');
const { mongoConnect } = require('./services/mongo');

const app = require(path.join(__dirname, 'app'));

const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchData } = require('./models/launches.model');

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
    await mongoConnect();
    
    await loadPlanetsData();

    await loadLaunchData();

    server.listen(PORT, () => {
        console.log(`The server is ready on port ${PORT}`);
    });
}

startServer();