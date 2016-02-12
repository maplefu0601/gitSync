
var fs = require('fs'),
	request = require('request');

var JsonPath = '/var/www/bookFile/';
var GdcBookUrl = 'http://gdcdoc.rfu.local/mkdoc_book/new';

var MkdocBook = function(req, res) {

	function saveFile(name, data, dataFolder, func) {
		console.log('saving '+name);
		fs.writeFile(name, data, function(err) {
			if(err) {
				console.log('error in writing file '+name+'---'+err);
				return;
			}	

			console.log('saved file '+ name);

			if(func) {
				func(name, dataFolder);	
			}
		});	
	};

	function sendFile(name, dataFolder, func) {
		request({
			url: GdcBookUrl,
			method: 'POST',
			json: true,
			headers: {'Authorization':'Basic cmZ1OktldmluNGZ1'},
			form: {"name":name, "datafolder":dataFolder}
		}, function(err, response, body) {
			if(err) {
				console.log('error sending request to '+GdcBookUrl+'---error:'+err);	
			} else {
				//console.log('=====sent=====\n'+JSON.stringify(response));
				console.log('------body----\n'+body);
				if(func) {
					func(response);	
				}	
			}
		});
	}; 

	return {
	
		refreshYamlBook : function(name, data, dataFolder) {
			var fileName = JsonPath + name + '.json';
			var base64Data = new Buffer(JSON.stringify(data)).toString('base64');
			saveFile(fileName, base64Data, dataFolder, sendFile);
		},
	};
};


module.exports = MkdocBook;


