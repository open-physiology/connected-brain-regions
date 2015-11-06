/**
 * Created by Dewan on 11/1/2015.
 *
 * Connectivity among the nodes are taken from this example - http://bl.ocks.org/d3noob/5141528
 */
var nodes = [];
var edges = [];
var reqds = ['nucleus dorsolateralis anterior thalami pars lateralis',
    'abducens nucleus',
    'parietal area pg  medial part',
    'medial nucleus of the amygdala posterodorsal part sublayer c',
    'visual area v3',
    'middle temporal cortex (occipital)',
    'agranular area of temporal polar cortex',
    'intergeniculate leaflet of the lateral geniculate complex'];

<<<<<<< HEAD
//var reqds = [];

d3.json("data.json", function (data) {
    var brainList = document.getElementById("brainlist");
    var count = 0;
    for (var i = 0; i < data["nodes"].length; i++) {
        nodes[i] = data["nodes"][i];
        var checkbox = document.createElement("input");
        checkbox.id = nodes[i];
=======
d3.csv("force2.csv", function(error, links) {

    var nodes = {};

    // Compute the distinct nodes from the links.
    links.forEach(function(link) {
        link.source = nodes[link.source] ||
            (nodes[link.source] = {name: link.source});

        //console.log(link.source);
        link.target = nodes[link.target] ||
            (nodes[link.target] = {name: link.target});
        //console.log(link.target);

        //console.log(link.weight);
        link.weight = +link.weight;
    });

    console.log("Total Length: " + d3.values(nodes).length);
    for(var i = 0; i < d3.values(nodes).length; i++)
        console.log(d3.values(nodes)[i].name);

    // checkbox and button stuff
    var brainList = document.getElementById("brainlist");
    var i, button, checkbox, label;
    var list = [], count = 0;

    for (i = 0; i < d3.values(nodes).length; i++) {
        checkbox = document.createElement("input");
        checkbox.id = d3.values(nodes)[i].name;
>>>>>>> 03373b1091af2fd204fdda63f67028a7b4532b91
        checkbox.type = "checkbox";

        var label = document.createElement("output");
        label.appendChild(document.createTextNode(checkbox.id));

        //checkbox.onclick = function () {
        //    reqds[count] = this.id;
        //    count++;
        //}

        var button = document.getElementById("calculate");
        var graph = document.getElementById("graph");
        button.onclick = function () {
            //console.log("Button");
            for (i = 0; i < reqds.length; i++) {
                graph.appendChild(document.createTextNode(reqds[i]));
                graph.appendChild(document.createElement("br"));
            }
        }

        brainList.appendChild(checkbox);
        brainList.appendChild(label);
        brainList.appendChild(document.createElement("br"));
    }

<<<<<<< HEAD
    for (var j = 0; j < data["edges"].length; j++) {
        edges.push([]);
        edges[j].push(new Array(3));
        for (var k = 0; k < 3; k++) {
            edges[j][k] = data["edges"][j][k];
        }
=======
    //showing the graph
    var width = 1200,
        height = 700;

    var force = d3.layout.force()
        .nodes(d3.values(nodes))
        .links(links)
        .size([width, height])
        .linkDistance(60)
        .charge(-800)
        .on("tick", tick)
        .start();

    //var svg = d3.select('#svgVisualize');

    var svg = d3.select("#graph").append("svg")
        .attr("width", width)
        .attr("height", height);

    // build the arrow.
    svg.append("svg:defs").selectAll("marker")
        .data(["end"])      // Different link/path types can be defined here
        .enter().append("svg:marker")    // This section adds in the arrows
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

    // add the links and the arrows
    var path = svg.append("svg:g").selectAll("path")
        .data(force.links())
        .enter().append("svg:path")
        //    .attr("class", function(d) { return "link " + d.type; })
        .attr("class", "link")
        .attr("marker-end", "url(#end)");

    // define the nodes
    var node = svg.selectAll(".node")
        .data(force.nodes())
        .enter().append("g")
        .attr("class", "node")
        .call(force.drag);

    // add the nodes
    node.append("circle")
        .attr("r", 5);

    // add the text
    node.append("text")
        .attr("x", 12)
        .attr("dy", ".35em")
        .text(function(d) { return d.name; });

    // add the curvy lines
    function tick() {
        path.attr("d", function(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" +
                d.source.x + "," +
                d.source.y + "A" +
                dr + "," + dr + " 0 0,1 " +
                d.target.x + "," +
                d.target.y;
        });

        node.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")"; });
>>>>>>> 03373b1091af2fd204fdda63f67028a7b4532b91
    }
})