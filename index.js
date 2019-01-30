const getRealTimeMTA = require("./src/realTimeMTA");
const printDetails = require("./src/printDetails");

getRealTimeMTA()
  .then(realTimeMTAData =>
    printDetails(realTimeMTAData.selectedSubwayLineId, realTimeMTAData.stops)
  )
  .then(() => console.log("Thanks, see you next time!"))
  .catch(err => {
    console.log(err);
  });
