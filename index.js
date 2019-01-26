const axios = require("axios");
const { to } = require("await-to-js");
const process = require("process");

async function main() {
  const [err, subwayLines] = await to(getSubwayLines());

  if (err) {
    console.log(
      "Sorry, there was an error fetching the sub waylines. Please try again!"
    );
    process.exit(0); // exit gracefully
  }
  console.log(subwayLines);
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

main().then(() => console.log("Thanks, see you next time!"));
