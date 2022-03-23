const { getAllLaunches, abortLaunchById, existLaunchWithID, scheduleNewLaunch } = require('../../models/launches.model')

async function httpGetAllLaunches(req, res) {
    return res.status(200).json(await getAllLaunches());
}

async function httpAddNewLaunch(req, res) {
    const launch = req.body;

    if (!launch.mission || !launch.rocket || !launch.launchDate
        || !launch.target) {
        return res.status(400).json({
            error: 'Missing required launch property',
        });
    }

    launch.launchDate = new Date(launch.launchDate);
    //if (launch.launchDate.toString() === 'Invalid Date') {
    if (isNaN(launch.launchDate)) {
        return res.status(400).json({
            error: 'Invalid Date',
        });
    }

    //addNewLaunch(launch);
    await scheduleNewLaunch(launch);
    return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
    const lauchId = Number(req.params.id);

    //abortLaunchById(lauchId);
    const existLaunch = await existLaunchWithID(lauchId);
    if (!existLaunch) {
        return res.status(404).json({
            error: 'Launch not found',
        });
    }

    const aborted = await abortLaunchById(lauchId);
    if (!aborted) {
       return res.status(400).json({
           error: 'Launch not aborted',
       }); 
    }
    return res.status(200).json({
        ok: true,
    });
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch,
};