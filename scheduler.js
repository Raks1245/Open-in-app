
function start(callback) {
    // Set random interval between 45 to 120 seconds
    const interval = Math.floor(Math.random() * (120000 - 45000 + 1) + 45000);
  
    // Execute the callback at the defined interval
    setInterval(callback, interval);
  }
  
  module.exports = {
    start,
  };
  