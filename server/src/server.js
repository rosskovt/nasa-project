const http = require('http');
const path = require('path');
const mongoose = require('mongoose');

const app = require(path.join(__dirname, 'app'));

const { loadPlanetsData } = require('./models/planets.model');

const PORT = process.env.PORT || 8000;

const MONGO_URL = `mongodb+srv://nasa-api:PgRdUngDEfjl8Ue4@nasacluster.upnct.mongodb.net/nasa?retryWrites=true&w=majority`;

const server = http.createServer(app);

mongoose.connection.once('open', () => {
    console.log('MongoDB connection ready');
});

mongoose.connection.on('error', (err) =>{
console.error(err);
});
async function startServer() {
    await mongoose.connect(MONGO_URL);
    
    await loadPlanetsData();

    server.listen(PORT, () => {
        console.log(`The server is ready on port ${PORT}`);
    });
}

startServer();