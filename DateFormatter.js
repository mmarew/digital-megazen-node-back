function DateFormatter(dateTimeString, timeZone) {
  let date = new Date(dateTimeString);
  let Year = date.getFullYear();
  let Month = date.getMonth();
  let Day = date.getDate();

  let formattedDate =
    Year +
    "-" +
    (Month + 1).toString().padStart(2, "0") +
    "-" +
    Day.toString().padStart(2, "0");

  return formattedDate;
}

const currentDate = new Date();
const year = currentDate.getFullYear();
const month = currentDate.getMonth() + 1; // Months are zero-based, so we add 1
const day = currentDate.getDate();
// let CurrentYMD = year + "-" + month + "-" + day;
function isValidDateFormat(dateString) {
  const timestamp = Date.parse(dateString);
  return !isNaN(timestamp);
}
module.exports.isValidDateFormat = isValidDateFormat;
module.exports.DateFormatter = DateFormatter;
module.exports.CurrentYMD = year + "-" + month + "-" + day;
// export default DateFormatter;
