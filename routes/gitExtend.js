var https = require('https'),
    exec = require('child_process').exec,
    config = require('../config.json'),
    path = require('fs'),
    util = require('util'),
    events = require('events'),
    emitter = new events.EventEmitter();
  
    var GitHubApi = require("github-api");

function test() {
	return {
		a: function() {},
		b: function() {}
	}
}
console.log(test.a);
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

  var testHub = new GitHubApi({
      username : Params.Username,
      password : Params.Password,
      auth : "basic"
  });
  
/**
   * GitHubUser: to get user information from github
   * user: get user object
   * getRepos: get repository object
   * param repoName: name of repository
   * param func: callback function
   * author: Raymond Fu
   * date: 2016-01-28
   **/
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
                          console.log('name:' + name);
                          console.log('url:' + url);
  
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
 
 var GitHub = function(req, res) {
     Params.init(req, res);
     return {
     init : function(req, res) {
         this.req = req;
         this.res = res;
     },
 
     authBasic : function(user, pass) {
         return 'Basic ' + (new Buffer(user + ':' + pass)).toString('base64');
     },
 
     auth : function(user, pass) {
 /*      github.authenticate({
 
             type: "basic",
             username: user,
             password: pass
         });
 */  },
 
    getRepositories : function() {
 /*      var options = {
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
 
    getGit : function(folder, name, url) {
         console.log('doing.......'+url);
         var self = this;
         return function(exists) {
             console.log(name + ' exists ? '+exists);
             if(exists) {
                 self.gitPull(folder, name);
             } else {
                 self.gitClone(folder, url, name);
             }
         }
     },
 
     gitPull : function(folder, name) {
         var cmd = util.format('cd %s && git --git-dir=%s/.git checkout', folder, name);
         console.log('----gitPull===' + cmd);
         exec(cmd, catchError);
         cmd = util.format('cd %s && git fetch --all && git reset --hard origin/master', folder+name);
         console.log('----gitPull===' + cmd);
         exec(cmd, catchError);
         Params.res.jsonp({
             'info': 'checking out '+name
         });
     },
 
     gitClone : function(folder, url, name) {
         var cmd = util.format('cd %s && git clone %s %s', folder, url, name);
         console.log('------gitClone---' + cmd);
         exec(cmd, catchError);
         Params.res.jsonp({
             'info': 'cloning '+name
         });
     }
 
     }
 
 
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
 
 var GitExtend = {
     gitHubApi : GitHubApi,
     gitHub : GitHub,
     gitHubRepoHook : GitHubRepoHook,
     gitHubUser: GitHubUser
 };
 
 module.exports = GitExtend;
 
                                    

