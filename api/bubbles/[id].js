const bubblesHandler = require('../bubbles');

module.exports = async function handler(req, res){
  return bubblesHandler(req, res);
};
