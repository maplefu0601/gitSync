var express = require('express');
var router = express.Router();
var https = require('https'),
	exec = require('child_process').exec,
	path = require('fs'),
	util = require('util'),
	config = require('../config.json'),
	Config = require('../config.js'),
	Yaml = require('./yaml.js'),
	MarkDoc = require('./mkdoc.js'),
	markdown = require('./markDown.js'),
	MkdocBook = require('./mkdocBook.js'),
	gitextend = require('./gitExtend.js'),
	//sleep = require('sleep'),
	events = require('events'),
	emitter = new events.EventEmitter();

var GitHubApi = gitextend.gitHubApi;
var GitHub = gitextend.gitHub;
var GitHubRepoHook = gitextend.gitHubRepoHook;
var GitHubUser = gitextend.gitHubUser;
var MarkDown = markdown;
var Folders = Config.folders();
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
router.get('/createHook', createHook);
function createHook(req, res) {
	var name = req.query.name;
	console.log('----create hook for----'+name);
	GitHubRepoHook(Params.Username, name).listHook(function(error, ret) {
		console.log("hooks list: "+JSON.stringify(ret));
		if(!ret || ret.length == 0) {
			options = {
				"name":"web",
				"active":true,
				"events":["push", "push_request"],
				"config":{
					"url":"http://54.69.251.157:6600/gitChanged?name="+name,
					"content_type":"json"
				}
			}
			GitHubRepoHook(Params.Username, name).createHook(options, function(error, hook) {
				console.log('created a new hook for: '+name+'\n'+hook);
			});
		}
	});
	res.jsonp({success:"ok"});
};

router.get('/deleteHook', deleteHook);
function deleteHook(req, res) {
	var name = req.query.name;
	console.log('----delete hook for----'+name);
	GitHubRepoHook(Params.Username, name).listHook(function(error, ret) {
		console.log("hooks list: "+JSON.stringify(ret));
		if(ret && ret.length) {
			var id = ret[0].id;

			GitHubRepoHook(Params.Username, name).deleteHook(id, function(error, hook) {
				console.log('deleted a new hook for: '+name+'\n'+hook);
			});
		}
	});
	res.jsonp({success:"ok"});
};

router.post('/createNewMkdocBook', doGitChangedSSH);
router.get('/createNewMkdocBook', doGitChangedSSH);

function getRepositoryFolderName(repoUrl) {
//src: git@bitbucket.org:Raymond_Fu/doc-demo.git
//des: git.bitbucket.org.Raymond_Fu.doc-demo.git
//src: git@github.com:maplefu/docFromJson.git 
//des: git.github.com.maplefu.docFromJson.git

return repoUrl.replace(/[@:\/]/g, '.');
	
}
//given repository url, could from git hub or bitbucket---git@bitbucket.org:jyamada/col.git
function doGitChangedSSH(req, res) {

	var gitRepoUrl = req.query.gitRepoUrl;
	
	//var name = gitRepoUrl.match(/\/(.*)\.git/);
	var name = getRepositoryFolderName(gitRepoUrl);
	req.query.name = name;
	console.log('query.name='+req.query.name);
	console.log("------git changed-------"+gitRepoUrl);
	Params.init(req, res);
	console.log('start.........'+name);	
	var dataFolder = Folders['gitFolder'];//config.gitdata.gitFolder;
	try {
		path.exists(dataFolder + name, new GitHub(req, res).getGit(dataFolder, name, gitRepoUrl, function(d) {
			var autoGenWeb = config.config.autoGenWebSite;
			
			if(autoGenWeb) {
				doGenerateHtml(req, res);
			}

			var autoGenPdf = config.config.autoCreatePdf;
			if(autoGenPdf) {
				doMarkdown(req, res);	
			}

			var autoGenBook = config.config.autoCreateBook;
			if(autoGenBook) {
				doYaml(req, res);	
			}
			res.end();
		}));
	} catch(err) {
		console.log('git change error: '+err);
	}
	//res.send('ok');
}


router.post('/gitchanged', doGitChanged);
router.get('/gitchanged', doGitChanged);
//not working now, can only work from '/createNewMkdocBook', unless the name was changed to full repository name
function doGitChanged(req, res) {
	var folder = req.query.name;
	console.log("------git changed-------"+folder);
	Params.init(req, res);
	GitHubUser.getRepos(folder, function(name, url) {
		console.log('start.........'+name);	
		var dataFolder = Folders['gitFolder'];//config.gitdata.gitFolder;
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

				var autoGenBook = config.config.autoCreateBook;
				if(autoGenBook) {
					doYaml(req, res);	
				}
			}));
		} catch(err) {
			console.log('git change error: '+err);
		}

	});
}

//not working now, can only work from '/createNewMkdocBook', unless the name was changed to full repository name
router.get('/markdown', doMarkdown);
function doMarkdown(req, res) {
	var name = req.query.name;
	var pdfFolder = Folders['destPath'] + name;//config.pdf.destPath + name;
	var dataFolder = Folder['gitFolder'] + name;//config.gitdata.gitFolder + name;
	console.log('-----markdown----from '+dataFolder+' to '+pdfFolder+' for '+name);
	Params.init(req, res);
	new MarkDown(req, res).convertToPdf(name, dataFolder, pdfFolder);

};

//not working now, can only work from '/createNewMkdocBook', unless the name was changed to full repository name
router.get('/generateHtml', doGenerateHtml);
function doGenerateHtml(req, res) {

	var name = req.query.name;
	var dataFolder = Folders['gitFoler'] + name;//config.gitdata.gitFolder + name;
	var htmlFolder = Folders['sitePath'] + name;//config.html.sitePath + name;

	console.log('generate site from '+dataFolder+' to '+htmlFolder+' for  '+name);

	new MarkDown(req, res).generateHtml(name, dataFolder, htmlFolder);
};

router.get('/saveConfig', function(req, res) {
	
	var value = req.query.value;

	Config.saveConfig(value);
});

router.get('/updateConfig', function(req, res) {
	
	var value = req.query.value;
	console.log(value);
	//console.log(JSON.stringify(JSON.parse(value)));

	Config.updateConfig(value);
	res.send(value);
});

router.get('/gdcdocs', function(req, res) {
	GitHubUser.getAllRepos(function(repos) {
		console.log(repos);
		res.render('gdcdocs', {
			yaml: [],
			repos: repos,
			linkWeb: '',
			linkPdf: ''
		});	
	});	
});

//not working now, can only work from '/createNewMkdocBook', unless the name was changed to full repository name
router.get('/getYaml', function(req, res) {
	doYaml(req, res);
});

function doYaml(req, res) {
	var repoUrl = req.query.gitRepoUrl;
	var name = req.query.name;
	var dataFolder = Folders['gitFolder'] + name;//config.gitdata.gitFolder + name;
	new Yaml(req, res).getGdcDocYaml(name, dataFolder, function(data) {
		console.log(data);
		new MkdocBook(req, res).refreshYamlBook(name, data, dataFolder, repoUrl);
	//	res.send(data);
		//res.end();
	});
};

router.get('/getMdContent', function(req, res) {
	var folderName = req.query.folder;
	var name = req.query.name;
	console.log('getting md file '+folderName + '/docs/'+ name);
	var dataFolder = Folders['gitFolder'] + folderName + '/docs';
	new MarkDoc(req, res).getDocContent(name, dataFolder, function(data) {
		//res.send(data);
		res.writeHead(200, {'Content-Type': 'text/html'});
		
		res.write(data);
		res.end();
		//res.send(data);
		//res.render('mkdocContent', {name: name, content: data});
	});
	
});

router.post('/updateMdContent', function(req, res) {
	console.log('------update------');
	
	var postData = '';

	req.on('data', function(data) {
		postData += data;	
	});

	req.on('end', function() {
		var bodyData = JSON.parse(postData);
		//console.log(bodyData);
		res.send('ok-success.');

		var mdName = bodyData.name;
		var mdData = bodyData.content;
		var bookFolder = bodyData.folder;
		var repoUrl = bodyData.repourl;
		var dataFolder = Folders['gitFolder'] + bookFolder + '/docs/';
		
		console.log(dataFolder+mdName);
		//console.log(mdData);
				
		path.writeFile(dataFolder+mdName, mdData, 'utf8', function(err) {
			if(err) {
				console.log('something error in writing file '+ dataFolder+'\n'+err);	
			} else {
				var cmd = util.format('cd %s && git commit %s -m"update content from book" && git push', dataFolder, mdName);
				console.log(cmd);
				exec(cmd, function(error, stdout, stderr) {
					console.log(stdout);	
				});
			}
		});
	});
});
/*
router.get('/getMdContent/:folder/:name', function(req, res) {
	var folderName = req.params.folder;
	var name = req.params.name;
	console.log('getting md file '+folderName + '/docs/'+ name);
	var dataFolder = config.gitdata.gitFolder + folderName + '/docs';
	new MarkDoc(req, res).getDocContent(name, dataFolder, function(data) {
		//res.send(data);
		res.render('mkdocContent', {name: name, content: data});
	});
	
});
*/
module.exports = router;

