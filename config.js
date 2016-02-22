
var fs = require('fs');
var path = require('path');
var config = require('./config.json');

var Config = {
	
	checkConfig : function() {
		
		var baseFolder = config.gitdata.baseFolder;
		var gitFolder = baseFolder + config.gitdata.gitFolder;
		var bookFileFolder = baseFolder + config.gitdata.bookFile;
		var sitePath = baseFolder + config.html.sitePath;
		var destPdfPath = baseFolder + config.pdf.destPath;
		var logPath = baseFolder + config.log.logPath;

		[gitFolder, bookFileFolder, sitePath, destPdfPath, logPath].forEach(function(name) {
			if(!fs.existsSync(name)) {
				createFolder(name, 0777);
			}
			
		});
	},

	/**
	 * updateConfig: update part of config
	 * param data: part of config data, like {config:{autoCreatePdf:false}}
	 * author: Raymond Fu
	 * date: Feb 3, 2016
	 **/
	updateConfig : function(data) {
		
		var obj = JSON.parse(data);
		for(var conf in obj) {
			//console.log(conf+'-----'+obj[conf]+'-----'+Object.keys(obj[conf]).length);
			if(Object.keys(obj[conf]).length > 0) {
				for(var bb in obj[conf]) {//only support 2 levels now
					//console.log(bb+'====='+obj[conf][bb]);
					config[conf][bb] = obj[conf][bb];	
				}	
			}	
		}

		var data = JSON.stringify(config);
		fs.writeFile('./config.json', data, function(err) {
			
			if(err) {
				console.log('error updating to config.json. '+ err);
			} else {
				console.log('updated config.json. \n' + data);
			}
		});
	},

	saveConfig : function(data) {
		
		fs.writeFile('./config.json', data, function(err) {
			
			if(err) {
				console.log('error writing to config.json. '+ err);
			} else {
				console.log('saved config.json. \n' + data);
			}
		});
	},

	folders : function() {
		var baseFolder = config.gitdata.baseFolder;
		var gitFolder = baseFolder + config.gitdata.gitFolder;
		var bookFileFolder = baseFolder + config.gitdata.bookFile;
		var sitePath = baseFolder + config.html.sitePath;
		var destPdfPath = baseFolder + config.pdf.destPath;
		var logPath = baseFolder + config.log.logPath;
	
		return {
			'baseFolder': baseFolder,
			'gitFolder' : gitFolder,
			'bookFileFolder' : bookFileFolder,
			'sitePath' : sitePath,
			'destPdfPath' : destPdfPath,
			'logPath' : logPath
		};
	},
};

function createFolder(dirPath, mode, callback) {
	
	fs.mkdir(dirPath, mode, function(error) {
		
		if(error && error.code === 'ENOENT') {
			createFolder(path.dirname(dirPath), mode, callback);
			createFolder(dirPath, mode, callback);
		} else {
			console.log('created folder '+dirPath);
			if(callback) {
				callback(error);
			}
		}
	});
}

//for test
//config.config.autoCreatePdf = true;
//Config.saveConfig(JSON.stringify(config));
//Config.updateConfig(JSON.stringify({config:{autoGenWebSite:true}}));

module.exports = Config;

