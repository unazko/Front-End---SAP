	
	/**
	*	TODO:
	*	1) Export localdb to a file
	*	2) Import to localdb from a file
	**/
	"use strict";
	
	var doc_header = document.getElementsByTagName("header")[0];
	doc_header.setAttribute("alt", "Go back to the notes");
	
	var first_button = document.getElementsByTagName("button")[0];
	first_button.setAttribute("onclick", "export_localdb();");
	
	var second_button = document.getElementsByTagName("button")[1];
	second_button.setAttribute("onclick", "import_localdb();");

	
	function export_localdb() {
		
		var file_name = "exported.json";
		var file_content = JSON.stringify(localStorage);
		var blob = new Blob([file_content], {type: "text/json"});
		
		var a = document.createElement('a');
		//a.setAttribute('href','data:text/json;charset=utf-8,' + encodeURIComponent(file_content));
		a.href = window.URL.createObjectURL(blob);
		a.setAttribute('download', file_name);
		a.style.display = 'none';
		
		var container = document.getElementsByClassName("main")[0];
		container.appendChild(a);
		a.click();
		container.removeChild(a);
	}
	
	function import_localdb() {
		
		var import_input = document.getElementsByTagName("input")[0];
				
		if(typeof import_input.files[0] == "undefined") {
			window.alert("Please supply \"exported.json\" first in order to import.");
		} else {
			var file_name = import_input.files[0].name;
			if (file_name != "exported.json") {
				window.alert("The file should be named \"exported.json\". Please choose another file.");
			} else {				
				
				var reader = new FileReader();
				
				reader.onload = function() {									
					
					var storage = JSON.parse(reader.result);
										
					for(let obj_string in storage) {
						if(storage[obj_string] != "") {							
							var records_in_local_storage = localStorage.length;						
							localStorage.setItem(records_in_local_storage + 1, storage[obj_string]);
						}
					}
					window.alert("Notes are imported successfully!");
				}
				reader.readAsText(import_input.files[0], "UTF-8");
			}		
		}
	}
	