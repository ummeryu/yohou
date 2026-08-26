const bubblesHandler = require('../../bubbles');

module.exports = async function handler(req, res){
  req.query = Object.assign({}, req.query, {id: req.query.id || req.params?.id});
  return bubblesHandler(req, res);
};
