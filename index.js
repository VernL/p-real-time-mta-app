const axios = require("axios");
const prompts = require("prompts");
const csv = require("fast-csv");

const baseUrl = "http://traintimelb-367443097.us-east-1.elb.amazonaws.com";

printRealTimeMtaStops().then(() => console.log("Thanks, see you next time!"));

/**
 * Prints the stop details for the route selected by the user
 *
 */
async function printRealTimeMtaStops() {
  try {
    const getSubwayLinesResponse = await axios(`${baseUrl}/getSubwaylines`);
    const subwayLineIds = getSubwayLinesResponse.data.map(
      subwayLine => subwayLine.id
    );
    const selectedLineId = await getUserSelectedLineId(subwayLineIds);
    const getStationsByLineResponse = await axios(
      `${baseUrl}/getStationsByLine/${selectedLineId}`
    );
    const stationsByLine = JSON.parse(getStationsByLineResponse.data);
    const stopIds = extractStopIds(stationsByLine);
    const stops = await loadMatchingStopsFromFile(stopIds);
    printStopDetails(selectedLineId, stops);
  } catch (e) {
    console.log(e);
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
  return stationsByLine.reduce((acc, cur) => {
    return acc.concat(cur.stations.map(station => station.id));
  }, []);
}

/**
 * Returns a promise that resolves into an array of stops for the selected route
 * @param {array} stopIds - array of stopIds
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
