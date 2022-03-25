
const express = require('express');

const api = express.Router();

const planetsRouter = require('../routes/planets/planets.router');
const launchesRouter = require('../routes/launches/launches.router');

api.use('/planets', planetsRouter);
api.use('/launches', launchesRouter);

module.exports = api;