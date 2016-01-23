var path = require('path');
module.exports = {
  'naturalearth-3.3.0': {
    files: require('./naturalearth-3.3.0/files.json'),
    meta: require('./naturalearth-3.3.0/meta.json'),
    index: path.join(__dirname, 'naturalearth-3.3.0', 'name-index.csv')
  }
};
