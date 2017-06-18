// callback for updating visualization
// type indicates if the button is for the genre shift or the visualization shift
var UpdateGraph = function(type, input){
  // genre
  if(type == 1){
    // update variable
    if (input == "All"){GENRE = "";}
    else{GENRE = input.toLowerCase();}
    d3.selectAll('#bkgrnd').style('stroke','none');
    d3.selectAll('.posters').data().forEach(function(d){d.clicked = false});
    getLargeImage('#big',[]);
    d3.selectAll('#info').remove();
    // update posters
    var Films =SearchFilms(YEAR, GENRE, COLOR, "dominant");
    var Films2 =SearchFilms(YEAR, GENRE, COLOR, "sub");
    getPosterImage('#dominant_posters', Films, 0);
    getPosterImage('#sub_posters', Films2, 0);
  }
  // visualization
  if (type == 0){
    // update variable
    if (input == "Heat Map"){ VIS = 'heat'; }
    if(input == 'Bubble Chart'){ VIS = 'bubble'; }
    if(input == 'Histogram'){ VIS = 'hist'; }
  }
  //update visualization
  if (VIS == 'hist'){ DrawHist(YEAR); }
  else if (VIS == 'bubble') { HeatBubble(YEAR); }
  else if (VIS == 'heat') { DrawHeatMap(YEAR);}
}

// insert buttons to the specified element
// genre input specifies the content of bottuns
// type input will be passed down to the update function
var insertButtons = function(id, genres, type){
	var svg = d3.select(id).append('svg')
  .attr('x', 0)
  .attr('y', 0)
	.attr('id', 'buttons')
	.attr('width', 900)
	.attr('height', 25);

	d3.selection.prototype.moveToFront = function() {
		return this.each(function () {
			this.parentNode.appendChild(this);
		});
	};

	var buttons = [];

  if(type == 1){
    genres.forEach(function (d, i) {
  		buttons.push({ genre: d, x: 100 * i, isActive: ((d == "All") ? true : false) });
  	});
  }
  else{
    genres.forEach(function (d, i) {
  		buttons.push({ genre: d, x: 100 * i, isActive: ((i == 0) ? true : false) });
  	});
  }

	var buttonGroup = svg.selectAll("g")
	.data(buttons)
	.enter().append("g")
  .attr('id', ('buttons' + type))
	.attr("transform", function (d) {
		return "translate(" + d.x + ", 0)";
	});

	function fillText (d) {
		if (d.isActive) return "#ffffff";
		return "#999999";
	}

	buttonGroup.append("rect")
	.attr("width", 100)
	.attr("height", 25)
  .attr('id', ('button' + type))
	.style("fill", function(d,i){
    if (type == 1){
      if (d.genre == 'All'){
        return "#fd1c1c";
      }
      else{
        return "none";
      }
    }
    else{
      if(i == 0){
        return "#fd1c1c";
      }
      else{
        return 'none';
      }
    }
  })
	.style("stroke", "#999999")
	.style("pointer-events", "visible")
	.style("cursor", "pointer")
	.on("mouseover", function (d, i) {
		d3.select(this).style("fill", function () {
			if (d.isActive) return "#fd1c1c";
			return "#4b4b53";
		});
		svg.select("#text_" +type+ i).style("fill", "#ffffff");
	})
	.on("mouseout", function (d, i) {
    if (d.isActive){
  		svg.select("#text_" + type+ i).style("fill", fillText(d));
    }
    else{
      d3.select(this).style("fill", "none");
  		svg.select("#text_" + type+ i).style("fill", fillText(d));
    }
	})
	.on("click", function (d, i) {
    if (type == 1){
      d3.selectAll('#buttons1').data().forEach(function(d){
        d.isActive = false;
      });
      d3.selectAll('#button1').style('fill', 'none');
      d3.select(this).style("fill", "#fd1c1c");

      d3.selectAll('#buttons1').selectAll('text').style('fill', "#999999");


      buttons.forEach(function (d, j) {
        d.isActive = ((i == j) ? true : false);
        svg.select("#text_" + type+j).style("fill", fillText(d));
      });
    }
    else{
      d3.selectAll('#button0').style('fill', 'none')
      d3.select(this).style("fill", "#fd1c1c");

      // svg.select("#stroke").attr("transform", "translate(" +
      //   d.x + ", 0)");
      // svg.select("#stroke").moveToFront();
      buttons.forEach(function (d, j) {
        d.isActive = ((i == j) ? true : false);
        svg.select("#text_" +type+ j).style("fill", fillText(d));
      });
    }
    UpdateGraph(type, d.genre);
	});

	buttonGroup.append("text")
	.attr("id", function (d, i) { return "text_" + type +i; })
	.attr("x", 50)
	.attr("y", 12.5)
	.attr("text-anchor", "middle")
	.attr("alignment-baseline", "middle")
	.attr("font-size", 12)
	.style("fill", function (d) { return fillText(d); })
	.text(function (d) { return d.genre; })
	.style("pointer-events", "none");

	d3.selectAll("#stroke").moveToFront();

};
