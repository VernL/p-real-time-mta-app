const axios = require("axios");
const prompts = require("prompts");
const csv = require("fast-csv");
const fs = require("fs");

const baseUrl = "http://traintimelb-367443097.us-east-1.elb.amazonaws.com";
const stopsFilePath = "data/stops.txt";

/**
 * Returns the selected subway line id and the stop details
 *
 * @return {object} selectedSubwayLineId, stopIds
 */
async function getRealTimeMTA() {
  try {
    fs.accessSync(stopsFilePath, fs.F_OK);
    const getSubwayLinesResponse = await axios(`${baseUrl}/getSubwaylines`);
    const subwayLineIds = getSubwayLinesResponse.data.map(
      subwayLine => subwayLine.id
    );
    const selectedSubwayLineId = await getUserSelectedLineId(subwayLineIds);
    const getStationsByLineResponse = await axios(
      `${baseUrl}/getStationsByLine/${selectedSubwayLineId}`
    );
    const stationsByLine = JSON.parse(getStationsByLineResponse.data);
    const stopIds = extractStopIds(stationsByLine);
    const stops = await loadMatchingStopsFromFile(stopsFilePath, stopIds);

    return { selectedSubwayLineId, stops };
  } catch (err) {
    if (err.code === "ENOENT") {
      throw Error(
        "stops.txt not found! Please place it in the data folder and try again."
      );
    } else {
      throw Error(`There was a problem getting MTA data: ${err}`);
    }
  }
}

/**
 * Returns the user selected line id
 * @param {array} subwayLines - an array of subway line objects
 *
 * @return {string}
 */
async function getUserSelectedLineId(subwayLines) {
  console.log(subwayLines.join());
  const userInput = await prompts({
    type: "text",
    name: "selectedLineId",
    message: "Please enter a subway line id from the above list",
    validate: selectedLineId => subwayLines.includes(selectedLineId)
  });

  return userInput.selectedLineId;
}

/**
 * Returns an array of subway stop ids for the selected route
 * @param  {array} stationsByLine
 *
 * @return {array}
 */
function extractStopIds(stationsByLine) {
  return stationsByLine.reduce(
    (acc, cur) => acc.concat(cur.stations.map(station => station.id)),
    []
  );
}

/**
 * Returns a promise that resolves into an array of stops for the selected route
 * @param {string} stopsFilePath
 * @param {array} stopIds - array of stopIds
 *
 * @return {Promise}
 */
function loadMatchingStopsFromFile(stopsFilePath, stopIds) {
  return new Promise(resolve => {
    const stops = [];
    csv
      .fromPath(stopsFilePath, { headers: true })
      .on("data", function(data) {
        if (stopIds.includes(data.stop_id)) {
          stops.push(data);
        }
      })
      .on("end", function() {
        resolve(stops);
      });
  });
}

module.exports = getRealTimeMTA;
