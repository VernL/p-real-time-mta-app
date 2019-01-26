const axios = require("axios");
const { to } = require("await-to-js");
const process = require("process");
const prompts = require("prompts");

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

  console.log(stations);
}

/**
 * Get Subway Lines
 *
 * @return {Promise} returns an array of subway line objects
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
 * Get User Selected Subway Line Id
 *
 * @return {Promise} returns an objected with the selected id
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
 * Get stations by Lines
 *
 * @return {Promise} returns an array of subway line objects
 */
function getStationsByLine(lineId) {
  console.log(lineId);
  return axios
    .get(
      `http://traintimelb-367443097.us-east-1.elb.amazonaws.com/getStationsByLine/${lineId}`
    )
    .then(function(res) {
      return res.data;
    });
}

main().then(() => console.log("Thanks, see you next time!"));
