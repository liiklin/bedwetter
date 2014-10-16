/**
 * Module dependencies
 */
var actionUtil = require('../actionUtil');
var Boom = require('boom');

/**
 * Create Record
 *
 * post /:modelIdentity
 *
 * An API call to find and return a single model instance from the data adapter
 * using the specified criteria.  If an id was specified, just the instance with
 * that unique id will be returned.
 *
 * Optional:
 * @param {String} callback - default jsonp callback param (i.e. the name of the js function returned)
 * @param {*} * - other params will be used as `values` in the create
 */

module.exports = function createRecord (route, options) {
  
	return function(request, reply) {
	      
	      var Model = actionUtil.parseModel(request, options);
      
	      // Create data object (monolithic combination of all parameters)
	      // Omit the blacklisted params (like JSONP callback param, etc.)
	      var data = actionUtil.parseValues(request, options);
      
	      // Create new instance of model using data from params
	      Model.create(data).exec(function created (err, newInstance) {
      
		      // Differentiate between waterline-originated validation errors
		      // and serious underlying issues. Respond with badRequest if a
		      // validation error is encountered, w/ validation info.
		      if (err) return reply(Boom.wrap(err));
      
		      // "HTTP 201 / Created"
		      // TODO: set location for this item if possible.
		      reply(newInstance).created();
	      });
	}
  
};