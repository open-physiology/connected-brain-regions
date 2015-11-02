/**
 * Created by dsar941 on 11/1/2015.
 */

//reading a json file from a webserver using http (example from w3schools), change it later
var brainList = document.getElementById("brainlist");
var xmlhttp = new XMLHttpRequest();
xmlhttp.open("GET", "data.json");
xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var data = JSON.parse(xmlhttp.responseText);
        var i, button, checkbox, label;
        var s = [], count = 0;;
        //console.log(data["nodes"].length);
        //console.log(data["edges"].length);
        for (i = 0; i < data["nodes"].length; i++) {
            checkbox = document.createElement("input");
            checkbox.id = data["nodes"][i];
            checkbox.type = "checkbox";

            label = document.createElement("output");
            label.appendChild(document.createTextNode(checkbox.id));

            checkbox.onclick = function(){
                s[count] = this.id;
                count++;
            }

            button = document.getElementById("calculate");
            var gdata = document.getElementById("graph");
            button.onclick = function () {
                for(i = 0; i < count; i++) {
                    gdata.appendChild(document.createTextNode(s[i]));
                    gdata.appendChild(document.createElement("br"));
                }
            }

            brainList.appendChild(checkbox);
            brainList.appendChild(label);
            brainList.appendChild(document.createElement("br"));
            //console.log(checkbox.id);
        }
    }
};
xmlhttp.send();