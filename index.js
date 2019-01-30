const getRealTimeMTA = require("./src/realTimeMTA");
const printDetails = require("./src/printDetails");

getRealTimeMTA()
  .then(readlTimeMTAData => printDetails(readlTimeMTAData.selectedSubwayLineId, readlTimeMTAData.stops))
  .then(() => console.log("Thanks, see you next time!"))
  .catch(err => {
    console.log("Something went wrong, please try again!", err);
  });
