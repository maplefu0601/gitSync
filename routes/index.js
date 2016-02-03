var express = require('express');
var router = express.Router();
var https = require('https'),
	exec = require('child_process').exec,
	path = require('fs'),
	util = require('util'),
	config = require('../config.json'),
	markdown = require('./markDown.js'),
	gitextend = require('./gitExtend.js'),
	//sleep = require('sleep'),
	events = require('events'),
	emitter = new events.EventEmitter();

var GitHubApi = gitextend.gitHubApi;
var GitHub = gitextend.gitHub;
var GitHubRepoHook = gitextend.gitHubRepoHook;
var GitHubUser = gitextend.gitHubUser;
var MarkDown = markdown;
/*
var github = new GitHubApi({
	protocol: "https",
	host: "api.github.com"
});
*/

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

/* GET home page. */
router.get('/', function(req, res, next) {
	Params.init(req, res);
  //res.render('index', { title: 'you got it' });
var testHub = new GitHubApi({
	username : Params.Username,
	password : Params.Password,
	auth : "basic"
});

var user = testHub.getUser();
user.show(Params.Username, function(err, user) {
	//console.log(user);
});
user.userRepos(Params.Username, function(error, ret) {
	console.log('userRepos error:'+error);
	console.log('user repos: ' + ret);
});
user.userRepos(Params.Username, function(err, repos) {
	console.log('get user repos:' + repos);
})

user.repos(function(error, ret) {
	console.log('-------repos-------'+ret);
	ret.forEach(function(repo) {
		//console.log(JSON.stringify(repo));
		console.log(repo.clone_url);
	});	
});
var Repos = testHub.getRepo(Params.Username, 'gdc-docs');
Repos.show(function(error, repo) {
	//console.log('===show==='+JSON.stringify(repo)+'\n');
});

  //GitHub.getRepositories();
  res.jsonp({
	  ok:'got repos'
  })
});


var testHub = new gitextend.gitHubApi({
	username : Params.Username,
	password : Params.Password,
	auth : "basic"
});


router.get('/testgit', function(req, res) {
	console.log('----testgit----');
	GitHubRepoHook(Params.Username, "test-gdcdocs").listHook(function(error, ret) {
		console.log("hooks list: "+JSON.stringify(ret));
		if(!ret) {
			options = {
				"name":"web",
				"active":true,
				"events":["push", "push_request"],
				"config":{
					"url":"http://52.32.211.9:6600/gitChanged?name=test-gdcdocs",
					"content_type":"json"
				}
			}
			GitHubRepoHook(Params.Username, 'test-gdcdocs').createHook(options, function(error, hook) {
				console.log('create a new hook: '+hook);
			});
		}
	});
	res.jsonp({success:"ok"});
});

//--/createHook?name=test-gdcdocs
router.get('/createHook', function(req, res) {
	var name = req.query.name;
	console.log('----create hook for----'+name);
	GitHubRepoHook(Params.Username, name).listHook(function(error, ret) {
		console.log("hooks list: "+JSON.stringify(ret));
		if(!ret) {
			options = {
				"name":"web",
				"active":true,
				"events":["push", "push_request"],
				"config":{
					"url":"http://52.32.211.9:6600/gitChanged?name="+name,
					"content_type":"json"
				}
			}
			GitHubRepoHook(Params.Username, name).createHook(options, function(error, hook) {
				console.log('created a new hook for: '+name+'\n'+hook);
			});
		}
	});
	res.jsonp({success:"ok"});
});

router.post('/gitchanged', doGitChanged);
router.get('/gitchanged', doGitChanged);

function doGitChanged(req, res) {
	var folder = req.query.name;
	console.log("------git changed-------"+folder);
	Params.init(req, res);
	GitHubUser.getRepos(folder, function(name, url) {
		console.log('start.........'+name);	
		var dataFolder = config.gitdata.gitFolder;
		try {
			path.exists(dataFolder + name, new GitHub(req, res).getGit(dataFolder, name, url, function(d) {
				var autoGenWeb = config.config.autoGenWebSite;
				
				if(autoGenWeb) {
					doGenerateHtml(req, res);
				}

				var autoGenPdf = config.config.autoCreatePdf;
				if(autoGenPdf) {
					doMarkdown(req, res);	
				}
			}));
		} catch(err) {
			console.log('git change error: '+err);
		}

	});
}

router.get('/markdown', doMarkdown);
function doMarkdown(req, res) {
	var name = req.query.name;
	var pdfFolder = config.pdf.destPath + name;
	var dataFolder = config.gitdata.gitFolder + name;
	console.log('-----markdown----from '+dataFolder+' to '+pdfFolder+' for '+name);
	Params.init(req, res);
	new MarkDown(req, res).convertToPdf(name, dataFolder, pdfFolder);

};

router.get('/generateHtml', doGenerateHtml);
function doGenerateHtml(req, res) {

	var name = req.query.name;
	var dataFolder = config.gitdata.gitFolder + name;
	var htmlFolder = config.html.sitePath + name;

	console.log('generate site from '+dataFolder+' to '+htmlFolder+' for  '+name);

	new MarkDown(req, res).generateHtml(name, dataFolder, htmlFolder);
};


module.exports = router;

