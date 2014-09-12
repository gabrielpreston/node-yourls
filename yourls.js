/**
 * yourls - A node module for calling the yourls API
 * See http://yourls.org/#API for details
 * about the API requests and responses
 * Copyright (c) 2012 Gabriel Preston
 * MIT Licence
 * Note: My first attempt at doing something like this, starting
 *		 from Tane Piper's node-bitly module as a base.
 *		 https://github.com/tanepiper/node-bitly/
 */

var url = require('url');
var http = require('http');
var https = require('https');

/**
 * The main yourls constructor, takes the yourls api url, api token and additional options
 * @param {String} yourls_url The URL of the Yourls service being used
 * @param {String} api_token  The users API token
 * @param {Object} options    Optional options
 */
var yourls = function(yourls_url, api_token, options) {
	// Set default options
	options = options || {
		format: 'json'
	};

	// Set up the config for requests being made with the instance of this
	this.config = {
		api_token: api_token,
		format: options.format,
		api_url: yourls_url.replace(/https?:\/\//gi, ''), // remove http(s):// from url
		protocol: yourls_url.indexOf('https://') == 0 ? 'https': 'http' // defaults to http
	};

	return this;
};

/**
 * Returns valid format for action
 * @param {String} format Format to check
 * @param {String} action Yourls action (shorturl, expand, etc)
 * @return {String} Valid format [json, jsonp, xml, simple], json as default
 */
yourls.prototype._checkFormat = function(format, action) {
	var valid_format = 'json';
	// valid for all
	if( ['json', 'jsonp', 'xml'].indexOf(format) >= 0 ) {
		valid_format = format;
	}
	else if( format === 'simple' && ['shorturl', 'expand'].indexOf(action)  >= 0) {
		valid_format = 'simple';
	}

	return valid_format;
};

/**
 * Generates the URL object to be passed to the HTTP(S) request for a specific
 * API method call
 * @param  {Object} query The query object
 * @return {Object}       The URL object for this request
 */
yourls.prototype._generateNiceUrl = function(query) {
	var result = url.parse(url.format({
		protocol: this.config.protocol,
		hostname: this.config.api_url,
		pathname: '/yourls-api.php',
		query: query
	}));
	// HACK: Fixes the redirection issue in node 0.4.x
	if( !result.path ) {
		result.path = result.pathname + result.search;
	}

	return result;
};

/**
 * Function to do a HTTP(S) Get request with the current query
 * @param  {Object}   request_query The current query object
 * @param  {Function} cb            The callback function for the returned data
 * @return {void}
 */
yourls.prototype._doRequest = function(request_query, cb) {
	// Pass the requested URL as an object to the get request
	var protocol = this.config.protocol === 'https' ? https: http;
	//var protocol = require(this.config.protocol);
	protocol.get(request_query, function(res) {
			var data = [];
			res
			.on('data', function(chunk) { data.push(chunk); })
			.on('end', function() {
					var urldata = data.join('').trim();
					var result;
					try {
						result = JSON.parse(urldata);
					} catch (exp) {
						result = {'status_code': 500, 'status_text': 'JSON Parse Failed'}
					}
					cb(null, result);
			});
	})
	.on('error', function(e) {
			cb(e);
	});
};

/**
 * Request to shorten one long url
 * @param  {String}   longUrl The URL to be shortened
 * @param  {Function} cb      The callback function with the results
 * @return {void}
 */
yourls.prototype.shorten = function(longUrl, cb) {
	var query = {
		signature: this.config.api_token,
		url: longUrl,
		action: 'shorturl'
	};
	query.format = this._checkFormat(this.config.format, query.action);

	this._doRequest(this._generateNiceUrl(query), cb);
};

/**
 * Request to shorten one long url and return a vanity url
 * @param  {String}   longUrl    The URL to be shortened
 * @param  {String}   vanityName The requested vanity url
 * @param  {Function} cb         The callback function with the results
 * @return {void}
 */
yourls.prototype.vanity = function(longUrl, vanityName, cb) {
	var query = {
		signature: this.config.api_token,
		url: longUrl,
		keyword: vanityName,
		action: 'shorturl'
	};
	query.format = this._checkFormat(this.config.format, query.action);

	this._doRequest(this._generateNiceUrl(query), cb);
};

/**
 * Request to expand a single short url or hash
 * @param  {String}   item The short url or hash to expand
 * @param  {Function} cb   The callback function with the results
 * @return {void}
 */
yourls.prototype.expand = function(item, cb) {
	var query = {
		signature: this.config.api_token,
		shorturl: item,
		action: 'expand'
	};
	query.format = this._checkFormat(this.config.format, query.action);

	this._doRequest(this._generateNiceUrl(query), cb);
};

/**
 * Request to retrieve stats on a specific short url/hash
 * @param  {String} item The short url or hash to get stats on
 * @param  {Function} cb The callback function with the results
 * @return {void}
 */
yourls.prototype.urlstats = function(item, cb) {
	var query = {
		signature: this.config.api_token,
		shorturl: item,
		action: 'url-stats'
	};
	query.format = this._checkFormat(this.config.format, query.action);

	this._doRequest(this._generateNiceUrl(query), cb);
};

/**
 * Request stats about your links
 * @param  {String} limit  Maximum number of links to return
 * @param  {String} filter  The filter to apply to stats [top, bottom, rand, last]
 * @param  {Function} cb The callback function with the results
 * @return {void}
 */
yourls.prototype.stats = function(limit, filter, cb) {
	var max = parseInt(limit);
	var query = {
		signature: this.config.api_token,
		action: 'url-stats',
		filter: ["top", "bottom" , "rand", "last"].indexOf(filter) >= 0 ? filter: 'top', // retrive top urls by default
		limit: max > 1 ? max: 1
	};
	query.format = this._checkFormat(this.config.format, query.action);

	this._doRequest(this._generateNiceUrl(query), cb);
};

/**
 * Request global link and click count
 * @param  {Function} cb The callback function with the results
 * @return {void}
 */
yourls.prototype.dbstats = function(cb) {
	var query = {
		signature: this.config.api_token,
		action: 'db-stats'
	};
	query.format = this._checkFormat(this.config.format, query.action);

	this._doRequest(this._generateNiceUrl(query), cb);
};

// Export as main entry point in this module
module.exports = yourls;
