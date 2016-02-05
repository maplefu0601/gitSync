
var yaml = require('js-yaml'),
	fs = require('fs');

var Yaml = function(req, res) {

	var YamlFile = 'mkdocs.yml';

	return {
		
		getYaml: function(name, func) {
			
			var data = yaml.safeLoad(fs.readFileSync(name, 'utf8'));

			//data is an object already
			//console.log(data.site_name);
			if(func) {
				func(data);	
			}
		},

		getGdcDocYaml: function(name, dataFolder, func) {
		
			this.getYaml(dataFolder + '/' + YamlFile, func);
		},
	};
}

module.exports = Yaml;
