const axios = require('axios');
const reckonAPI = require('../config/config').reckonAPI;

function getRangeInfo() {
  return axios.get(`${reckonAPI}/rangeInfo`);
}

function getDivisorInfo() {
  return axios.get(`${reckonAPI}/divisorInfo`);
}

function results(req, res) {
  axios.all([getRangeInfo(), getDivisorInfo()])
    .then(axios.spread(function (rangeInfo, divisorInfo) {
      rangeInfo = rangeInfo.data;
      divisorInfo = divisorInfo.data;

      const results = [];

      for (var i = rangeInfo.lower; i < rangeInfo.upper; i++) {
        let output = '';
        divisorInfo.outputDetails.forEach((detail) => {
          if (i % detail.divisor === 0) {
            output += detail.output;
          }
        });
        results.push({position: i, output});
      }

      res.render('index', {
        results
      });
    }));
}

module.exports = results;
