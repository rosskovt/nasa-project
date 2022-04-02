const axios = require('axios');
const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

const launches = new Map();

//let latestFlightNumber = 100;

// const launch = {
//     flightNumber: 100,
//     mission: 'Kepler exploration X',
//     rocket: 'Explorer IS1',
//     launchDate: new Date('December 27, 2030'),
//     target: 'Kepler-442 b',
//     customers: ['ZTM', 'NASA'],
//     upcoming: true,
//     success: true,
// };

//saveLaunch(launch);

//launches.set(launch.flightNumber, launch);

async function findLaunch(filter) {
    return launchesDatabase.findOne(filter);
}

async function existLaunchWithID(launchId) {
    return await findLaunch({
        flightNumber: launchId,
    });
}

async function getLatestFlightNumber() {
    const latestLaunch = await launchesDatabase.findOne()
        .sort('-flightNumber'); //descending sorting with a *minus sign*
    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }
    return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
    //return Array.from(launches.values());
    return await launchesDatabase
        .find({}, { '_id': 0, '__v': 0 })
        .sort('flighuptNumber') //.sort({ flightNumber: 1 })
        .skip(skip)
        .limit(limit);
}

async function saveLaunch(launch) {
   
    try {
        await launchesDatabase.findOneAndUpdate({
            flightNumber: launch.flightNumber,
        }, launch, {
            upsert: true,
        });
    } catch (err) {
        console.error(`Could not save a planet ${err}`);
    }
}

async function scheduleNewLaunch(launch) {
    const planet = await planets.find({
        keplerName: launch.target,
    });

    if (!planet) {
        throw new Error('No matching planet was found!')
    }
    const latestFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        success: true,
        customers: ['Zero to Mastery', 'NASA'],
        upcoming: true,
        flightNumber: latestFlightNumber,
    });
    await saveLaunch(newLaunch);
}

// function addNewLaunch(launch) {
//     latestFlightNumber += 1;
//     launches.set(
//         latestFlightNumber,
//         Object.assign(launch, {
//             success: true,
//             customers: ['Zero to Mastery', 'NASA'],
//             upcoming: true,
//             flightNumber: latestFlightNumber,
//         }));
// };

// function abortLaunchById(launchId) {
//     const aborted = launches.get(launchId);
//     aborted.upcoming = false;
//     aborted.success = false;
//     return aborted;
// };

async function abortLaunchById(launchId) {
    const aborted = await launchesDatabase
        .updateOne({
            flightNumber: launchId,
        }, {
            upcoming: false,
            success: false,
        });
    return aborted.modifiedCount === 1;
}

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
    console.log('donwloading the data from the API');
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        'customers': 1
                    }
                }
            ]
        }
    });

if (response.status !== 200) {
    console.log('Problem downloading data from SpaceX');
    throw new Error('Launch data download failed!');
}

    const launchDocs = response.data.docs;
    for (const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers'];
        });
        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers,
        };
        console.log(`${launch.flightNumber} ${launch.mission}`);

        //populate launches collection
        await saveLaunch(launch);
    }
}

async function loadLaunchData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    });
    if (firstLaunch) {
        console.log('Launch Data already exists');
    } else {
        await populateLaunches();
    }
}



module.exports = {
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById,
    existLaunchWithID,
    loadLaunchData,
};
