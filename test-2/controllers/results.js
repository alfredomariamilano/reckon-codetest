const axios = require('axios');
const config = require('../config/config');
const RECKON_API = config.RECKON_API;
const CANDIDATE_NAME = config.CANDIDATE_NAME;
const NO_OUTPUT_TEXT = config.NO_OUTPUT_TEXT;

function getTextToSearch() {
  return axios.get(`${RECKON_API}/textToSearch`);
}

function getSubTexts() {
  return axios.get(`${RECKON_API}/subTexts`);
}

function loopThroughCharacters(params) {
  params.textToSearch = params.textToSearch.toLowerCase();

  for (var i = 0; i < params.textToSearch.length; i++) {
    params.i = i;
    loopThroughSubTexts(params);
  }
  return params;
}

function loopThroughSubTexts(params) {
  for (var x = 0; x < params.subTexts.length; x++) {
    params.x = x;
    if (params.subTexts[x].subtext.toLowerCase()[0] === params.textToSearch[params.i]) {
      checkWholeWord(params);
    }
  }
}

function checkWholeWord(params) {
  let counter = 0;
  for (var y = 0; y < params.subTexts[params.x].subtext.toLowerCase().length; y++) {
    if (params.subTexts[params.x].subtext.toLowerCase()[y] !== params.textToSearch[params.i+y]) {
      counter = 0;
    } else if (params.subTexts[params.x].subtext.toLowerCase()[y] === params.textToSearch[params.i+y]) {
      ++counter;
      if (counter === params.subTexts[params.x].subtext.toLowerCase().length) {
        if (params.subTexts[params.x].result === NO_OUTPUT_TEXT) {
          params.subTexts[params.x].result = [];
        } else {
          params.subTexts[params.x].result = params.subTexts[params.x].result.split(', ');
        }
        params.subTexts[params.x].result.push(params.i+1);
        params.subTexts[params.x].result = params.subTexts[params.x].result.join(', ');
      }
    }
  }
}

function getResults(req, res) {
  axios.all([getTextToSearch(), getSubTexts()])
    .then(axios.spread(function (textToSearch, subTexts) {
      textToSearch = textToSearch.data.text;
      subTexts = subTexts.data.subTexts.map((subtext) => {
        return {
          subtext,
          result: NO_OUTPUT_TEXT
        };
      });

      const params = {
        textToSearch,
        subTexts,
        x: 0,
        i: 0
      };

      const data = loopThroughCharacters(params);

      const results = {
        candidate: CANDIDATE_NAME,
        text: data.textToSearch,
        results: subTexts
      };

      axios.post(`${RECKON_API}/submitResults`)
        .then(({data}) => {
          console.log(data);
          res.status(200).json(results);
        });
    }));
}

module.exports = getResults;
