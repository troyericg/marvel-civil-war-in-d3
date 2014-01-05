<!--- hide script from old browsers

(function($, NS){

	var width = 970,
		height = 670,
		radius = Math.min(width, height) / 2,
		iRad = 90,
		increment = 50,
		oRad = iRad + increment; // 140;

	var svg = d3.select('#donut-chart')
		.append("svg")
			.attr({
				width: width,
				height: height
			})
		.append("g")
			.attr("transform", "translate(" + width/2 + "," + height/2 + ")");

	var pie = d3.layout.pie()
		.sort(null)
		.value(function(d){
			return 10;
		});

	var subDivider = function(collection, attrib, attrib_value) {
		var matched_items = collection.filter(function(item){
			return item[attrib] === attrib_value;
		});
		return matched_items;
	};

	var toTemplate = function(template, data){
		var content, 
			build;

		if (template[0] !== undefined) {
			try {
			content = Mustache.compile(template);
			build = content(data);
			return build;
			} catch(e) {
				console.log("Mustache Compile Error: " + e);
			}
		} else {
			console.log("Data Error");
		}
	};

	var tooltipOver = function() {
		var item = d3.select(this),
			stats = item[0][0].__data__.data || item[0][0].__data__,
			$tooltip = $("div#tooltip"),
			tooltipInfo;

		var	statsObj = {
			codename: stats.codename,
			realname: stats.realname,
			stance: function(){
				if (stats.antiregistration === "FALSE") {
					return "Pro-Registration";
				} else {
					return "Anti-Registration";
				};
			},
			alignment: stats.alignment,
			gender: function(){
				if(stats.gender === "M") {
					return "male";
				} else {
					return "female";
				}
			},
			image: function(){
				if(stats.haspicture === "TRUE") {
					return stats.pic_url;
				} else {
					return "http://troyericgriggs.com/projects/cwo/_files/images/CAPE-KILLERS.jpeg";
				};
			},
			status: stats.statusof
		};

		if (item[0][0].nodeName === "DIV" || item[0][0].nodeName === "rect") {
			tooltipInfo = toTemplate($("#tooltip-info").html(), statsObj);
		} else {
			tooltipInfo = toTemplate($("#tooltip-info").html(), statsObj);
		};

		
		$tooltip.empty().append(tooltipInfo);

		item.style({ "stroke": "black", "stroke-width": 3 });
		d3.select("#tooltip").style("display", "block");
	};

	var tooltipOut = function() {
		var item = d3.select(this);
		item.style({ "stroke": "white", "stroke-width": 1 });
		d3.select("#tooltip").style("display", "none").classed("mini", false);	
	};

	var tooltipMove = function() {
		var tooltip = d3.select("#tooltip"),
			coord = d3.mouse(this),
			isMini = tooltip.classed("mini"),
			addX = -45,
			addY = (isMini) ? -125 : -145;

		tooltip.style("left", coord[0] + addX + "px" );
		tooltip.style("top", coord[1] + addY + "px");
	};

	d3.csv("data/cwo.csv", function(error, data) {
		
		var set_list, rand_set, cur_set, attributes, fullDataLength = data.length;
		
		$("p.char-num.lower").find("span").text(fullDataLength);

		var sets = {
						supers: subDivider(data, "type", "superhuman"),
						mutants: subDivider(data, "type", "mutant"),
						mystics: subDivider(data, "type", "mystical"),
						humans: subDivider(data, "type", "human"),
					};

		var team_sets = {
							avengers: subDivider(data, "team", "Avengers"),
							x_force: subDivider(data, "team", "X-Force"),
							x_men: subDivider(data, "team", "X-Men"),
							omega_flight: subDivider(data, "team", "Omega Flight"),
							heroes_for_hire: subDivider(data, "team", "Heroes For Hire"),
							secret_avengers: subDivider(data, "team", "Secret Avengers"),
							young_avengers: subDivider(data, "team", "Young Avengers"),
							gla: subDivider(data, "team", "Great Lakes Champions"),
							rangers: subDivider(data, "team", "The Rangers"),
							initiative: subDivider(data, "team", "The Initiative"),
							shield: subDivider(data, "team", "S.H.I.E.L.D.")
						};

		var set_values = {
							stance: {   // 1st ring
										anti: "TRUE", 
										pro: "FALSE",
										colors: ["#bae4bc","#2ca25f"] // greens
									},
							alignment:{ // 2nd ring
										hero: "hero",
										villain: "villain",
										colors: ["#6baed6", "#3182bd"] // blues
									},
							gender: {   // 3rd ring
										male: "M", 
										female: "F",
										colors: ["#cbc9e2","#756bb1"] // purples
									},
							stat_of:{	// 4th ring
										active: "active", 
										captured: "captured", 
										deceased: "deceased",
										other: "other",
										colors: ["#fee5d9","#fb6a4a","#a50f15","black"] // reds and oranges
									}
						 };

		
		// fills in the color value for each category 
		var colorizeTypes = function(d, type){

			var data = d.data || d;

			switch(type){
				case "stance":
					if (data.antiregistration === set_values.stance.anti) {
						return set_values.stance.colors[0];
					} else {
						return set_values.stance.colors[1];
					};
				break;

				case "gender":
					if (data.gender === set_values.gender.male) {
						return set_values.gender.colors[0];
					} else {
						return set_values.gender.colors[1];
					};
				break;

				case "alignment":
					if (data.alignment === set_values.alignment.hero) {
						return set_values.alignment.colors[0];
					} else {
						return set_values.alignment.colors[1];
					};
				break;

				case "status":
					if (data.statusof === set_values.stat_of.active) {
						return set_values.stat_of.colors[0];
					} else if (data.statusof === set_values.stat_of.captured) {
						return set_values.stat_of.colors[1];
					} else if (data.statusof === set_values.stat_of.deceased) {
						return set_values.stat_of.colors[2];
					} else {
						return set_values.stat_of.colors[3];
					}
				break;

				default: 
				return "orange";
			};
		};
		
		// builds the donut charts, with specific data 
		var buildChart = function(data, type){

			var arc = d3.svg.arc()
				.innerRadius(iRad)
				.outerRadius(oRad);

			var g = svg.selectAll(".arc")
				.data(pie(data));
				
			g.enter().append("g")
					.attr("class", "arc");
			g.append("path")
				.attr("d", arc)
				.style({
					"fill": function(d){
						return colorizeTypes(d, type);
					},
					"stroke": "#fff"
				});
			g.exit();

			iRad += increment;
			oRad += increment;
		};

		
		// sets the current data set to use in chart builder
		set_list = ["supers","mutants","mystics","humans"];
		attributes = ["stance","alignment","gender","status"];
		rand_set = set_list[ Math.floor((Math.random()*4)) ];

		cur_set = sets[rand_set];
		d3.select("." + rand_set).classed("selected", true);

		var buildAllCharts = function(cur_data){
			iRad = 90,
			increment = 50,
			oRad = iRad + increment; // 140;

			// cycles attributes array and builds out the series of donut charts
			for(var i = 0, len = attributes.length; i < len; i++) {
				buildChart(cur_data, attributes[i]);
			};

			var buildOverChart = function(data){
				var oArc = d3.svg.arc()
					.innerRadius(90)
					.outerRadius(oRad-increment);

				var oG = svg.selectAll(".over-arc")
					.data(pie(data))
					oG.enter().append("g")
						.attr("class", "over-arc");
				oG.append("path")
					.attr("d", oArc)
					.style({
						"fill": "transparent",
						"stroke": "white",
						"stroke-width": 1
					});

				oG.exit();
				$("p.char-num.upper").find("span").text(data.length);
				console.log(fullDataLength);
			};

			// builds overlay chart for hover events 
			buildOverChart(cur_data);

			var overArcs = d3.selectAll(".over-arc").selectAll("path"),
				curArc;

			// overlay events
			d3.select("#main").on("mousemove", tooltipMove);
			overArcs.on("mouseover", tooltipOver)
					.on("mouseout", tooltipOut);
		};
		
		// init all ring charts 
		buildAllCharts(cur_set);

		// build chart color key
		var buildKey = (function(){
			var listItems, 
				cur_clr;

			for(var i=0, len=attributes.length; i<len; i++){
				var listItems = $("ul.color-list." + attributes[i]).find("li");

				$.each(listItems, function(j, item){
					cur_clr = colorizeTypes($(item).data(), attributes[i]);
					$(item).find("span").css("background-color", cur_clr);
				});
			}

			$("ul.color-list.grid").on("click", function(){

				var $this = $(this);
				var thisType = $this.data("type");

				d3.selectAll("rect")
				.style({
					"fill": function(d){
						return colorizeTypes(d, thisType);
					}
				});
				$("ul.color-list.grid").toggleClass("active", false);
				$this.toggleClass("active", true);
			});
		})();

		// sets up the functions that re-run the chart builder 
		var typeList = d3.select(".section-1").selectAll("li");

		typeList.on("click", function(d){
			var listItem = d3.select(this),
				ovArcs = d3.selectAll(".over-arc").selectAll("path");
				//console.log(listItem.attr("data-type"));
				
				typeList.classed("selected", false);
				d3.select(this).classed("selected", true);

				if ( sets[listItem.attr("data-type")] ) {
					d3.selectAll("path").remove();
					buildAllCharts(sets[listItem.attr("data-type")]);
				} else {
					ovArcs.style({ "stroke": "white", "stroke-width": 1 });
					var matched = ovArcs.filter(function(item){
						return d3.select(item)[0][0].data["statusof"] === listItem.attr("data-type");
					});
					console.log(matched.length);
				};
			});

		
		// reusable function for building down-page grids 
		var buildGridCharts = function(data, factor, id){
			var boxSize = 12;
			var margin = 0;

			data[0].id = id;
			data[0].count = data.length;
			var boxInfo = toTemplate($("#box-chart").html(), data[0]);
			$("#square-charts").append(boxInfo);

			var boxChrt = d3.select('#box-chart-' + data[0].id)
			.append("svg")
				.attr({
					width: 270,
					height: 60
				}).append("g")
				.attr("transform", "translate(" + 0 + "," + 10 + ")");

			boxChrt.selectAll("rect")
				.data(data)
				.enter().append("rect")
				.attr("width", boxSize)
				.attr("height", boxSize)
				.attr("transform", function(d,i) {
					return "translate(" + ((boxSize + 2)*(i%13) + 0) + "," + ((boxSize + 2)*Math.floor(i/13) + margin) + ")"
				})
				.style({
					"fill": function(d){
						return colorizeTypes(d, factor);
					},
					"stroke": "#fff"
				});

			var boxContainer = d3.select('#box-chart-' + data[0].id)
								.append("div")
								.attr("class", "box-container");
			
			boxContainer.selectAll("div")
				.data(data)
				.enter().append("div")
				.attr("class", "person")
				.style("background-image", function(d){
					if(d.haspicture === "TRUE") {
						return "url('" +d.pic_url+ "')";
					} else {
						return "url('http://troyericgriggs.com/projects/cwo/_files/images/CAPE-KILLERS.jpeg')";
					};
				});
		};

		// sets a unique chart ID and builds all down-page grids
		var chartID = 0;
		for(team in team_sets){
			buildGridCharts(team_sets[team], "stance" , chartID+=1);
		}


		var people = d3.selectAll(".person");
		people.on("mouseover", tooltipOver)
					.on("mouseout", tooltipOut);

		// governs highlights matching for down-page grids
		var squares = d3.select("#square-charts").selectAll("rect")
		var square, matched;

		squares.on("mouseover", function(){
			square = d3.select(this);
			var cname = square[0][0].__data__.codename;

			matched = $(".person").filter(function(){
				return $(this).get(0).__data__.codename === cname
			});
			square.style({ "stroke": "#000", "stroke-width": 3 });
			$(matched).addClass("highlight");
		}).on("mouseout", function(){ 
			square.style({ "stroke": "#fff", "stroke-width": 1 });
			$(matched).removeClass("highlight"); 
		});

		// unhooks nav 
		$(window).scroll(function() {
			var $win = $(this);
			var $nav = $('div#chart-nav');

			if (!$nav.hasClass("fixed") && ($win.scrollTop() + 10 > $nav.offset().top)) {
				$nav.addClass("fixed").data("top", $nav.offset().top);
			} else if ($nav.hasClass("fixed") && ($win.scrollTop() < $nav.data("top"))) {
				$nav.removeClass("fixed");
		}});

	});

})(jQuery, CivilWar = window.CivilWar || {});


// stop hiding script -->