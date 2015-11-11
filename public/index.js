/**
 * Created by Dewan on 11/1/2015.
 */

var d3 = require('d3');
var steiner = require('./steiner.js').appx_steiner;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var nodes = [];
var edges = [];
var reqds = [];

/*
 * Input:
 *  a: an array of nodes.
 *  b: an array of edges.
 *  c: an array of 'required' nodes (must be a subset of
 *            the above-mentioned array of nodes).
 */
function test(a,b,c) {
    b = b.map(function(e) {
        return {from:e[0], to:e[1], weight:e[2], species: e[3]};
    });

    reverse_edges = b.map(function (e) {
        return {from: e.to, to: e.from, weight: e.weight, species: e.species};
    });

    b = b.concat(reverse_edges);

    var result = steiner(a,b,c);
    console.log("\nEdges:");
    var counter = 0;
    result = result.map(function(e) {
        counter++;
        return [e.from, e.to, e.weight, e.species];
    });

    console.log("\nNumber of Edges: " + counter);

    var got = JSON.stringify(result);
    console.log("\nOUTPUT:\n" + got);
}

/*
 * D3 function to draw the required edges, i.e., connected brain regions
 */
function draw(result) {
    var links = [];
    for (var i = 0; i < result.length; i++) {
        links.push({
            source: result[i][0],
            target: result[i][1],
            weight: result[i][2],
            species: result[i][3]
        });
    }

    var nodes = {};

    // Compute the distinct nodes from the links.
    links.forEach(function (link) {
        link.source = nodes[link.source] ||
            (nodes[link.source] = {name: link.source});
        //console.log(link.source);

        link.target = nodes[link.target] ||
            (nodes[link.target] = {name: link.target});
        //console.log(link.target);
    });

    var width = 1200,
        height = 700;

    var color = d3.scale.category20();

    var force = d3.layout.force()
        .nodes(d3.values(nodes))
        .links(links)
        .size([width, height])
        .linkDistance(100)
        .charge(-1000)
        .on("tick", tick)
        .start();

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

    //add label of each species with unique color
    var p = 0;
    function speciesLabel(species, color, p) {
        if (species == "macaque") {
            svg.append("text")
                .attr("stroke", color)
                .attr("x", 10)
                .attr("y", p)
                .text(species)
        }
        if (species == "macaca mulatta") {
            svg.append("text")
                .attr("stroke", color)
                .attr("x", 10)
                .attr("y", p)
                .text(species)
        }
        if (species == "macaca fuscata") {
            svg.append("text")
                .attr("stroke", color)
                .attr("x", 10)
                .attr("y", p)
                .text(species)
        }
        if (species == "Homo sapiens") {
            svg.append("text")
                .attr("stroke", color)
                .attr("x", 10)
                .attr("y", p)
                .text(species)
        }
        if (species == "Birds") {
            svg.append("text")
                .attr("stroke", color)
                .attr("x", 10)
                .attr("y", p)
                .text(species)
        }
        if (species == "Rat") {
            svg.append("text")
                .attr("stroke", color)
                .attr("x", 10)
                .attr("y", p)
                .text(species)
        }
        if (species == "rattus norvegicus") {
            svg.append("text")
                .attr("stroke", color)
                .attr("x", 10)
                .attr("y", p)
                .text(species)
        }
    }

    // add the links and the arrows
    var path = svg.append("svg:g").selectAll("path")
        .data(force.links())
        .enter().append("svg:path")
        .attr("class", "link")
        .style("stroke", function (d) {
            console.log(d.species);
            console.log(color(d.species));

            p = p + 20;
            speciesLabel(d.species, color(d.species), p);

            return color(d.species);
        })
        .attr("marker-end", "url(#end)");

    // define the nodes
    var node = svg.selectAll(".node")
        .data(force.nodes())
        .enter().append("g")
        .attr("class", "node")
        .style("fill", function (d) {
            return color(d.group);
        })
        .call(force.drag);

    // add the nodes
    node.append("circle")
        .attr("r", 5);

    // add the text
    node.append("text")
        .attr("x", 12)
        .attr("dy", ".35em")
        .text(function (d) {
            return d.name;
        });

    // add the curvy lines
    function tick() {
        path.attr("d", function (d) {
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

        node.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    }
}

/*
 * Main Tasks:
 *   retrieving nodes and edges from data.json and saving them in nodes and edges array
 *   creating checkboxes for each node and then adding them in a label
 *   xmlhttp should be replaced with $.ajax call - later??
 */
var xmlhttp = new XMLHttpRequest();
xmlhttp.open("GET", "http://127.0.0.1:8081/data.json");
xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var data = JSON.parse(xmlhttp.responseText);
        var brainList = document.getElementById("brainlist");
        var count = 0;
        for (var i = 0; i < data["nodes"].length; i++) {
            nodes[i] = data["nodes"][i];
            var checkbox = document.createElement("input");
            checkbox.id = nodes[i];
            checkbox.type = "checkbox";

            var label = document.createElement("output");
            label.appendChild(document.createTextNode(checkbox.id));

            checkbox.onclick = function () {
                reqds[count] = this.id;
                count++;
            }

            var button = document.getElementById("calculate");
            button.onclick = function () {
                var result = test(nodes, edges, reqds);
                draw(result);
                console.log("REQUIRED NODES:\n" + reqds);
                console.log("\nNODES:\n" + nodes);
                console.log("\nEDGES:\n" + edges);
            }

            brainList.appendChild(checkbox);
            brainList.appendChild(label);
            brainList.appendChild(document.createElement("br"));
        }

        for (var j = 0; j < data["edges"].length; j++) {
            edges.push([]);
            edges[j].push(new Array(4));
            for (var k = 0; k < 4; k++) {
                edges[j][k] = data["edges"][j][k];
            }
        }
    }
}
xmlhttp.send();