/**
 * Created by Dewan on 11/1/2015.
 */

var nodes = [];
var edges = [];
var reqds = [];
/*
 * Main Tasks:
 *   scanning nodes and edges from data.json and saving them in nodes and edges array.
 *   creating checkboxes for each node and then adding them in a label.
 */
d3.json("data.json", function (data) {
    var brainList = document.getElementById("brainlist");
    var i, chkBox, button, label = [];
    for (i = 0; i < data["nodes"].length; i++) {
        nodes[i] = data["nodes"][i];
        label[i] = document.createElement("label");
        label[i].innerHTML = '<input id="nodes[i]" type="checkbox" value="nodes[i]"><label for="nodes[i]">' + nodes[i] + '</label>';
        brainList.appendChild(label[i]);
        brainList.appendChild(document.createElement("br"));
    }

    button = document.getElementById("calculate");
    button.onclick = function () {
        d3.select("svg").remove();
        reqds = [];

        chkBox = document.getElementsByTagName('input');
        for (i = 0; i < label.length; i++) {
            if (chkBox[i].checked) {
                reqds.push(label[i].innerText);
            }
        }

        var result = test(nodes, edges, reqds);
        draw(result);
    }

    for (var j = 0; j < data["edges"].length; j++) {
        edges.push([]);
        edges[j].push(new Array(4));
        for (var k = 0; k < 4; k++) {
            if (data["edges"][j][3] === "macaca mulatta" || data["edges"][j][3] === "macaca fuscata") {
                edges[j][3] = "macaque";
            }
            else if (data["edges"][j][3] == "rattus norvegicus") {
                edges[j][3] = "Rat";
            }
            else {
                edges[j][k] = data["edges"][j][k];
            }
        }
    }
})

/*
 * Input:
 *  a: an array of nodes.
 *  b: an array of edges. an array of edges.  Each edge should be an object
 *         with 'from', 'to', 'weight', and 'species' fields, where 'from'
 *         and 'to' are nodes, 'weight' is a positive integer, and 'species'
 *         is the name of species between the connected nodes.
 *  c: an array of 'required' nodes (must be a subset of
 *            the above-mentioned array of nodes).
 */
function test(a, b, c) {
    b = b.map(function (e) {
        return {from: e[0], to: e[1], weight: e[2], species: e[3]};
    });

    var reverse_edges = b.map(function (e) {
        return {from: e.to, to: e.from, weight: e.weight, species: e.species};
    });

    b = b.concat(reverse_edges);

    var result = steiner(a, b, c);
    result = result.map(function (e) {
        return [e.from, e.to, e.weight, e.species];
    });

    console.log(result);
    console.log(reqds);

    return result;
}

/*
 * Input:
 *  nodes: an array of nodes (a node can be anything)
 *  edges: an array of edges.  Each edge should be an object
 *         with 'from', 'to', and 'weight' fields, where 'from'
 *         and 'to' are nodes and 'weight' is a positive integer.
 *         Additional metadata (e.g. species) can be stored in
 *         other fields.
 *  required: an array of 'required' nodes (must be a subset of
 *            the above-mentioned array of nodes).
 */
function steiner(nodes, edges, required) {
    var xnodes = [];
    var xedges = [];
    /*
     * Make copies of nodes and edges that can be annotated,
     * and annotate them.
     */
    function is_reqd(n) {
        for (var i = 0; i < required.length; i++) {
            if (required[i] === n) return true;
        }
        return false;
    }

    var reqds = 0;

    nodes.forEach(function (n) {
        var reqd = is_reqd(n);

        if (reqd)
            reqds++;

        var xnode = {
            node: n,
            reqd: reqd,
            outgoing: [],
            incoming: [],
            in_permanent_web: false,
            in_temporary_web: false,
            in_solution: false,
            in_first_component: false,
            witness: null,
            fifo: null
        };
        xnodes.push(xnode);
    });

    function get_xnode(n) {
        for (var i = 0; i < xnodes.length; i++) {
            if (xnodes[i].node === n) return xnodes[i];
        }
    }

    edges.forEach(function (e) {
        var xedge = {
            edge: e,
            from: get_xnode(e.from),
            to: get_xnode(e.to),
            weight: e.weight,
            species: e.species,
            in_solution: false,
            in_first_component: false
        };
        xedges.push(xedge);
        xedge.from.outgoing.push(xedge);
        xedge.to.incoming.push(xedge);
    });

    /*
     * Utility function for removing non-unique edges from our solution
     */
    function uniqueify(es) {
        var retval = [];
        es.forEach(function (e) {
            for (var j = 0; j < retval.length; j++) {
                if (retval[j].from === e.from && retval[j].to === e.to)
                    return;
            }
            retval.push(e);
        });
        return retval;
    }

    /*
     * Keep track of solution as set of edges.
     * We'll be finished when we've solved the right
     * number of required vertices (all of them) or
     * when we're no longer able to solve any more
     * (graph is disconnected).
     */
    var solved_reqds = 0;
    var soln = [];

    /*
     * Prepare to run N simultaneous breadth first searches,
     * one for each required node.  This means we'll need a
     * separate FIFO for each required node.  The FIFO will
     * contain points accessible from that node, along with
     * the paths needed to reach them, along with an "end-
     * weight" which forces an edge of weight W to go through
     * the queue W times.
     *
     * Note: ppath stands for "pointed path"
     */
    xnodes.forEach(function (n) {
        if (!n.reqd) return;
        //n.fifo = create_new_fifo();
        n.fifo = FIFO();
        var ppath = {point: n, path: [], endweight: 0};
        n.fifo.push(ppath);
    });

    /*
     * The main loop: N consecutive breadth first searches,
     * one for each required node.  Search for other required
     * nodes, or for "temporary" paths, or for "permanent" paths.
     * As this search proceeds, it forms "temporary" paths behind it.
     * Once the search is successful, the corresponding path becomes
     * "permanent".  Solution will be the union of such "permanent"
     * paths.
     */
    var i, fNonemptyFifo;
    while (solved_reqds < reqds) {
        /*
         * Let the breadth-first searching continue until
         * something is found or until exhaustion (exhaustion
         * will occur when all the unsolved required nodes
         * have empty FIFOs).
         */
        fNonemptyFifo = false;
        for (i = 0; i < xnodes.length; i++) {
            /*
             * For each i:  Carry out one step of the BFS
             * corresponding to the ith required node
             * (Unless that node is already on a "permanent"
             * path which means it's already solved)
             */
            var n = xnodes[i];
            if (!n.reqd)
                continue;
            if (n.fifo.isEmpty() || n.in_permanent_web)
                continue;

            fNonemptyFifo = true;
            var ppath = n.fifo.shift();

            /*
             * Edges with weight W are required to go through
             * the queue W times before they get acknowledged
             *
             * Note: ppath stands for "pointed path"
             */
            if (ppath.endweight > 1) {
                ppath.endweight--;
                n.fifo.push(ppath);
                continue;
            }
            var p = ppath.point;
            var path = ppath.path;

            /*
             * If temporary path from required node n meets required
             * node m (either directly, or by meeting a permanent path
             * spawned by m) then it solves n.  If the meeting was
             * direct, and m was not previously solved, then the path
             * solves m too.
             */
            if ((p.reqd && p !== n) || p.in_permanent_web) {
                soln = soln.concat(path);
                path.forEach(function (step) {
                    step.from.in_permanent_web = true;
                });
                if (p.in_permanent_web) {
                    solved_reqds++;
                }
                else {
                    p.in_permanent_web = true;
                    solved_reqds += 2;
                }
                continue;
            }
            /*
             * If a temporary path from required node n
             * indirectly meets required node m by meeting
             * a temporary path spawned by m, then the
             * union of the two temporary paths solves both
             * n and m.
             */
            if (p.in_temporary_web) {
                /*
                 * ...unless n=m in which case then the temporary
                 * path has collided with itself: stop growing it.
                 */
                if (p.witness.node === n) continue;
                var new_edges = path.concat(p.witness.path);
                soln = soln.concat(new_edges);
                new_edges.forEach(function (step) {
                    step.from.in_permanent_web = true;
                });
                if (!n.in_permanent_web && !p.witness.node.in_permanent_web) {
                    solved_reqds += 2;
                }
                else {
                    solved_reqds++;
                }
                p.in_permanent_web = true;
                continue;
            }
            p.in_temporary_web = true;
            p.witness = {node: n, path: path};
            var j;
            for (j = 0; j < p.outgoing.length; j++) {
                var outgoing = p.outgoing[j];
                new_path = path.concat([outgoing]);
                new_ppath = {point: outgoing.to, path: new_path, endweight: outgoing.weight};
                n.fifo.push(new_ppath);
            }
        }

        if (!fNonemptyFifo)
            break;
    }

    /*
     * If the result we get is not connected, try to
     * connect it:  this is kind of naive, we brute-force
     * try to connect the first component to the other
     * components and if we succeed, recurse and try again.
     * Needs improvement.
     */

    soln = connect(soln, xedges, xnodes);

    /*
     * Return the solution in terms of the original edges,
     * not the copies we made and scribbled annotations all over.
     */
    return uniqueify(soln).map(function (e) {
        return e.edge;
    });
}

/*
 * If the result we get is not connected, try to
 * connect it:  this is kind of naive, we brute-force
 * try to connect the first component to the other
 * components and if we succeed, recurse and try again.
 * Needs improvement. Connect algorithm makes annotations
 * in order to do its work. We use xedges and xnodes for
 * that because we don't want to "scribble annotations"
 * on the original objects which, at least in principle,
 * the library user might not want us to alter.
 */

function connect(soln, xedges, xnodes) {
    if (soln.length < 2) return soln;
    xedges.forEach(function (e) {
        e.in_solution = false;
        e.in_first_component = false;
    });
    xnodes.forEach(function (n) {
        n.in_solution = false;
        n.in_first_component = false;
    });
    soln.forEach(function (e) {
        e.from.in_solution = true;
        e.to.in_solution = true;
        e.in_solution = true;
    });

    function to_first_component(x) {
        x.from.in_first_component = true;
        x.to.in_first_component = true;
        x.in_first_component = true;
        var candidates = x.from.outgoing.concat(x.to.outgoing);
        candidates = candidates.concat(x.from.incoming).concat(x.to.incoming);
        candidates.forEach(function (c) {
            if (!c.in_solution) return;
            if (c.in_first_component) return;
            to_first_component(c);
        });
    }

    to_first_component(soln[0]);

    for (var i = 0; i < soln.length; i++) {
        if (!soln[i].in_first_component) break;
    }
    if (i === soln.length) return soln;

    //var fifo = create_new_fifo();
    var fifo = FIFO();

    xnodes.forEach(function (n) {
        n.witness = n.in_first_component;
        if (!n.in_first_component) return;
        n.outgoing.forEach(function (outgoing) {
            fifo.push({point: outgoing.to, path: [outgoing], endweight: outgoing.weight});
        });
    });

    while (!fifo.isEmpty()) {
        var ppath = fifo.shift();
        if (ppath.endweight > 1) {
            ppath.endweight--;
            fifo.push(ppath);
            continue;
        }
        var n = ppath.point;
        if (n.witness) continue;
        if (n.in_solution) {
            return connect(soln.concat(ppath.path), xedges, xnodes);
        }
        n.witness = true;
        n.outgoing.forEach(function (outgoing) {
            fifo.push({point: outgoing.to, path: [outgoing], endweight: outgoing.weight});
        });
    }

    return soln;
}

/*
 * D3 function to draw the required edges, i.e., connected brain regions
 */
function draw(result) {
    console.log("Hello");
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

    console.log("ndoe.append: ", nodes);
    console.log("ndoe.append: ", links);

    var g = document.getElementById("#svgVisualize"),
        width = window.innerWidth,
        height = window.innerHeight;

    var svg = d3.select("#svgVisualize").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")

    function updateWindow() {
        width = window.innerWidth;
        height = window.innerHeight;
        svg.attr("width", width).attr("height", height);
    }

    window.onresize = updateWindow;

    var color = d3.scale.category20();

    var force = d3.layout.force()
        .nodes(d3.values(nodes))
        .links(links)
        .size([width, height])
        .linkDistance(100)
        .charge(-1000)
        .on("tick", tick)
        .start();

    //build the arrow.
    //svg.append("svg:defs").selectAll("marker")
    //    .data(["end"])      // Different link/path types can be defined here
    //    .enter().append("svg:marker")    // This section adds in the arrows
    //    .attr("id", String)
    //    .attr("viewBox", "0 -5 10 10")
    //    .attr("refX", 15)
    //    .attr("refY", -1.5)
    //    .attr("markerWidth", 6)
    //    .attr("markerHeight", 6)
    //    .attr("orient", "auto")
    //    .append("svg:path")
    //    .attr("d", "M0,-5L10,0L0,5");

    //filter unique species from the result
    var species = [];
    var py = 20;

    for (var i = 0; i < result.length; i++) {
        species[i] = result[i][3];
    }

    species = species.filter(function (item, pos) {
        return species.indexOf(item) == pos;
    })

    // add the links and the arrows
    var path = svg.append("svg:g").selectAll("path")
        .data(force.links())
        .enter().append("svg:path")
        .attr("class", "link")
        .style("stroke", function (d) {
            for (var i = 0; i < species.length; i++) {
                if (d.species == species[i]) {
                    svg.append("text")
                        .style("font", "14px sans-serif")
                        .attr("stroke", color(d.species))
                        .attr("x", 10)
                        .attr("y", py)
                        .text(d.species)

                    //forward one step to get distinct color
                    color(d.species + 1);
                    py = py + 20;
                    species[i] = "";
                    break;
                }
            }

            return color(d.species);
        })
        .attr("marker-end", "url(#end)");

    // define the nodes
    var node = svg.selectAll(".node")
        .data(force.nodes())
        .enter().append("g")
        .attr("class", "node")
        .call(force.drag);

    // add the nodes
    node.append("circle")
        .attr("r", 5)
        .style("fill", function (d) {
            for (var i = 0; i < reqds.length; i++) {
                if (d.name === reqds[i]) {
                    return "red";
                }
            }
        })
        .style("r", function (d) {
            for (var i = 0; i < reqds.length; i++) {
                if (d.name === reqds[i]) {
                    return 8;
                }
            }
        });

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

            // Total difference in x and y from source to target
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y;

            // Length of path from center of source node to center of target node
            var dr = Math.sqrt(dx * dx + dy * dy);

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