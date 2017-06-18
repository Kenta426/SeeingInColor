// insert slider to the element id
var insertSlider = function(id){
  var svg = d3.select(id);

  var yearScale = d3.scaleLinear().domain([50, 500]).range([1967, 2016]);
  var posScale = d3.scaleLinear().domain([1967, 2016]).range([50, 500]);

  svg.append("line")
  .attr("x1", 50)
  .attr("x2", 500)
  .attr("y1", 40)
  .attr("y2", 40)
  .style("stroke", "#999999")
  .style("stroke-width", 5)
  .on('mouseenter', function(){
    d3.select("#circle").style("cursor", "pointer");
  })
  .on("click", function () {
  	d3.select("#circle").attr("x", Math.floor(posScale(yearScale(d3.mouse(this)[0]-10))));
  	d3.select("#slider_fill").attr("x2", d3.mouse(this)[0]);
    currentYear = Math.floor(yearScale(d3.mouse(this)[0]));
    YEAR = currentYear;
    d3.select("#current_year").text(YEAR);
    UpdateGraph(3,'');
  });

  svg.append("line")
  .attr("id", "slider_fill")
  .attr("x1", 50)
  .attr("x2", 500)
  .attr("y1", 40)
  .attr("y2", 40)
  .style("stroke", "#fd1c1c")
  .style("stroke-width", 5)
  .on("click", function () {
  	d3.select("#circle").attr("x", Math.floor(posScale(yearScale(d3.mouse(this)[0]-10))));
  	d3.select(this).attr("x2", d3.mouse(this)[0]);
    currentYear = Math.floor(yearScale(d3.mouse(this)[0]));
    YEAR = currentYear;
    d3.select("#current_year").text(YEAR);
    UpdateGraph(3,'');
  });

  var currentYear = 2016;

  var drag = d3.drag()
  .on("drag", function () {
    d3.select("#circle").style("cursor", "pointer");
  	if (d3.event.x >= 50 && d3.event.x <= 500) {
  		if (Math.floor(yearScale(d3.event.x)) != currentYear) {
        d3.select(this).attr("x", d3.event.x - 10);
    		d3.select("#slider_fill").attr("x2", d3.event.x);
  			currentYear = Math.floor(yearScale(d3.event.x));
  			YEAR = currentYear;
        d3.select("#current_year").text(YEAR);
        UpdateGraph(3,"");
  		}
  	}
  	else if (d3.event.x < 50) {
      console.log('s')
  		if (Math.floor(yearScale(50)) != currentYear) {
        d3.select(this).attr("x", 45);
    		d3.select("#slider_fill").attr("x2", 50);
  			currentYear = Math.floor(yearScale(50));
        YEAR = currentYear;
        d3.select("#current_year").text(YEAR);
        UpdateGraph(3,"");
  		}
  	}
  	else {
  		d3.select(this).attr("x", 490);
  		d3.select("#slider_fill").attr("x2", 500);

  		if (Math.floor(yearScale(500)) != currentYear) {
  			currentYear = Math.floor(yearScale(500));
        YEAR = currentYear;
        UpdateGraph(3,"");
        d3.select("#current_year").text(YEAR);
  		}
  	}
    var ticks = svg.selectAll('#year_ticks');
    ticks.style('opacity', function(d){
      var round_year = (Math.floor(YEAR / 10))*10;
      if (d.year == round_year){
        return 1;
      }
      else{
        return 0.6;
      }
    })
    .style('font-size', function(d){
      var round_year = (Math.floor(YEAR / 10))*10;
      if (d.year == round_year){
        return '12px';
      }
      else{
        return '10px';
      }
    });
  })
  .on("end", function(){
    d3.selectAll('#bkgrnd').style('stroke','none');
    d3.selectAll('.posters').data().forEach(function(d){d.clicked = false});
    getLargeImage('#big',[]);
    d3.selectAll('#info').remove();
    var Films =SearchFilms(YEAR, GENRE, COLOR, "dominant");
    var Films2 =SearchFilms(YEAR, GENRE, COLOR, "sub");
    getPosterImage('#dominant_posters', Films);
    getPosterImage('#sub_posters', Films2);
  });

  svg.append("rect")
  .attr("id", "circle")
  .attr('x', 490)
  .attr('y', 30)
  .attr('height', 20)
  .attr('width', 20)
  .attr("rx", 3)
  .attr("ry", 3)
  .style("fill", "#ffffff")
  .style("cursor", "pointer")
  .call(drag);

  var ticks = [{year:1970},{year:1980},{year:1990},{year:2000},{year:2010}];
  svg.selectAll('text').data(ticks).enter()
  .append('text')
  .attr('text-anchor', 'middle')
  .attr('alignment-baseline','central')
  .attr('x', function(d){return posScale(d.year)})
  .attr('y', 15)
  .attr('id', 'year_ticks')
  .style('fill', 'white')
  .style('font-size', '10px')
  .text(function(d){return d.year;})
  .attr('opacity', 0.6);

  svg.selectAll('#year_ticks')
  .style('opacity', function(d){
    var round_year = (Math.floor(YEAR / 10))*10;
    if (d.year == round_year){
      return 1;
    }
    else{
      return 0.6;
    }
  })
  .style('font-size', function(d){
    var round_year = (Math.floor(YEAR / 10))*10;
    if (d.year == round_year){
      return '12px';
    }
    else{
      return '10px';
    }
  });
};
