/**
 * Created by Dewan on 11/1/2015.
 *
 * Connectivity among the nodes are taken from this example - http://bl.ocks.org/d3noob/5141528
 */

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
        checkbox.type = "checkbox";

        label = document.createElement("output");
        label.appendChild(document.createTextNode(checkbox.id));

        checkbox.onclick = function () {
            list[count] = this.id;
            count++;
        }

        button = document.getElementById("calculate");
        var graph = document.getElementById("graph");
        button.onclick = function () {
            for (i = 0; i < count; i++) {
                graph.appendChild(document.createTextNode(list[i]));
                graph.appendChild(document.createElement("br"));
                //console.log(list[i]);
            }
        }

        brainList.appendChild(checkbox);
        brainList.appendChild(label);
        brainList.appendChild(document.createElement("br"));
        //console.log(checkbox.id);
    }

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
    }
})