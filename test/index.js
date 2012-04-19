var Yourls = require('../yourls');

var yourls_url = 'ph.ly';
var yourls_api = '1a40d1e654';

module.exports = {
	'shorten url': function(test) {
		var yourls = new Yourls(yourls_url, yourls_api);
		yourls.shorten('https://github.com/gabrielpreston/node-yourls', function(error, result) {
			test.ifError(error);
			test.deepEqual(result.statusCode, 200);
			test.done();
		});
	},

	'expand valid full url': function(test) {
		var yourls = new Yourls(yourls_url, yourls_api);
		yourls.expand('http://ph.ly/dzg-v', function(error, result) {
			test.ifError(error);
			test.deepEqual(result.statusCode, 200);
			test.done();
		});
	},

	'expand valid hash': function(test) {
		var yourls = new Yourls(yourls_url, yourls_api);
		yourls.expand('dzg-v', function(error, result) {
			test.ifError(error);
			test.deepEqual(result.statusCode, 200);
			test.done();
		});
	},

	'url-stats valid url': function(test) {
		var yourls = new Yourls(yourls_url, yourls_api);
		yourls.urlstats('http://ph.ly/dzg-v', function(error, result) {
			test.ifError(error);
			test.deepEqual(result.statusCode, 200);
			test.done();
		});
	},

	'url-stats valid hash': function(test) {
		var yourls = new Yourls(yourls_url, yourls_api);
		yourls.urlstats('dzg-v', function(error, result) {
			test.ifError(error);
			test.deepEqual(result.statusCode, 200);
			test.done();
		});
	},

	// do tests on invalid full url/hash?

}


