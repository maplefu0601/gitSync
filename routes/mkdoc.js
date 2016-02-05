
var fs = require('fs');
var markdown = require('markdown').markdown;

var MarkDoc = function(req, res) {
	
	return {
	
		getDocContent : function(name, dataFolder, func) {
			
			var contentPlain = fs.readFileSync(dataFolder+'/'+name, 'utf8');
			var content = markdown.toHTML(contentPlain);

			if(func) {
				
				func(content);

			} else {
				return content;	
			}
		}
	};
};

var charEncodings = {
    "\t": "&nbsp;&nbsp;&nbsp;&nbsp;",
    " ": "&nbsp;",
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\n": "<br />",
    "\r": "<br />"
};

var space = /[\t ]/;
var noWidthSpace = "&#8203;";

function plainToHtml(text)
{
    text = (text || "") + "";  // make sure it is a string;
    text = text.replace(/\r\n/g, "\n");  // avoid adding two <br /> tags
    var html = "";
    var lastChar = "";
    for (var i in text)
    {
        var char = text[i];
        var charCode = text.charCodeAt(i);
        if (space.test(char) && !space.test(lastChar) && space.test(text[i + 1] || ""))
        {
            html += noWidthSpace;
        }
        html += char in charEncodings ? charEncodings[char] :
        charCode > 127 ? "&#" + charCode + ";" : char;
        lastChar = char;
    }
    return html;
}  

module.exports = MarkDoc;
