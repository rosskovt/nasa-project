const express = require('express');

const planetsRouter = express.Router();

//const planetsController = require('./planets.controller');
const { httpGetAllPlanets } = require('./planets.controller');

planetsRouter.get('/', httpGetAllPlanets);

module.exports = planetsRouter;