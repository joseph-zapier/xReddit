/* eslint-disable global-require */

const creates = require('./creates');
const triggers = require('./triggers');
const authentication = require('./authentication');
const { befores, afters } = require('./middleware');

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication,
  beforeRequest: [...befores],
  afterResponse: [...afters],

  creates,
  triggers,

  // If you want your searches to show up, you better include it here!
  searches: {},

  resources: {},
};
