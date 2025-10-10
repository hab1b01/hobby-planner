function randomBase36(len) {
  return Math.random().toString(36).substr(2, len);
}

function genManagementCode() {
  return (Date.now().toString(36).slice(-4) + randomBase36(6)).substr(0, 10);
}
function genPrivateCode() {
  return randomBase36(8);
}
function genAttendanceCode() {
  return (Date.now().toString(36).slice(-4) + randomBase36(8)).substr(0, 12);
}

module.exports = { genManagementCode, genPrivateCode, genAttendanceCode };