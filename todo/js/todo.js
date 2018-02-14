	/**
	*	TODO:
	*	1)	 Drag and drop functionality for the notes
	**/
	"use strict";	
	
	/**
	*	Main thing I have to do is to copy all the created notes properties in order to recreate them
	*	next time i load the page with the help of add_item() and initial_layout() functions.
	*	I don't have to calculate placement of the notes because the initial_layout() knows how to place them.
	* 	
	*	0)Note properties I need:
	*		0.1)Color
	*		0.2)Title
	*		0.3)Text
	*		0.4)Scratch
	*		0.5)Other properties are by default in creation
	*	1)When I save information in the local storage I need:
	*		1.1) Completed notes with all of their properties
	*		1.2) Language settings
	*	2)I don't need to:
	*		2.1) Validate the notes
	**/
		
	/**
	*	The process should be something like this:
	*	In add_item() function I save the note properties from point 0) into the Web Storage
	*	Also when I am removing a note I need to remove those properties from Web Storage
	*	I have to think of some sort of container to hold the note properties (something like id for each note)
	*	Problem comes when editing note styles - i have even to get clicked note but what about id
	*	user can click on each note and edit it and i need to know what is that note id in order to save editions in the web storage
	* 	!!The idea is to add the unique id to each note as an attribute and then get this note on click therefore know the id
	*	Then I will create a function which will be called once when the site is loaded to recreate all the notes
	*	from the web Storage
	**/	
	
	/**
	*	How the recreating function can take notes properties for each note at a time
	*	and call add_item() with those properties
	*	One thing that comes in mind is to save those properties in one object like stringified jason
	*	and then execute JASON.parse(jason_string)
	*	So it will look like this "0" : "{ 'dasda': 'dsada', 'dsada': 'dasdas' }"
	*	In fact localStorage is kind of like an associative array
	*	and I will need some sort of indexes so i can make function to generate id (closure) so
	*	the id counter stays private and capsulated
	**/
	
	/** function to remove all Web Storage Data **/
	function test() {
		for(let i = 1; i <= 50; ++i) {
			localStorage.removeItem(i);
		}
	}	
	//test();

	/** I need global counter so i know from what value to start generating id **/
	var stored_notes = 0;
	
	if (typeof(Storage) !== "undefined") {
		stored_notes = localStorage.length;
	} else {
		window.alert("Your browser does not support web storage and notes cannot be saved!");
	}
	
	/** Function to generate unique id **/
	var get_note_id = (function() {
		var counter = stored_notes;
		return function() { return ++counter; }
	})();
	
	
	/** Function to generate note properties string **/
	function get_note_string(color_value, title_value, text_area_value, scratch_value) {

		var note_object = { color: color_value, title: title_value, text_area: text_area_value, scratch: scratch_value };		
		return JSON.stringify(note_object);
	}	
	
	const languages = { bulgarian: "data/bulgarian.json", english: "data/english.json"};
	
	var error_messages = [ "Title must be filled out.", "Note text must be filled out.", "Header is to long.", "The color you have choosen for the note is too dark. Dark colors are not suported. Be more optimistic :)", "In construction.", "Done"];
	
	function load_doc(doc_name) {
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
		
			if (this.readyState == 4 && this.status == 200) {
				var jason = (this.responseText);
				var lang_obj = JSON.parse(jason);
				change_language(lang_obj, doc_name);
			}
		};		
		xhttp.open("GET", doc_name, true);
		xhttp.send();
	}
	
	function change_language(lang_obj, doc_name) {
		
		var html = document.getElementsByTagName("html")[0];
		var language = html.getAttribute("lang");
		
		function switch_language() {
			if(doc_name == languages.english) {
				html.setAttribute("lang", "en");
			}
			if(doc_name == languages.bulgarian) {
				html.setAttribute("lang", "bg");
			}
			
			var title = document.getElementsByTagName("title")[0];
			title.innerHTML = lang_obj["title"];
			var header = document.getElementsByTagName("header")[0];
			header.innerHTML = lang_obj["header"];
			var label_one = document.getElementsByTagName("label")[0];
			var label_two = document.getElementsByTagName("label")[1];
			label_one.innerHTML = lang_obj["label_one"];
			label_two.innerHTML = lang_obj["label_two"];
			
			var input_in_form = document.getElementsByTagName("input");
			input_in_form[0].setAttribute("placeholder", lang_obj["input_title"]);
			
			var note_text = document.getElementsByTagName("textarea")[0];
			note_text.setAttribute("placeholder", lang_obj["input_note_text"]);
			
			input_in_form[1].setAttribute("value", lang_obj["done_button"]);
			
			error_messages[0] = lang_obj["title_not_filled"];
			error_messages[1] = lang_obj["text_not_filled"];
			error_messages[2] = lang_obj["title_too_long"];
			error_messages[3] = lang_obj["color_too_dark"];
			error_messages[4] = lang_obj["in_construction"];
			error_messages[5] = lang_obj["done_button"];
			
			var all_created_buttons = document.getElementsByClassName("language");
			
			for(let i = 0; i < all_created_buttons.length; ++i) {
				all_created_buttons[i].innerHTML = error_messages[5];
			}
		}
		
		if(language == "en" && doc_name != languages.english) {
			switch_language();
		}
		if(language == "bg" && doc_name != languages.bulgarian) {
			switch_language();
		}
	}

	function calculate_luma(color) {
		//https://stackoverflow.com/questions/12043187/how-to-check-if-hex-color-is-too-black
		color = color.substring(1);  		// strip #
		var rgb = parseInt(color, 16);		// convert rrggbb to decimal
		var r = (rgb >> 16) & 0xff;  		// extract red
		var g = (rgb >>  8) & 0xff;  		// extract green
		var b = (rgb >>  0) & 0xff;  		// extract blue
		
		var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
		return luma;
	}
	
	function validate_add_note_from() {
		var header_text = document.forms["add"]["note_header"].value;
		var note_text = document.forms["add"]["note_text"].value;
		var color = document.forms["add"]["pick_color"].value;
		
		var luma = calculate_luma(color);
		
		if(header_text == "") {
			window.alert(error_messages[0]);
		}
		else if(note_text == "") {
			window.alert(error_messages[1]);
		}
		else if(header_text.length > 40) {
			window.alert(error_messages[2]);
		} else if(luma < 40) {
			window.alert(error_messages[3]);
		}		
		else {
			add_item();
		}
	}
	
	function Point(width, height) {
		this.m_width = width;
		this.m_height = height;		
	}	
	
	function add_item_move_animation(item_to_animate, start_point, end_point) {
		
		var keyframes = '@keyframes item_move {' +
					'from { left:' + start_point.m_width + '; top:' + start_point.m_height + ';}' +
					'to { left:' + end_point.m_width + ';top:' + end_point.m_height + ';}' +
				'}' + 
				
		 '@-moz-keyframes item_move {' +
					'from { left:' + start_point.m_width + '; top:' + start_point.m_height + ';}' +
					'to { left:' + end_point.m_width + ';top:' + end_point.m_height + ';}' +
				'}' +
				
		 '@-webkit-keyframes item_move {' +
					'from { left:' + start_point.m_width + '; top:' + start_point.m_height + ';}' +
					'to { left:' + end_point.m_width + ';top:' + end_point.m_height + ';}' +
				'}' + 
				
		 '@-o-keyframes item_move {' +
					'from { left:' + start_point.m_width + '; top:' + start_point.m_height + ';}' +
					'to { left:' + end_point.m_width + ';top:' + end_point.m_height + ';}' +
				'}';
		
		var style_node = document.createElement('style');
		style_node.innerHTML = keyframes;
		document.getElementsByTagName('head')[0].appendChild(style_node);
			
		item_to_animate.classList.add("animation");
	}
	
	function hide_details(note) {
		/*for(let i = 3; i < note.childNodes.length; ++i) {
			note.childNodes[i].style.visibility = "hidden";
		}*/
	}	
	
	function show_details(note) {
		/*for(let i = 3; i < note.childNodes.length; ++i) {
			note.childNodes[i].style.visibility = "visible";
		}*/
	}
	
	function change_note_color(picker) {
		
		var color = picker.value;
		var luma = calculate_luma(color);
		
		if(luma < 40) {
			window.alert(error_messages[3]);
		} else {
			var note = picker.parentElement;
			var note_id = note.getAttribute("id");
			note.setAttribute("style", "background-color: " + color + ";");
			
			let note_header = note.childNodes[0];
			let note_text = note.childNodes[1];
			let note_scratch = note.childNodes[4];			
			
			let checkbox_value = (note_scratch.checked ? 1 : 0);		
			let currnet_note_jason_string = get_note_string(color, note_header.innerHTML, note_text.innerHTML, checkbox_value);
			
			//Saving current note properties into web storage
			if (typeof(Storage) !== "undefined") {
				localStorage.setItem(note_id, currnet_note_jason_string);
			} else {
				window.alert("Your browser does not support web storage and notes cannot be saved!");
			}
		}
	}
	
	///Here is the place to remove note id from the Web Storage and I am done BOBI
	///When I am deleting a note I just place empty  string on the 
	///note index and skip all empty values from local storage while recreating notes
	function delete_note(delete_icon) {	
		var note = delete_icon.parentElement;
		var note_id = note.getAttribute("id");
		var note_parent = note.parentElement;
		note_parent.removeChild(note);
		
		if (typeof(Storage) !== "undefined") {
			localStorage.setItem(note_id, "");
			
		} else {
			window.alert("Your browser does not support web storage and notes cannot be saved!");
		}
	}
	
	function scratch_task(scratch_box) {
		var note = scratch_box.parentElement;
		var note_id = note.getAttribute("id");
		
		let checkbox_value = (scratch_box.checked ? 1 : 0);
		
		if(checkbox_value) {
			note.childNodes[1].setAttribute("style", "text-decoration: line-through");
		} else {
			note.childNodes[1].setAttribute("style", "text-decoration: none");
		}
		/*
		0: header
		1: textarea
		2: done_button
		3: picker
		4: scratch
		5: delete_icon
		*/
		///save to web db
		let currnet_note_jason_string = get_note_string(note.childNodes[3].value, note.childNodes[0].innerHTML, note.childNodes[1].innerHTML, checkbox_value);
		
		if (typeof(Storage) !== "undefined") {
			localStorage.setItem(note_id, currnet_note_jason_string);
		} else {
			window.alert("Your browser does not support web storage and notes cannot be saved!");
		}
	}
	
	function done_edition(done_button) {
		
		var note = done_button.parentElement;
		var note_id = note.getAttribute("id");		
		done_button.style.visibility = "hidden";
		/*
		0: header
		1: textarea
		2: done_button
		3: picker
		4: scratch
		5: delete_icon
		*/
		var header_text = note.childNodes[0].value;
		var textarea_text = note.childNodes[1].value;
		
		if(typeof header_text !== "undefined") {
			///input header
			var new_header = document.createElement("div");		
			var herder_text_node = document.createTextNode(header_text);
			
			new_header.appendChild(herder_text_node);
			new_header.setAttribute("class", "note_header input");
			new_header.setAttribute("style", "font-weight: 700");
			new_header.setAttribute("onclick", "edit_title(this)");
			note.replaceChild(new_header, note.childNodes[0]);
			
			let checkbox_value = (note.childNodes[4].checked ? 1 : 0);		
			let currnet_note_jason_string = get_note_string(note.childNodes[3].value, note.childNodes[0].innerHTML, note.childNodes[1].innerHTML, checkbox_value);
			
			if (typeof(Storage) !== "undefined") {
				localStorage.setItem(note_id, currnet_note_jason_string);
			} else {
				window.alert("Your browser does not support web storage and notes cannot be saved!");
			}
		}
		
		if(typeof textarea_text !== "undefined") {
			///input text
			var text_wrapper = document.createElement("div");		
			var textarea_node = document.createTextNode(textarea_text);
			
			text_wrapper.setAttribute("class", "input");
			text_wrapper.setAttribute("onclick", "edit_textarea(this)");
			text_wrapper.appendChild(textarea_node);
			note.replaceChild(text_wrapper, note.childNodes[1]);
			
			if(note.childNodes[4].checked) {
				text_wrapper.setAttribute("style", "text-decoration: line-through;");
			} else {
				text_wrapper.setAttribute("style", "text-decoration: none;");
			}
			
			///save to local db
			let checkbox_value = (note.childNodes[4].checked ? 1 : 0);		
			let currnet_note_jason_string = get_note_string(note.childNodes[3].value, note.childNodes[0].innerHTML, note.childNodes[1].innerHTML, checkbox_value);
			
			if (typeof(Storage) !== "undefined") {
				localStorage.setItem(note_id, currnet_note_jason_string);
			} else {
				window.alert("Your browser does not support local storage and notes cannot be saved!");
			}
		}
	}
	
	function edit_title(header) {
		
		var note = header.parentElement;
		var color = note.childNodes[3].value;
				
		var done_button = note.childNodes[2];
		done_button.style.visibility = "visible";
		
		var header_text = header.innerHTML;
		
		var new_header = document.createElement("input");
		
		new_header.setAttribute("class", "note_header input");
		new_header.setAttribute("type", "text");	
		new_header.setAttribute("value", header_text);
		note.replaceChild(new_header, note.childNodes[0]);
	}
	
	function edit_textarea(textarea) {
	
		var note = textarea.parentElement;
		var color = note.childNodes[3].value;
		var done_button = note.childNodes[2];
		done_button.style.visibility = "visible";		
		
		var textarea_text = textarea.innerHTML;
		var text_wrapper = document.createElement("textarea");
		
		text_wrapper.setAttribute("rows", "1");
		text_wrapper.setAttribute("cols", "30");
		text_wrapper.setAttribute("class", "input textarea");
		
		if(note.childNodes[4].checked) {
			text_wrapper.setAttribute("style", "text-decoration: line-through;");
		} else {
			text_wrapper.setAttribute("style", "text-decoration: none;");
		}
		
		var textarea_node = document.createTextNode(textarea_text);
		text_wrapper.appendChild(textarea_node);
		note.replaceChild(text_wrapper, note.childNodes[1]);
	}
	
	function recreate_notes_from_localdb() {
		
		if (typeof(Storage) !== "undefined") {
			
			var stored_notes = localStorage.length;			
			
			for(let id = 1; id <= stored_notes; ++id) {				
				var json_note = localStorage.getItem(id);
				
				if(json_note != "") {
					var note = JSON.parse(json_note);							
					add_item(note, id);
				}			
			}
		} else {
			window.alert("Your browser does not support local storage and notes cannot be saved!");
		}		
	}
	
	function add_item(note = null, id = null) {

		if(note != null) {
			var obj_color = note.color;
			var obj_title = note.title;
			var obj_note_text = note.text_area;
			var obj_scratch = note.scratch;
		}
		
		var new_note = document.createElement("div");
		new_note.setAttribute("class", "note");
		//problem comes from here when i recreate the items i generate id as if i add more items not recreate old ones
		var note_id = (note != null ? id : get_note_id());
		new_note.setAttribute("id", note_id);
		new_note.setAttribute("onmouseenter", "show_details(this)");		
		new_note.setAttribute("onmouseleave", "hide_details(this)");			
		
		//input header
		var new_header = document.createElement("div");		
		//var header_text = document.forms["add"]["note_header"].value;
		var header_text = (note != null ? obj_title : document.forms["add"]["note_header"].value);
		var herder_text_node = document.createTextNode(header_text);
		
		new_header.appendChild(herder_text_node);
		new_header.setAttribute("class", "note_header input");		
		new_header.setAttribute("style", "font-weight: 700");	
		new_header.setAttribute("value", header_text);
		new_header.setAttribute("onclick", "edit_title(this)");
		new_note.appendChild(new_header);
		
		//input text
		//var note_text = document.forms["add"]["note_text"].value;
		var note_text = (note != null ? obj_note_text : document.forms["add"]["note_text"].value);
		var text_wrapper = document.createElement("div");		
		var textarea_node = document.createTextNode(note_text);
		
		text_wrapper.setAttribute("class", "input");
		text_wrapper.setAttribute("onclick", "edit_textarea(this)");
		text_wrapper.appendChild(textarea_node);
		new_note.appendChild(text_wrapper);
		
		//done editing button
		var new_done_button = document.createElement("button");
		var text_button_node = document.createTextNode(error_messages[5]);
		new_done_button.appendChild(text_button_node);
		new_done_button.setAttribute("class", "button button2 language");		
		new_done_button.setAttribute("type", "button");
		new_done_button.setAttribute("style", "visibility: hidden;");
		new_done_button.setAttribute("onclick", "done_edition(this)");
		new_note.appendChild(new_done_button);
		
		//color picker
		var new_color_picker = document.createElement("input");
		//var creation_color = document.forms["add"]["pick_color"].value;
		var creation_color = (note != null ? obj_color : document.forms["add"]["pick_color"].value);
		new_color_picker.setAttribute("type", "color");
		new_color_picker.setAttribute("class", "picker");
		new_color_picker.setAttribute("value", creation_color);
		//new_color_picker.setAttribute("style", "visibility: hidden;");
		new_color_picker.setAttribute("onchange", "change_note_color(this)");
		new_note.appendChild(new_color_picker);
		
		//checkbox scratch lines
		var new_show_status_node = document.createElement("input");
		new_show_status_node.setAttribute("type", "checkbox");
		new_show_status_node.setAttribute("class", "icon");
		if(note != null && obj_scratch == 1) {
			new_show_status_node.setAttribute("checked", "");
			new_note.childNodes[1].setAttribute("style", "text-decoration: line-through");
		}
		//new_show_status_node.setAttribute("style", "visibility: hidden;");
		new_show_status_node.setAttribute("onchange", "scratch_task(this)");
		new_note.appendChild(new_show_status_node);
		
		//delete note icon
		var new_delete_note_link = document.createElement("a");
		new_delete_note_link.setAttribute("class", "icon");
		var delete_note_icon = document.createElement("i");
		delete_note_icon.setAttribute("class", "fa fa-trash fa-1x");
		//new_delete_note_link.setAttribute("style", "visibility: hidden;");
		new_delete_note_link.setAttribute("onclick","delete_note(this)");
		new_delete_note_link.appendChild(delete_note_icon);
		new_note.appendChild(new_delete_note_link);

		change_form_color(new_note);
		
		var columns = document.getElementsByClassName("column");
		var column_count = columns.length;
						
		//Note is fully created and tuned up
		let checkbox_value = (new_show_status_node.checked ? 1 : 0);		
		let currnet_note_jason_string = get_note_string(new_color_picker.getAttribute("value"), new_header.getAttribute("value"), text_wrapper.innerHTML, checkbox_value);

		//Saving current note properties into local storage
		if (typeof(Storage) !== "undefined") {
			if(note == null) {
				localStorage.setItem(note_id, currnet_note_jason_string);
			}			
		} else {
			window.alert("Your browser does not support local storage and notes cannot be saved!");
		}
		
		//Logic to place the note in a column
		if(column_count == 0) {
			
			let margin = 5;
			
			//create new column and append
			let new_item_parent = document.createElement("div");
			new_item_parent.setAttribute("class", "column");
			
			let container = document.getElementsByClassName("container")[0];
			container.appendChild(new_item_parent);
			
			let animation_item = document.getElementsByClassName("note")[0];
			let start_point_width = animation_item.getBoundingClientRect().left - margin + 'px';
			let start_point_height = animation_item.getBoundingClientRect().top - margin + 'px';
			let start_point = new Point(start_point_width, start_point_height);
						
			new_item_parent.appendChild(new_note);
						
			let animated_item = new_item_parent.firstChild;
			let end_point_width = animated_item.getBoundingClientRect().left - margin + 'px';
			let end_point_heigth = animated_item.getBoundingClientRect().top - margin + 'px';
			let end_point = new Point(end_point_width, end_point_heigth);

			add_item_move_animation(animated_item, start_point, end_point);
			
			setTimeout(function() { animated_item.classList.remove("animation"); }, 1000);
			
		} else {
			
			let margin = 5;
			
			let item_parent;
			let column_intems_min_count = columns[0].childNodes.length;
			
			for(let i = 0; i < column_count; ++i) {
			
				if(column_intems_min_count >= columns[i].childNodes.length) {
					column_intems_min_count = columns[i].childNodes.length;
					item_parent = columns[i];
				}			
			}
			let animation_item = document.getElementsByClassName("note")[0];
			let start_point_width = animation_item.getBoundingClientRect().left - margin + 'px';
			let start_point_height = animation_item.getBoundingClientRect().top - margin + 'px';
			let start_point = new Point(start_point_width, start_point_height);
			
			item_parent.appendChild(new_note);
			initial_layout();
			
			let animated_item = item_parent.lastChild;
			let end_point_width = animated_item.getBoundingClientRect().left - margin + 'px';
			let end_point_heigth = animated_item.getBoundingClientRect().top - margin + 'px';
			let end_point = new Point(end_point_width, end_point_heigth);

			add_item_move_animation(animated_item, start_point, end_point);
			
			setTimeout(function() { animated_item.classList.remove("animation"); }, 1000);
		}
	}
	
	function change_form_color(item_to_change_color = null) {
		
		var color = (item_to_change_color!=null ? item_to_change_color.childNodes[3].value : document.forms["add"]["pick_color"].value);
		
		if(item_to_change_color != null) {
			item_to_change_color.setAttribute("style", "background-color: " + color + ";");
		} else {
			var form = document.getElementsByClassName("note")[0];
			form.setAttribute("style", "background-color: " + color + ";");
		}
	}
		
	function sum_and_average_data_object(columns, column_count) {
		
		var sum_of_elemets_count = 0;
		

		for(let i = 0; i < column_count; ++i) {
			sum_of_elemets_count += columns[i].childNodes.length;
		}	
		
		return { 	
					average: parseInt(sum_of_elemets_count / column_count),
					sum_of_elemets: sum_of_elemets_count,
				};
	}
	
	function move_single_node(source, destination) {
			
		if (source.childNodes.length > 0) {
			destination.appendChild(source.lastChild);			
		} 		
	}
	
	function remove_column(source) {
	
		let source_parent = document.getElementsByClassName("container")[0];
		source_parent.removeChild(source);
	}
	
	/**
	*	If the elements in a column are more then average we have to
	*	skip that column and not to put any more elements in it
	**/
	function distribute_nodes_left() {
		
		var columns = document.getElementsByClassName("column");
		var column_count = columns.length;
				
		for(let i = 0; i < column_count - 1; ++i) {

			if(columns[column_count - 1].childNodes.length == 0) {
				remove_column(columns[column_count - 1]);
				return;
			}
			
			if(columns[i].childNodes.length > sum_and_average_data_object(columns, column_count - 1).average) {
				continue;
			}
			
			let margin = 5;
			
			let animation_item = columns[column_count - 1].lastChild;
			let start_point_width = animation_item.getBoundingClientRect().left - margin + 'px';
			let start_point_height = animation_item.getBoundingClientRect().top - margin + 'px';
			let start_point = new Point(start_point_width, start_point_height);
			
			move_single_node(columns[column_count - 1], columns[i]);

			let animated_item = columns[i].lastChild;
			let end_point_width = animated_item.getBoundingClientRect().left - margin + 'px';
			let end_point_heigth = animated_item.getBoundingClientRect().top - margin + 'px';
			let end_point = new Point(end_point_width, end_point_heigth);

			add_item_move_animation(animation_item, start_point, end_point);
			
			setTimeout(function() { animated_item.classList.remove("animation"); }, 1000);
		}
	}
		
	function distribute_column_left() {
		
		var columns = document.getElementsByClassName("column");
		var column_count = columns.length;
			
		if(column_count == 1) {
			return;
		}
		
		//this loop can easily become infinite if average is with wrong value
		do {
			distribute_nodes_left();		
			var current_columns = document.getElementsByClassName("column");
			var current_column_count = current_columns.length;
			
		} while(column_count != current_column_count + 1);
	}
	
	
	
	function distribute_column_right() {
		
		var columns = document.getElementsByClassName("column");
		var column_count = columns.length;		
		var sum_of_elemets_count = sum_and_average_data_object(columns, column_count).sum_of_elemets;
		
		
		if(column_count < sum_of_elemets_count) {
			
			/**
			*	Create new flex-column and append at the end of the grid
			*	Appends an empty column - condition is wrong
			*	-----------------------------------------------
			**/
			let new_column = document.createElement("div");
			new_column.setAttribute("class", "column");
			
			let container = document.getElementsByClassName("container")[0];
			
			container.appendChild(new_column);
			
			var average_number_per_column = sum_and_average_data_object(columns, column_count + 1).average;
					
			for(let j = 0; j < column_count; ++j) {
											
				while(columns[j].childNodes.length > average_number_per_column && columns[column_count].childNodes.length < average_number_per_column) {											
					
					/** gathering coordinates **/
					let margin = 5;
					
					let animation_item = columns[j].lastChild;
					let start_point_width = animation_item.getBoundingClientRect().left - margin + 'px';
					let start_point_height = animation_item.getBoundingClientRect().top - margin + 'px';
					let start_point = new Point(start_point_width, start_point_height);
					
					/** the note moves as usual **/
					move_single_node(columns[j], columns[column_count]);
					
					let animated_item = columns[column_count].lastChild;
					let end_point_width = animated_item.getBoundingClientRect().left - margin + 'px';
					let end_point_heigth = animated_item.getBoundingClientRect().top - margin + 'px';
					let end_point = new Point(end_point_width, end_point_heigth);
					/** gathering coordinates **/
					
					add_item_move_animation(animation_item, start_point, end_point);
					
					setTimeout(function() { animated_item.classList.remove("animation"); }, 1000);
				}
			}
		}
	}
	
	function phone_resolution() {
		var browser_width = window.innerWidth
						|| document.documentElement.clientWidth
						|| document.body.clientWidth;
		
		var main = document.getElementsByClassName("main")[0];
		var menu = document.getElementsByClassName("menu")[0];
		var labels = document.getElementsByTagName("label");
		var label_one = labels[0];
		var label_two = labels[1];
		var header = document.getElementsByTagName("header")[0];
		var footer = document.getElementsByTagName("footer")[0];
		
		if(browser_width < 650) {
			
			label_one.firstChild.nodeValue = "";
			label_two.firstChild.nodeValue = "";
			menu.setAttribute("style", "width: 95px; top: 0px;");
			main.setAttribute("style", "margin-left: 125px;");
			header.setAttribute("style" , "display: none;");					
			footer.setAttribute("style" , "display: none;");					
		} else {

			label_one.firstChild.nodeValue = "Change language";
			label_two.firstChild.nodeValue = "Export/Import LocalDB";
			menu.setAttribute("style", "width: 160px;");
			main.setAttribute("style", "margin-left: 190px;");
			header.setAttribute("style" , "display: block;");			
			footer.setAttribute("style" , "display: block;");			
		}		
	}
	
	function initial_layout() {
				
		phone_resolution();
		
		var element_size = 500;
		var columns = document.getElementsByClassName("column");
		var column_count = columns.length;
		var sum_of_elemets_count = sum_and_average_data_object(columns, column_count).sum_of_elemets;	
		
		var browser_width = window.innerWidth
						|| document.documentElement.clientWidth
						|| document.body.clientWidth;				
		
		var display_column_count = parseInt(browser_width / element_size);
		
		if(display_column_count > sum_of_elemets_count) {
			display_column_count = sum_of_elemets_count;
		}
				
		if(display_column_count > column_count) {
			var add_remove_column_count = display_column_count - column_count;
			
			for(let i = 0; i < add_remove_column_count; ++i) {
		
				distribute_column_right();
			}
		} else {
			var add_remove_column_count = column_count - display_column_count;
			
			for(let i = 0; i < add_remove_column_count; ++i) {
		
				distribute_column_left();
			}
		}
	}
	recreate_notes_from_localdb();
	initial_layout();
	