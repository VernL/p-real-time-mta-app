/**
 *  Prints the stops for the selected route
 *  @param {string} selectedSubwayLineId
 *  @param {array} stops
 */
function printDetails(selectedSubwayLineId, stops) {
  console.log(`Stops of route ${selectedSubwayLineId}:`);
  stops.forEach(stop => {
    console.log(
      `- ${stop.stop_name} (${stop.stop_id}): ${stop.stop_lat},${stop.stop_lon}`
    );
  });
}

module.exports = printDetails;
