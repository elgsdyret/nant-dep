
var fs = require('fs');
var xml2js = require('xml2js');
var _ = require('underscore');
var parser = new xml2js.Parser();

var targetName = process.argv[2]; 
var buildFile = process.argv[3];

if (!targetName || !buildFile) 
	return console.error('please provide a target and a build file');

var readFile = function(buildFile, callback) {
	fs.readFile(buildFile, function(err, data) {    
		if (err)
			return callback(err, null);

	    parser.parseString(data, callback);	
	});
};

var findTarget = function(targetName, targets) {
	return _.find(targets, function(target) { return target.$.name == targetName });	
}

var addTarget = function(target, graph, targets) {
	var node = { name: target.$.name, children: []};
	graph.push(node);

	var depends = target.$.depends;
	if (depends) {
		depends.split(',').forEach(function(targetName) {
			var target = findTarget(targetName.trim(), targets);

			if (target) {
				addTarget(target, node.children, targets);
			}
		});
	}; 

	return graph;
}

var draw = function(graph, currentDepth) {
	var toLog = Array(currentDepth).join('-') + '>';
	graph.forEach(function(node) {
		console.log(toLog + ' ' + node.name);
		var newDepth = currentDepth + 1; 
		draw(node.children, newDepth);
	});
};

var drawGraph = function(targetName, buildFile) {
	readFile(buildFile, function(err, buildData) {
		if (err) {
			throw new Error('could not read the file', err);
		}
		
		var root =  findTarget(targetName, buildData.project.target);
		if (!root) {
			return console.error('target does not exist');
		}

		draw(addTarget(root, [], buildData.project.target), 1)
	});
};

drawGraph(targetName, buildFile);