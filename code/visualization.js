// helper function for creating bins
var getDominantColorBin = function(row){
  var ColorBin = {
    data_id: "",
    hBin: 0,
    lBin:0
  };
  ColorBin.hBin = row.dominant_bin[0];
  ColorBin.lBin = row.dominant_bin[1];
  ColorBin.data_id = row.data_id;

  return ColorBin;
};
// helper function for creating bins
var getPaletteColorBin = function(row){
  var Bins = [];
  for(var i = 0; i < 6; i++){
    Bins.push({
      hBin : 0,
      lBin : 0,
      data_id: ""
    });
  };
  row.palette_bins.forEach(function(d,i){
    Bins[i].hBin = d[0];
    Bins[i].lBin = d[1];
    Bins[i].data_id = row.data_id;
  });
  return Bins;
}

// create an array of object for the heatmap
var getHeatMap = function(dominant, palette){
  // input will the 2 arrays of ColorBin
  // dictionary to save the result temporarily
  // count dominant
  var dominantdata = {};
  // count ids to check overlap
  var id = {};
  // count sub
  var subdata = {};
  for (var i = 0; i < HUEBIN; i ++){
      dominantdata[i] = {};
      id[i] = {};
      subdata[i] = {};
    for (var j = 0; j < LIGHTBIN; j ++){
      dominantdata[i][j] = 0;
      id[i][j] = [];
      subdata[i][j] = 0;
    }
  }
  // count dominant color by 1
  dominant.forEach(function(d){
    if( ! isNaN(d.hBin) ){
      if (! id[d.hBin][d.lBin].includes(d.data_id) ){
        dominantdata[d.hBin][d.lBin] += 1;
        id[d.hBin][d.lBin].push(d.data_id);
      }
    }
  });

  // count 1 color from the palette by 1
  palette.forEach(function(d){
    d.forEach(function(i){
      if(! isNaN(i.hBin)){
        if (! id[i.hBin][i.lBin].includes(i.data_id) ){
          subdata[i.hBin][i.lBin] += 1;
          id[i.hBin][i.lBin].push(i.data_id);
        }
      }
    })
  });
  // create the array of object
  ReturnData = [];
  for (var i = 0; i < HUEBIN; i ++){
    for (var j = 0; j < LIGHTBIN; j ++){
      // if the circle is already clicked
      if(i == CLICKED[0] && j == CLICKED[1]){
        ReturnData.push({
          x : i*XINTERVAL + 100,
          y : j*YINTERVAL + 100,
          clicked : true,
          hBin : i,
          lBin : j,
          dom : dominantdata[i][j],
          sub : subdata[i][j],
          tally : dominantdata[i][j] + subdata[i][j],
          ids : id[i][j]})
      }
      else{
        ReturnData.push({
          x : i*XINTERVAL + 100,
          y : j*YINTERVAL + 100,
          clicked : false,
          hBin : i,
          lBin : j,
          dom : dominantdata[i][j],
          sub : subdata[i][j],
          tally : dominantdata[i][j] + subdata[i][j],
          ids : id[i][j]})
      }
    }
  };
  return ReturnData;
};

// helper function for histogram
var CreateBins = function(data){
  // store count in dictionary
  var count_dict = {};
  // check overlaps
  var overlap = {};
  for (var i = 0; i < HUEBIN; i++){
    count_dict[i] = [];
    overlap[i] = [];
  }
  // count overlaps by checking ids
  data.forEach(function(d){
    var temp = count_dict[d.hBin];
    count_dict[d.hBin] = temp.concat(d.ids);
  });
  for (var i = 0; i < HUEBIN; i++){
    count_dict[i].forEach(function(d){
      if (! overlap[i].includes(d)){overlap[i].push(d);}
    });
  }
  // { hbin:  HUEbin of the data, x: position, freq: frequency, clicked: check if it's clicked}
  var result = [];
  for (var i = 0; i < HUEBIN; i++){
    result.push({
      hbin: i,
      x: i*XINTERVAL +30,
      freq: overlap[i].length,
      clicked: false
    });
  }
  return result;
}

// draw heat map of given year
var DrawHeatMap = function(year){
  // clean up svg
  d3.select('#legend').remove();
  d3.select('#title').remove();
  d3.selectAll('#label').remove();
  d3.select('#boundary').remove();

  // animation for the histogram
  var rects = d3.select("#heatmap").selectAll("#hist_rect");
  rects.transition().duration(500)
  .attr('height', 0)
  .attr('y', 220)
  .on('end', function(){rects.remove();});
  // collect data
  var row = src.filter(function(d){return d.year == year});
  if (GENRE.length != 0){
    if (GENRE == "animation"){
      row = row.filter(function(d){return d.genre.includes(GENRE) || d.genre.includes("family")});
    }
    else{row = row.filter(function(d){return d.genre.includes(GENRE)});}
  }
  // convert then into an appropriate form
  var bins = row.map(getDominantColorBin);
  var palette = row.map(getPaletteColorBin);

  // append circles
  var circles = d3.select("#heatmap").selectAll("circle").data(getHeatMap(bins, palette));
  circles.enter()
    .append("circle")
      .merge(circles)
      .transition().duration(500)
      .style("fill", function(d){
        return d3.hsl(d.hBin*(360/HUEBIN), 1, (d.lBin+0.5)/LIGHTBIN);
      })
      .attr('cx', function(d){
        return d.hBin * XINTERVAL + 30;
      })
      .attr('cy', function(d){
        return d.lBin * YINTERVAL + 30;
      })
      .attr("r", function(d){
        if (GENRE == ""){
          return HeatAllGenreScale(d.tally);
        }
        else{
          return HeatGenreScale(d.tally);
        }
      })
      .style('stroke-width', 3)
      .style('stroke', function(d){
        if (d.clicked){
          return "lime";
        }
        else{
          return 'none';
        }
      });

  // title of the graph
  var svg = d3.select("#canvas");
  var title = svg.append('text')
  .attr('text-anchor', 'middle')
  .attr('alignment-baseline','central')
  .attr('x', 300)
  .attr('y', 20)
  .attr('fill', 'white')
  .attr('id', 'title')
  .text('Poster Color Heat Map')
  .attr('opacity', 1);

  // legend circles
  var step;
  if (GENRE == ""){
    step = [{r:150}, {r:100}, {r:50}, {r:10}];
  }
  else{
    step = [{r:50}, {r:20}, {r:10}, {r:5}];
  }
  var legend = svg.append('g')
  .attr('id', 'legend')
  .attr('transform', 'translate(540,90)');
  // legend circle scale
  var legend_circles = legend.selectAll('circle').data(step).enter()
  .append('circle')
  .attr('cx', 0)
  .attr('cy', function(d,i){
    return i * 60;
  })
  .attr('r', function(d){
    if (GENRE == ""){
      return HeatAllGenreScale(d.r);
    }
    else{
      return HeatGenreScale(d.r);
    }
  })
  .attr('fill', 'none')
  .attr('stroke', 'white')
  .attr('stroke-opacity', 0.4);

  // legend text
  var legend_g = d3.select('#legend');
  var legend_texts = legend_g.selectAll('text').data(step).enter();
  legend_texts.append('text')
  .attr('text-anchor', 'middle')
  .attr('alignment-baseline','central')
  .attr('x', function(d){
    if (GENRE == ""){
      return HeatAllGenreScale(120) + 3;
    }
    else{
      return HeatGenreScale(20) + 4;
    }
  })
  .attr('y', function(d,i){ return i * 60 + 2; })
  .attr('fill', 'white')
  .text(function(d){ return d.r ; })
  .style('font-size', '10px')
  .attr('opacity', 1);

  legend_texts.append('text')
  .attr('text-anchor', 'middle')
  .attr('alignment-baseline','central')
  .attr('x', function(d){
    if (GENRE == ""){
      return HeatAllGenreScale(120) + 3;
    }
    else{
      return HeatGenreScale(20) + 4;
    }
  })
  .attr('y', function(d,i){ return i * 60 + 12; })
  .attr('fill', 'white')
  .text(function(d){ return ' movies'; })
  .style('font-size', '10px')
  .attr('opacity', 1);

  // boundary line
  svg.append('line')
  .attr('id', 'boundary')
  .attr('x1', 500)
  .attr('x2', 500)
  .attr('y1', 60)
  .attr('y2', 290)
  .attr('stroke', 'white')
  .attr('stroke-opacity', 0.4);

  // x-axis
  svg.append('text')
  .attr('text-anchor', 'middle')
  .attr('alignment-baseline','central')
  .attr('x', 300)
  .attr('y', 305)
  .attr('id', 'label')
  .attr('fill', 'white')
  .text('Hue')
  .attr('opacity', .8);

  // y-axis
  svg.append('g').attr('transform', 'translate(45,180)')
  .append('text')
  .attr('text-anchor', 'middle')
  .attr('alignment-baseline','central')
  .attr('x', 0)
  .attr('y', 0)
  .attr('id', 'label')
  .attr('fill', 'white')
  .attr('transform', 'rotate(-90)')
  .text('Lightness')
  .attr('opacity', .8);
};

// hover function for histogram
var HistHoverOn = function(d, coods, total){
  var svg = d3.select("#heatmap")
  .append('svg')
  .attr('x', coods[0]+10)
  .attr('y', coods[1]-10)
  .attr('id', 'blurb');
  svg.append('rect')
  .attr('id', 'info')
  .attr('x' , 0)
  .attr('y', 0)
  .attr('rx', 2)
  .attr('ry', 2)
  .attr('height', 30)
  .attr('width', 100)
  .style('fill', 'black')
  .style('opacity', 0.8)
  .style('stroke', 'black')
  .style('stroke-opacity', 1);

  svg.append('text')
  .attr('x', 12)
  .attr('y', 19)
  .text(function(){
    var percent = (Math.floor((d.freq/total)*1000))/10;
    return (d.freq) + " movies";
  })
  .attr('fill', 'white')
  .attr('font-size', '14px');
}

// Draw Hist
var DrawHist = function(year){
  // clean up svg
  d3.select('#legend').remove();
  d3.select('#title').remove();
  d3.selectAll('#label').remove();
  d3.select('#boundary').remove();
  // search movies
  var row = src.filter(function(d){return d.year == year});
  if (GENRE.length != 0){
    row = row.filter(function(d){return d.genre.includes(GENRE)});
  }
  // convert to appropriate forms
  var bins = row.map(getDominantColorBin);
  var palette = row.map(getPaletteColorBin);
  // first collapse the circles
  var circles = d3.select("#heatmap").selectAll("circle").data(getHeatMap(bins, palette));
  circles.enter()
    .append("circle")
      .merge(circles)
      .transition().duration(500)
      .attr("r", 0);
  // legends
  var svg = d3.select("#canvas");
  var step;
  if (GENRE == ""){
    step = [{y:10}, {y:100}, {y:150}, {y:1000}];
  }
  else if (GENRE == 'science fiction'){
    step = [{y:10}, {y:20}, {y:40}];
  }
  else{
    step = [{y:10}, {y:20}, {y:50}];
  }
  var legend = svg.append('g')
  .attr('id', 'legend')
  .attr('transform', 'translate(80,50)');
  // line for the legends
  var legend_line = legend.selectAll('line').data(step).enter()
  .append('line')
  .attr('x1', 0)
  .attr('y1', function(d){
    if (GENRE == ""){
      return 220 - HistAllGenreScale(d.y-1);
    }
    else{
      return 220 - HistGenreScale()(d.y-1);
    }
  })
  .attr('x2', 420)
  .attr('y2', function(d){
    if(GENRE == ""){
      return 220 - HistAllGenreScale(d.y-1);
    }
    else{
      return 220 - HistGenreScale()(d.y-1);
    }
  })
  .attr('stroke', 'white')
  .attr('stroke-opacity', 0.4);

  // then draw rect
  var bins = CreateBins(getHeatMap(bins, palette));
  var rects = d3.select("#heatmap").selectAll("rect").data(bins);
  var total = 0;
  // count frequency
  for (var i in bins){
    total += bins[i].freq;
  }
  rects.enter()
    .append("rect")
    .attr('x', function(d){
      return d.x - HISTWIDTH/2;
    })
    .attr('y', function(d){
      return 220;
    })
    .attr('width', HISTWIDTH)
    .attr('id', 'hist_rect')
    .style('fill', function(d){
      return d3.rgb(d3.hsl(d.hbin*(360/HUEBIN), 1, 0.5));
    })
    .on('mouseenter', function(d){
      if(d.clicked){
        d3.select(this)
        .attr('x', this.x.animVal.value - 3)
        .attr('y', this.y.animVal.value - 3)
        .attr('width', this.width.animVal.value + 6)
        .attr('height', this.height.animVal.value + 6)
        .style("stroke", "lime")
        .style("stroke-width", 3);
        HistHoverOn(d, d3.mouse(this), total);
      }
      else{
        d3.select(this)
        .attr('x', this.x.animVal.value - 3)
        .attr('y', this.y.animVal.value - 3)
        .attr('width', this.width.animVal.value + 6)
        .attr('height', this.height.animVal.value + 6)
        .style("stroke", "white")
        .style("stroke-width", 3);
        HistHoverOn(d, d3.mouse(this), total);
      }
    })
    .on('mouseout', function(d){
      if(d.clicked){
        d3.select(this)
        .attr('x', this.x.animVal.value + 3)
        .attr('y', this.y.animVal.value + 3)
        .attr('width', this.width.animVal.value - 6)
        .attr('height', this.height.animVal.value - 6)
        .style("stroke", "lime");
        CircleHoverOff();
      }
      else{
        d3.select(this)
        .attr('x', this.x.animVal.value + 3)
        .attr('y', this.y.animVal.value + 3)
        .attr('width', this.width.animVal.value - 6)
        .attr('height', this.height.animVal.value - 6)
        .style("stroke", "None");
        CircleHoverOff();
      }
    })
    .on('click', function(d){
      if(d.clicked){
        d.clicked = false;
        COLOR = [];
        d3.select(this)
        .style("stroke", "none");
      }
      else{
        COLOR = [d.hbin, 2];
        CLICKED = [d.hbin, 2];
        d3.selectAll('#hist_rect').style('stroke','none');
        d3.selectAll('#hist_rect').data().forEach(function(d){d.clicked = false});
        d.clicked = true;
        d3.select(this)
        .style("stroke", "lime")
        .style("stroke-width", 3);

      }
      // update display
      var Films =SearchFilmsHist(YEAR, GENRE, COLOR, "dominant");
      var Films2 =SearchFilmsHist(YEAR, GENRE, COLOR, "sub");
      getPosterImage('#dominant_posters', Films);
      getPosterImage('#sub_posters', Films2);
    })
    .style("opacity", 0.9)
      .merge(rects)
      .transition().duration(500)
      .attr('y', function(d){
        if (GENRE == ""){
          return 220 - HistAllGenreScale(d.freq);
        }
        else{
          return 220 - HistGenreScale()(d.freq);
        }
      })
      .attr("height", function(d){
        if (GENRE == ""){
          return HistAllGenreScale(d.freq);
        }
        else{
          return HistGenreScale()(d.freq);
        }
      });

  // title
  var title = svg.append('text')
  .attr('text-anchor', 'middle')
  .attr('alignment-baseline','central')
  .attr('x', 300)
  .attr('y', 20)
  .attr('fill', 'white')
  .attr('id', 'title')
  .text('Poster Color Histogram')
  .attr('opacity', 1);

  // legend text
  var legend_g = d3.select('#legend');
  var legend_texts = legend_g.selectAll('text').data(step).enter()
  .append('text')
  .attr('text-anchor', 'middle')
  .attr('alignment-baseline','central')
  .attr('x', 460)
  .attr('y', function(d){
    if (GENRE == ""){
      return 220 - HistAllGenreScale(d.y-1);
    }
    else{
      return 220 - HistGenreScale()(d.y-1);
    }
  })
  .attr('fill', 'white')
  .style('font-size', '10px')
  .text(function(d){ return d.y +' movies'; })
  .attr('opacity', 1);

  // x-axis
  svg.append('text')
  .attr('text-anchor', 'middle')
  .attr('alignment-baseline','central')
  .attr('x', 300)
  .attr('y', 305)
  .attr('id', 'label')
  .attr('fill', 'white')
  .text('Hue')
  .attr('opacity', .8);

  // y-axis
  svg.append('g').attr('transform', 'translate(45,180)')
  .append('text')
  .attr('text-anchor', 'middle')
  .attr('alignment-baseline','central')
  .attr('x', 0)
  .attr('y', 0)
  .attr('id', 'label')
  .attr('fill', 'white')
  .attr('transform', 'rotate(-90)')
  .text('Frequency')
  .attr('opacity', .8);
};

// draw bubble chart
var HeatBubble = function(year){
  // clean up svg
  d3.select('#legend').remove();
  d3.select('#title').remove();
  d3.selectAll('#label').remove();
  d3.select('#boundary').remove();
  // animation for the hist
  var rects = d3.select("#heatmap").selectAll("#hist_rect");
  rects.transition().duration(500)
  .attr('height', 0)
  .attr('y', 220)
  .on('end', function(){rects.remove();});

  // search movies
  var row = src.filter(function(d){return d.year == year});
  if (GENRE.length != 0){
    row = row.filter(function(d){return d.genre.includes(GENRE)});
  }
  // convert data
  var bins = row.map(getDominantColorBin);
  var palette = row.map(getPaletteColorBin);
  var temp_data = getHeatMap(bins, palette);

  var total=0;
  for(var i in temp_data){
    total += temp_data[i].tally;
  };
  var side;
  if (GENRE == ""){
    side = BubbleScale(total);
  }
  else{
    side = BubbleGenreScale(total);
  }
  // d3 pack to create the bubble chart
  var pack = d3.pack().size([side,side]);
  var root = d3.hierarchy({children: temp_data})
  .sum(function(d){return d.tally;}).sort(function(a,b){return b.data.tally - a.data.tally;})
  pack(root);
  root.children.map(function(d){
    d.data.x = d.x ;
    d.data.y = d.y ;
  });
  var new_data = [];
  root.children.map(function(d){
    new_data.push(d.data);
  });
  // sort data for the animation
  new_data.sort(function(x,y){
    var n = x.hBin - y.hBin;
    if (n !== 0) {
        return n;
    }
    return x.lBin - y.lBin;
  });

  // ugly part, hardcord to center the bubble chart
  var tuning = [];
  if (GENRE == ""){
    tuning = [110, -10];
  }
  else if (GENRE == "action"){
    tuning = [130, 15];
  }
  else if (GENRE == "animation"){
    tuning = [165, 50];
  }
  else if (GENRE == "comedy"){
    tuning = [115, 5];
  }
  else if (GENRE == "crime"){
    tuning = [150, 40];
  }
  else if (GENRE == "horror"){
    tuning = [150, 40];
  }
  else if (GENRE == "romance"){
    tuning = [150, 45];
  }
  else if (GENRE == "science fiction"){
    tuning = [160, 40];
  }
  else if (GENRE == "western"){
    tuning = [180, 80];
  };

  var circles = d3.select("#heatmap").selectAll("circle")
  .data(new_data);
  circles.enter()
    .append("circle")
    .merge(circles)
    .transition().duration(500)
    .style("fill", function(d){
      return d3.hsl(d.hBin*(360/HUEBIN), 1, (d.lBin+0.5)/LIGHTBIN);
    })
    .attr("cx", function(d){
      if (isNaN(d.x)){ return 180; }
      else{ return d.x + tuning[0]; }
    })
    .attr('cy', function(d){
      if (isNaN(d.y)){ return 80; }
      else{ return d.y + tuning[1]; }
    })
    .attr('r', function(d){
      if (GENRE == ""){
        return 2.75*Math.sqrt(d.tally);
      }
      else{
        return 4.4*Math.sqrt(d.tally);
      }
    })
    .style('stroke-width', 3)
    .style('stroke', function(d){
      if (d.clicked){
        return "lime";
      }
      else{
        return 'none';
      }
    });
  // title of the graph
  var svg = d3.select("#canvas");
  var title = svg.append('text')
  .attr('text-anchor', 'middle')
  .attr('alignment-baseline','central')
  .attr('x', 300)
  .attr('y', 20)
  .attr('fill', 'white')
  .attr('id', 'title')
  .text('Poster Color Bubble Chart')
  .attr('opacity', 1);

  // x-axis
  svg.append('text')
  .attr('text-anchor', 'middle')
  .attr('alignment-baseline','central')
  .attr('x', 300)
  .attr('y', 305)
  .attr('id', 'label')
  .attr('fill', 'white')
  .text(total + " posters found")
  .attr('opacity', .8);
}
