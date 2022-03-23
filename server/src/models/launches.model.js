const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

const launches = new Map();

//let latestFlightNumber = 100;

const launch = {
    flightNumber: 100,
    mission: 'Kepler exploration X',
    rocket: 'Explorer IS1',
    launchDate: new Date('December 27, 2030'),
    target: 'Kepler-442 b',
    customers: ['ZTM', 'NASA'],
    upcoming: true,
    success: true,
};

saveLaunch(launch);

//launches.set(launch.flightNumber, launch);

async function existLaunchWithID(launchId) {
    return await launchesDatabase.findOne({
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
};

async function getAllLaunches() {
    //return Array.from(launches.values());
    return await launchesDatabase
        .find({}, { '_id': 0, '__v': 0 });
}

async function saveLaunch(launch) {
    const planet = await planets.find({
        keplerName: launch.target,
    });

    if (!planet) {
        throw new Error('No matching planet was found!')
    }
    try {
        await launchesDatabase.findOneAndUpdate({
            flightNumber: launch.flightNumber,
        }, launch, {
            upsert: true,
        });
    } catch (err) {
        console.error(`Could not save a planet ${err}`);
    }
};

async function scheduleNewLaunch(launch) {
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

module.exports = {
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById,
    existLaunchWithID,
};