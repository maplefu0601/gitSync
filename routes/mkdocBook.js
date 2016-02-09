
var fs = require('fs'),
	request = require('request');

var JsonPath = '/var/www/bookFile/';
var GdcBookUrl = 'http://gdcdoc.rfu.local/mkdoc_book/new';

var MkdocBook = function(req, res) {

	function saveFile(name, data, func) {
		console.log('saving '+name);
		fs.writeFile(name, data, function(err) {
			if(err) {
				console.log('error in writing file '+name+'---'+err);
				return;
			}	

			console.log('saved file '+ name);

			if(func) {
				func(name);	
			}
		});	
	};

	function sendFile(name, func) {
		request({
			url: GdcBookUrl,
			method: 'POST',
			json: true,
			headers: {'Authorization':'Basic cmZ1OktldmluNGZ1'},
			form: {"name":name}
		}, function(err, response, body) {
			if(err) {
				console.log('error sending request to '+GdcBookUrl+'---error:'+err);	
			} else {
				console.log('=====sent=====\n'+JSON.stringify(response));
				console.log('------body----\n'+body);
				if(func) {
					func(response);	
				}	
			}
		});
	}; 

	return {
	
		refreshYamlBook : function(name, data) {
			var fileName = JsonPath + name + '.json';
			saveFile(fileName, JSON.stringify(data), sendFile);
		},
	};
};


module.exports = MkdocBook;


