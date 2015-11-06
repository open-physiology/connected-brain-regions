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

        //checkbox.onclick = function () {
        //    reqds[count] = this.id;
        //    count++;
        //}

        var button = document.getElementById("calculate");
        var graph = document.getElementById("graph");
        button.onclick = function () {
            for (i = 0; i < reqds.length; i++) {
                graph.appendChild(document.createTextNode(reqds[i]));
                graph.appendChild(document.createElement("br"));
            }
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
