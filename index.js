/**
 * Created by Dewan on 11/1/2015.
 */
var nodes = [];
var edges = [];
//var reqds = ['nucleus dorsolateralis anterior thalami pars lateralis',
//    'abducens nucleus',
//    'parietal area pg  medial part',
//    'medial nucleus of the amygdala posterodorsal part sublayer c',
//    'visual area v3',
//    'middle temporal cortex (occipital)',
//    'agranular area of temporal polar cortex',
//    'intergeniculate leaflet of the lateral geniculate complex'];
var reqds = [];

d3.json("data.json", function (data) {
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
        //var graph = document.getElementById("graph");
        button.onclick = function () {
            draw();
            console.log("REQUIRED NODES:\n" + reqds);
            console.log("\nNODES:\n" + nodes);
            console.log("\nEDGES:\n" + edges);

            //for (i = 0; i < reqds.length; i++) {
            //    graph.appendChild(document.createTextNode(reqds[i]));
            //    graph.appendChild(document.createElement("br"));
            //}
        }

        brainList.appendChild(checkbox);
        brainList.appendChild(label);
        brainList.appendChild(document.createElement("br"));
    }

    for (var j = 0; j < data["edges"].length; j++) {
        edges.push([]);
        edges[j].push(new Array(3));
        for (var k = 0; k < 3; k++) {
            edges[j][k] = data["edges"][j][k];
        }
    }
})

function draw() {

    var output = [
        ["parietal area pg  medial part", "area 7", 2],
        ["area 7", "area 23", 2],
        ["middle temporal cortex (occipital)", "lateral geniculate body", 1],
        ["lateral geniculate body", "visual area 1", 1],
        ["visual area 1", "visual area 2", 1],
        ["visual area 2", "area 23", 2],
        ["intergeniculate leaflet of the lateral geniculate complex", "precommissural nucleus", 5],
        ["medial nucleus of the amygdala posterodorsal part sublayer c", "precommissural nucleus", 5],
        ["agranular area of temporal polar cortex", "orbitofrontal area 13", 2],
        ["orbitofrontal area 13", "nucleus pulvinaris lateralis thalami", 2],
        ["visual area 1", "nucleus pulvinaris lateralis thalami", 2],
        ["nucleus dorsolateralis anterior thalami pars lateralis", "habenula", 7],
        ["habenula", "pallium", 7],
        ["pallium", "hippocampus", 7],
        ["hippocampus", "nucleus medialis dorsalis thalami", 2],
        ["orbitofrontal area 13", "nucleus medialis dorsalis thalami", 2],
        ["nucleus of the posterior commissure", "precommissural nucleus", 5],
        ["nucleus pulvinaris lateralis thalami", "nucleus of the posterior commissure", 2]
    ]

    var links = [];
    for (var i = 0; i < output.length; i++) {
        links.push({
            source: output[i][0],
            target: output[i][1],
            weight: output[i][2]
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

    //console.log(d3.values(nodes));
    //console.log(links);

    var force = d3.layout.force()
        .nodes(d3.values(nodes))
        .links(links)
        .size([width, height])
        .linkDistance(60)
        .charge(-800)
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