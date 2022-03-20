const launches = new Map();

let latestFlightNumber = 100;

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

const newLaunch = {}

launches.set(launch.flightNumber, launch);

function existLaunchWithID(launchId) {
    return launches.has(launchId);
}

function getAllLaunches() {
    return Array.from(launches.values());
}

function addNewLaunch(launch) {
    latestFlightNumber += 1;
    launches.set(
        latestFlightNumber,
        Object.assign(launch, {
            success: true,
            customers: ['Zero to Mastery', 'NASA'],
            upcoming: true,
            flightNumber: latestFlightNumber,
        }));
};

function abortLaunchById(launchId) {
    const aborted = launches.get(launchId);
    aborted.upcoming = false;
    aborted.success = false;
    return aborted;
};

module.exports = {
    getAllLaunches,
    addNewLaunch,
    abortLaunchById,
    existLaunchWithID,
};