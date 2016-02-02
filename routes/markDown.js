var express = require('express');
var router = express.Router();
var https = require('https'),
	exec = require('child_process').exec,
	path = require('fs'),
	util = require('util'),
	//sleep = require('sleep'),
	events = require('events'),
	emitter = new events.EventEmitter();

var Params = {
	req : null,
	res : null,
	Username : 'maplefu0602',
	Password : '9ol.)P:?',

	init : function (req, res) {
		this.req = req;
		this.res = res;
	}
};



var MarkDown = function(req, res) {
	Params.init(req, res);

	return {
	convertToPd : function(folder) {
		var pd = folder + '.pd';
		exec(util.format('cd %s && mkdocs2pandoc > %s',folder, pd), catchError);
		return pd;
	},

	pdToPdf : function(folder, pd, pdf) {
		var cmd = util.format('cd %s && pwd && pandoc --toc -f markdown+grid_tables+table_captions -o %s %s', folder, pdf, pd);
		console.log(cmd);
		return exec(cmd, catchError);
	},

	convertToPdf : function(folder) {
		var self = this;
		console.log('converting '+ folder);
		var pd = this.convertToPd(folder);
		var pdf = folder + '.pdf';
		console.log('converting to pdf file ' + pdf);
		setTimeout(function() {
			self.pdToPdf(folder, pd, pdf);

		}, 1000);

	},

	generateHtml : function(name, dataFolder, htmlFolder) {
		console.log('generate website from '+dataFolder+' to '+htmlFolder+' for '+name);
		var nodePath = process.cwd() + '/public/'+name;
		var cmd = util.format('cd %s && mkdocs build -d %s && ln -s %s %s', dataFolder, htmlFolder, htmlFolder, nodePath);
		console.log(cmd);
		newExec(cmd, function(stdout) {
			console.log(stdout);
			res.write(stdout);
			res.end;
		});
	}
	}
};

function newExec(command, callback) {
	
	var proc = exec(command);

	var list = [];
	proc.stdout.setEncoding('utf8');

	proc.stdout.on('data', function(d) {
		list.push(d);
	});

	proc.stdout.on('end', function() {
		if(callback) {
			callback(list.join());
		}
	});
	proc.stderr.on('data', function(d) {
		console.log('error :'+d);
	});
}

function catchError(error, stdout, stderr) {
	try {

	
	if(error) {
		console.log(error);
		//emitter.emit('error', error);
	} else {
		console.log(stdout.trim());
		//emitter.emit('info', stdout.trim());
		if(stderr) {
			console.log(stderr.trim());
			//emitter.emit('error', stderr.trim());
		}
	}
	console.log(stdout);
	
	} catch(err) {
		console.log(err);
	}

}

module.exports = MarkDown;

