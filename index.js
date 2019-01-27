const axios = require("axios");
const { to } = require("await-to-js");
const process = require("process");
const prompts = require("prompts");
const csv = require("fast-csv");

async function main() {
  const [lineErr, subwayLines] = await to(getSubwayLines());

  if (lineErr) {
    console.log(
      "Sorry, there was an error fetching the sub waylines. Please try again!"
    );
    process.exit(0); // exit gracefully
  }

  console.log(subwayLines.join());
  const selectedLineId = await getUserSelectedLineId(subwayLines);

  console.log(selectedLineId);

  const [stopsErr, stations] = await to(getStationsByLine(selectedLineId));

  if (stopsErr) {
    console.log(
      "Sorry, there was an error fetching the stops. Please try again!"
    );
    process.exit(0); // exit gracefully
  }

  const stopIds = extractStopIds(stations);

  console.log(stations);

  const stops = await loadMatchingStopsFromFile(stopIds);

  console.log(stops);

  printStopDetails(selectedLineId, stops);
}

/**
 * Returns a promise that resolves with an array of subway line objects
 *
 * @return {Promise}
 */
function getSubwayLines() {
  return axios
    .get(
      "http://traintimelb-367443097.us-east-1.elb.amazonaws.com/getSubwaylines"
    )
    .then(function(res) {
      return res.data.map(el => {
        return el.id;
      });
    });
}

/**
 * Returns the user selected line id
 * @param {array} subwayLines - an array of subway line objects
 *
 * @return {string}
 */
async function getUserSelectedLineId(subwayLines) {
  const userInput = await prompts({
    type: "text",
    name: "selectedLineId",
    message: "Please enter a subway line id from the above list",
    validate: selectedLineId => subwayLines.includes(selectedLineId)
  });

  return userInput.selectedLineId;
}

/**
 * Returns a promise that resolves with an array of subway line ids
 * @param {string} lineId
 * @return {Promise}
 */
function getStationsByLine(lineId) {
  console.log(lineId);
  return axios
    .get(
      `http://traintimelb-367443097.us-east-1.elb.amazonaws.com/getStationsByLine/${lineId}`
    )
    .then(function(res) {
      return JSON.parse(res.data);
    });
}

/**
 * Returns an array of subway stop ids for the selected route
 * @param  {array} stations
 *
 * @return {array}
 */
function extractStopIds(stations) {
  const stopIds = [];
  stations.forEach(borough => {
    borough["stations"].forEach(station => {
      stopIds.push(station.id);
    });
  });
  return stopIds;
}

/**
 *  Returns a promise that resolves into an array of stops for the selected route
 *  @param {array} stopIds - array of stopIds
 *
 * @return {Promise}
 */
function loadMatchingStopsFromFile(stopIds) {
  return new Promise(resolve => {
    const dataArray = [];
    csv
      .fromPath("./stops.txt", { headers: true })
      .on("data", function(data) {
        if (stopIds.includes(data.stop_id)) {
          dataArray.push(data);
        }
      })
      .on("end", function() {
        resolve(dataArray);
      });
  });
}

/**
 *  Prints the stops for the selected route
 *  @param {string} selectedLineId
 *  @param {array} stops
 */
function printStopDetails(selectedLineId, stops) {
  console.log(`Stops of route ${selectedLineId}:`);
  stops.forEach(stop => {
    console.log(
      `- ${stop.stop_name} (${stop.stop_id}): ${stop.stop_lat},${stop.stop_lon}`
    );
  });
}

main().then(() => console.log("Thanks, see you next time!"));
