/* Written by Brian Lee & Sean Stephens */

var selected_menu = "main_title";
var selected_class = "";
var county_box = [];

// Menu Click
$(".menu_btn").click(function() {
	
	var whoami = $(this).attr("id");
	
	var class_name = $(this).attr("class");
	var temp = class_name.indexOf(' ');
	var whoami_class = class_name.substring(temp + 1);
	
	if (selected_menu === whoami) { return; }
	selected_menu = whoami;
	
	if (selected_class !== whoami_class) {
		$(".screen").fadeOut(0);
	}
	
	if (whoami_class === "sub") {
		if (whoami === "sub_birth") {
			init_birth();
		  $(".subject").fadeIn(0);
		} else if (whoami === "sub_unemp") {
			init_unemp();
		  $(".subject").fadeIn(0);
		} else if (whoami === "sub_income") {
			init_income();
		  $(".subject").fadeIn(0);
		}
		
		selected_class = "sub";
	}
	
	else if (whoami_class === "srch") {
		$("#srch_tab > li").attr("class","");
		$(".tab-content > div").attr("class","tab-pane fade");
		
		if (whoami === "srch_map") {
			$("#location").attr("class", "fade in active");
		}
		selected_class = "srch";
		$(".search").delay(1200).fadeIn(500);	
	}
});

function add_county(id, data) {
	
	if (!valid_chk(id)) { return; }
	
	county_box.push(id);
	box_set(data);
	
	$("#cbox_list > li").click(function(){
		var remove = $(this).attr("value");
		$(this).fadeOut(600);
		for (var i in county_box) {
			if (county_box[i] == remove) {
				county_box.splice(i,1);	
			}
		}
		remove = "";
		
		if (county_box.length == 0) { $("#cbox_msg").html("The list is empty."); }
	});
	box_msg();
}

function valid_chk(value) {
	var count = county_box.length;

	if (count >= 10) { alert("County Box is Full! \nYou can choose maximum 10 counties."); return false; }
	
	for (var i in county_box) {
		if (county_box[i] == value) {
			alert("The selected county already exists in the county box.");
			return false;
		}
	}
	return true;
}

function box_set(county_data) {
	$("#cbox_list > li").remove();
	for (var i in county_box) {
		$("#cbox_list").append("<li value='" + county_box[i] +"'>" + county_data[county_box[i]].key + "</li>");	
	}
}

function box_msg() {
	var count = county_box.length;
	var msg = "";
	
	if (count == 10) { msg = "Click on the county name you want to remove.<br><b><u>The list is full.</u></b>"; }
	else { msg = "Click on the county name you want to remove."; }

	$("#cbox_msg").html(msg);
}


// County Box Click
$("#menu_cbox").click(function(){
	var status = $("#cbox").attr("value");
	
	if (status === "close") {
		$("#cbox").fadeIn(800).animate({top:"100px", height:"600"},800).css({overflow:"auto"});
		$("#cbox").attr("value","open");
    init_cbox();
	}
	else {
		$("#cbox").animate({top:"30%", height:"40px"},800).fadeOut(800).css({overflow:"hidden"});
		$("#cbox").attr("value","close");
	}
});

$("#cbox_close").click(function(){
	$("#cbox").animate({strollTop:0});
	$("#cbox").animate({top:"30%", height:"40px"},800).fadeOut(800).css({overflow:"hidden"});
	$("#cbox").attr("value","close");
});

$(document).keyup(function(event){
	if(event.keyCode == 27) {
		$("#cbox").animate({top:"30%", height:"40px"},800).fadeOut(800).css({overflow:"hidden"});
		$("#cbox").attr("value","close");
	}
});

// Map Search
var width = 920, height = 600;
var path = d3.geo.path();
var zoomScale_1 = d3.behavior.zoom()
	.scaleExtent([1,10])
	.on("zoom", zoomControl_1);
	
var loc = d3.select("#search_map").append("g");

d3.json("ctrl/dat/us.json", function(topo) {
	d3.json("ctrl/dat/countycodes.json", function(county_data) {
		
		loc.selectAll("path")
			.data(topojson.feature(topo, topo.objects.counties).features)
			.enter().append("path")
			.attr({class:"srch_county", d:path})
			.attr("id", function(d){ return d.id; })
			.on("click", clicked_1)
			.call(zoomScale_1);
			
		loc.append("path")
			.datum(topojson.mesh(topo, topo.objects.land))
			.attr({class:"srch_us", d:path});
			
		loc.append("path")
			.datum(topojson.mesh(topo, topo.objects.states, function(a,b){ return a !== b; }))
			.attr({class:"srch_state", d:path});
			
		$(".srch_county").hover(function(){
			var cid = $(this).attr("id");
			var whereami = county_data[cid].key;

			$(this).css({fill:"hsl(205,74%,30%)"});
			
			$(document).mousemove(function(event){
				var text = whereami;
				
				var x = event.pageX + 20;
				var y = event.pageY + 20;
				
				$("#search_map_info").html(text);
				$("#search_map_info").css({display:"block", left:x, top:y});
			});
		}, function(){
			$(this).css({fill:"hsl(205,30%,70%)"});
			$("#search_map_info").fadeOut();
		});
		
		$(".srch_county").click(function(){
			var cid = $(this).attr("id");
			
			add_county(cid, county_data);
			$("#location > p").html("<b>" + county_data[cid].key + "</b> is added");
			$(this).attr("class","selected_county");
		});
	});
});

function zoomControl_1(){
	loc.attr({transform:"translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")"});
}

var centered_1;

function clicked_1(d){
	var x, y, k;	// x: center-x, y:center-y, k:zoom
	
	// If no path is selected
	if (d && centered_1 !== d) { // d can be omitted. 
		var center = path.centroid(d);	// centroid will extract the location of the center.
		x = center[0];	// center will have a [x-value, y-value] type.
		y = center[1];
		k = 6;			// zoom
		centered_1 = d;	// Temporarily will save the current position.
	}
	else {	// If a selected path is zoomed already
		x = width / 2;
		y = height / 2;
		k = 1;
		centered_1 = null;
	}
	
	loc.transition()
		.duration(500)
		.attr({transform:"translate(" + width / 2 + "," + height / 2 + ")scale(" + k + 
		") translate(" + -x + "," + -y + ")"});
	/*
	loc.selectAll("path")
		.classed("selected_county", centered_1 && function(d){ return d === centered_1; });*/
}
