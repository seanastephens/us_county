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
		$(".screen").fadeOut(1000);
	}
	
	if (whoami === "main_title") {
		$(".screen.front").fadeIn(1000);
		$("html, body").animate({scrollTop:55});
		selected_class = "main_title";
	}
	
	if (whoami_class === "sub") {
		if (whoami === "sub_birth") {
			$(".subject").fadeIn(1000);
			init_birth();
		} else if (whoami === "sub_unemp") {
			$(".subject").fadeIn(1000);
			init_unemp();
		} else if (whoami === "sub_income") {
			$(".subject").fadeIn(1000);
			init_income();
		}
		
		selected_class = "sub";
	}
	
	else if (whoami_class === "srch") {
		$("#srch_tab > li").attr("class","");
		$(".tab-content > div").attr("class","tab-pane fade");
		
		if (whoami === "srch_cate") {	
			$("#srch_tab :nth-child(1)").attr("class","active");
			$(".tab-content div:nth-child(1)").attr("class", "tab-pane fade in active");
		}
		
		else if (whoami === "srch_name") {
			$("#srch_tab :nth-child(2)").attr("class","active");
			$(".tab-content div:nth-child(2)").attr("class", "tab-pane fade in active");
		}
		
		else if (whoami === "srch_map") {
			$("#srch_tab :nth-child(3)").attr("class","active");
			$(".tab-content div:nth-child(3)").attr("class", "tab-pane fade in active");
		}
		selected_class = "srch";
		$(".search").delay(1200).fadeIn(1000);	
	}
	
	else if (whoami_class === "abt1" || whoami_class === "abt2") {
		if (whoami === "abt_pj") {
			$(".about_pj").fadeIn(1000);
		}
		
		else if (whoami === "abt_dv") {
			$(".prf_img").css({left:"-200px"});
			$(".about_dv").fadeIn(1000);
			$(".prf_img").animate({left:"0px"},1500);
		}
		selected_class = "abt";
	}
});


// Category Search
$(".loc.level_1 > li").attr("class","lv1 not_chosen");
$(".loc > li").hover(function(){
		$(this).css({opacity:"0.7"});
	},function(){
		$(this).css({opacity:"1"});
});

$(".lv1.not_chosen").click(function(){
	level_1($(this));
});

function level_1(element) {
	
	var selected = element.attr("value");
	element.attr("class", "lv1 chosen");
	$(".not_chosen").animate({"width":0}, 600).hide(600);
	
	if (selected === "w") {
		$(".loc.level_2").append("<li value='pc'>Pacific</li><li value='mt'>Mountain</li>");
	}
	else if (selected === "m") {
		$(".loc.level_2").append("<li value='wn'>West North Central</li><li value='en'>East North Central</li>");
	}
	else if (selected === "n") {
		$(".loc.level_2").append("<li value='ma'>Middle Atlantic</li><li value='ne'>New England</li>");
	}
	else if (selected === "s") {
		$(".loc.level_2").append("<li value='ws'>West South Central</li><li value='es'>East South Central</li><li value='sa'>South Atlantic</li>");
	}
	
	$(".loc.level_2").delay(600).slideDown(600);
	element.delay(1200).animate({padding:"10 0", opacity:"0.3"},600);
	$(".loc.level_2 > li").attr("class","lv2 not_chosen");
	
	$(".lv1.chosen").click(function(){
		re_select("lv1");
	});
	
	$(".lv2.not_chosen").click(function(){
		level_2($(this));
	});
}

function level_2(element) {
	var selected = element.attr("value");
	
	element.attr("class","lv2 chosen");
	$(".lv2.not_chosen").animate({width:"0"},600).hide(600);
	element.delay(1200).animate({padding:"10 0", opacity:"0.3"},600);
	
	$(".loc.level_3").delay(600).slideDown(600);
	
	var n = 0;
	var storage = [];
	var state_name = [];
	
	if (selected === "pc") { n = 5; storage = [2,6,15,41,53]; }
	else if (selected === "mt") { n = 8; storage = [4,8,16,32,35,49,56]; }
	else if (selected === "wn") { n = 7; storage = [19,20,27,29,31,38,46]; }
	else if (selected === "en") { n = 5; storage = [17,18,26,39,55]; }
	else if (selected === "ma") { n = 3; storage = [34,36,42]; }
	else if (selected === "ne") { n = 6; storage = [9,23,25,33,44,50]; }
	else if (selected === "ws") { n = 4; storage = [5,22,40,48]; }
	else if (selected === "es") { n = 4; storage = [1,21,28,47]; }
	else if (selected === "sa") { n = 9; storage = [10,11,12,13,24,37,45,51,54]; }
	
	d3.json("ctrl/dat/statecodes.json", function(state_data){
		d3.values(state_data).map(function(d){ 
			for (var i = 0; i < n; i++) {
				if (Number(d.code) == storage[i]) {
					state_name.push(d.name); 
				}
			}
		});
		
		for (var i = 0; i < n; i++) {
			$(".loc.level_3").append("<li value='" + storage[i] + "'" + ">" + state_name[i] + "</li>");
		}
		$(".loc.level_3 > li").attr("class","lv3 not_chosen");
		
		$(".lv1.chosen").click(function(){
			re_select("lv1");
		});
		
		$(".lv2.chosen").click(function(){
			re_select("lv2");
		});
		
		$(".lv3.not_chosen").click(function(){
			level_3($(this));
		});
	});	//	statecodes.json
}

function level_3() {
	var county_name = [];
	var county_code = [];

	$(".lv3.not_chosen").click(function(){
		var selected = $(this).attr("value");
		
		$(this).attr("class","lv3 chosen");
		$(".lv3.not_chosen").animate({width:"0"},600).hide(600);
		$(this).delay(1200).animate({padding:"10 0", opacity:"0.3"},600);
		
		$(".loc.level_4").delay(600).slideDown(600);
		
		d3.json("ctrl/dat/countycodes.json", function(county_data){
			var geocode_list = d3.keys(county_data);
			
			for (var i in geocode_list) {
				var temp = Math.floor(Number(geocode_list[i]) / 1000);

				if (selected == temp) {
					county_code.push(geocode_list[i]);
					county_name.push(county_data[geocode_list[i]].nice);
				}
			}
			
			for (var i in county_name) {
				$(".loc.level_4").append("<li value='" + county_code[i] + "'" + ">" + county_name[i] + "</li>");
			}
			$(".loc.level_4 > li").attr("class","lv4");

			$(".lv1.chosen").click(function(){
				re_select("lv1");
			});			
			$(".lv2.chosen").click(function(){
				re_select("lv2");
			});
			$(".lv3.chosen").click(function(){
				re_select("lv3");
			});
			
			$(".lv4").click(function(){
				var value = $(this).attr("value");
				add_county(value, county_data);
			});
		});
	});	// The End of Level 3 Click
}

function re_select(level) {
	var whoami = level;
	
	if (whoami == "lv1") {
		$(".lv1").attr("class","lv1 not_chosen");
		$(".level_2, .level_3, .level_4").fadeOut(600);
		$(".level_2, .level_3, .level_4").children().remove();
		$(".lv1").animate({width:"200", padding:"60 0", opacity:"1"}).fadeIn(600);
		
		$(".lv1.not_chosen").click(function(){
			level_1($(this));
		});
	}
	else if (whoami == "lv2") {
		$(".lv2").attr("class","lv2 not_chosen");
		$(".level_3, .level_4").fadeOut(600);
		$(".level_3, .level_4").children().remove();	
		$(".lv2").animate({width:"200", padding:"60 0", opacity:"1"}).fadeIn(600);
	}
	else if (whoami == "lv3") {
		$(".lv3").attr("class","lv3 not_chosen");
		$(".level_4").fadeOut(600);
		$(".level_4").children().remove();	
		$(".lv3").animate({width:"200", padding:"60 0", opacity:"1"}).fadeIn(600);
	}
}

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

// County Name Search
angular.module("app", []).controller("name_ctrl", function($scope){
	d3.json("ctrl/dat/countycodes.json", function(county_data) {
		var id_list = d3.keys(county_data);
		var county_list = d3.values(county_data);
		county_name_list = county_list.map(function(d){
			return d.key;
		});

		$scope.arr = county_name_list;
		$("#select").click(cl());
		
		$("input").keypress(function(event){
			if(event.keyCode == 13) {
				cl();
			}
		});
		function cl() {
			$("#name_msg").text("");
			var name = $("#county_search").val();
			
			for (var i in county_data) {
				if (county_data[i].key.toLowerCase() == name.toLowerCase()) {
					add_county(i, county_data);
					$("#name_msg").html("<b>" + county_data[i].key + "</b> is added");
					$("#county_search").val("");
				}
			}
		}		
	});
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
