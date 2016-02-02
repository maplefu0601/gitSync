var express = require('express');
var router = express.Router();
var https = require('https'),
	exec = require('child_process').exec,
	path = require('fs'),
	util = require('util'),
	//sleep = require('sleep'),
	events = require('events'),
	emitter = new events.EventEmitter();

var GitHubApi = require("github-api");
/*
var github = new GitHubApi({
	protocol: "https",
	host: "api.github.com"
});
*/
var RepoUrl = 'https://github.com/maplefu0602/test-gdcdocs.git';
var Dir = './test-gdcdocs';

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


var testHub = new GitHubApi({
	username : Params.Username,
	password : Params.Password,
	auth : "basic"
});

var GitHubUser = {
	
	user : testHub.getUser(),

	getRepos : function(repoName, func) {
		
		if(this.user) {

			this.user.repos(function(error, repos) {
				if(error) {
					console.log('getRepos error: ' + error);
				} else {

					repos.forEach(function(repo) {
						var name = repo.name;
						var url = repo.clone_url;
						console.log('name:' + repo.name);
						console.log('url:' + repo.url);
						
						if(name !== repoName) {
							return;
						}

						if(func) {
							func.call(null, name, url);
						};
					});
				}
			});
		}
	},
};

var GitHubRepoHook = function(userName, repoName) {
	var hooks = {//save hooks using key-value, ie "web":"hookId"

	};
	var repoObj = testHub.getRepo(userName, repoName);

	var listHook = function(func) {
		if(repoObj) {
			repoObj.listHooks(func);
		}
	};
/*
	options: {
		"name":"web",
		"active":true,
		"events":["push", "push_request"],
		"config":{
			"url":"http://aaa.com/gitChanged?name=test-gdcdocs",
			"content_type":"json"
		}
	}
*/	
	var createHook = function(options, func) {
		if(repoObj) {
			repoObj.createHook(options, func);
		}
	};

	var getHook = function(hookId, func) {
		if(repoObj) {
			repoObj.getHook(hookId, func);
		}
	};

	var deleteHook = function(hookId, func) {
		if(repoObj) {
			repoObj.deleteHook(hookId, func);
		}
	};

	var editHook = function(id, options, func) {
		if(repoObj) {

			repoObj.editHook(hookId, options, func);
		}
	};

	return {
		listHook : listHook,
		createHook : createHook,
		deleteHook : deleteHook,
		editHook : editHook,
		getHook : getHook
	}
};

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

router.get('/gitchanged', function(req, res) {
	var folder = req.query.name;
	console.log("------git changed-------"+folder);
	Params.init(req, res);
	GitHubUser.getRepos(folder, function(name, url) {
		console.log('start.........'+name);	
		path.exists('./'+name, GitHub.getGit(name, url));

	});
});

router.get('/markdown', function(req, res) {
	var folder = req.query.name;
	console.log('-----markdown----' + folder);
	Params.init(req, res);
	MarkDown.convertToPdf(folder);
	setTimeout(function() {
		res.jsonp({
			info: 'converting files'
		})

	}, 3000);
});


var MarkDown = {
	
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
};

var GitHub = {
	init : function(req, res) {
		this.req = req;
		this.res = res;
	},

	authBasic : function(user, pass) {
		return 'Basic ' + (new Buffer(user + ':' + pass)).toString('base64');
	},

	auth : function(user, pass) {
/*		github.authenticate({

			type: "basic",
			username: user,
			password: pass
		});
*/	},

	getRepositories : function() {
/*		var options = {
			host: 'api.github.com',
			headers: {
				//'Authorization':' Basic bWFwbGVmdTA2MDI6OW9sLilQOj8=',
				'user-agent':'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)',	
				//'Content-Type ' : 'application/json; charset=utf-8'
				'Authorization' : this.authBasic(Params.Username, Params.Password)
			}
		};

		['/user/repos'].forEach(function(path) {
			options.path = path;

			https.get(options, function(res) {
				var data = '';
				res.on('data', function(d) {

					data += d;
				});

				res.on('end', function() {
					console.log('=====================user/repos'+data);
					//console.log('got repos ----'+data);
				});
			}).on('error', function(err) {

				console.log('got repos error: ' + err);
			});
		});
*/
	},

	getGit : function(name, url) {
		console.log('doing.......'+url);
		var self = this;
		return function(exists) {
			console.log(name + ' exists ? '+exists);
			if(exists) {
				self.gitPull(name);
			} else {
				self.gitClone(url, name);
			}
		}
	},

	gitPull : function(name) {
		var cmd = util.format('git --git-dir=%s/.git checkout', name);
		console.log('----gitPull===' + cmd);
		exec(cmd, catchError);
		cmd = util.format('git --git-dir=%s/.git pull', name);
		console.log('----gitPull===' + cmd);
		exec(cmd, catchError);
		Params.res.jsonp({
			'info': 'checking out '+name
		});
	},

	gitClone : function(url, name) {
		var cmd = util.format('git clone %s %s', url, name);
		console.log('------gitClone---' + cmd);
		exec(cmd, catchError);
		Params.res.jsonp({
			'info': 'cloning '+name
		});
	},
};

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
module.exports = router;
