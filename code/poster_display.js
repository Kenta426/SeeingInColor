// call back function to add info of the movie
var MovieInfo = function(data){
  d3.selectAll('#info').remove();
  var frame = d3.select('#big_info');
  var title = d3.select('#big_title');

  // wrapping title
  var shorttext2="";

  shorttext=data.title;
  shorttext2=data.title
  if (shorttext.length>18) {
    shorttext=shorttext.substring(0,15) + "...";
    shorttext2=shorttext2.substring(15,data.title.length)
  }
  else{
    shorttext2="";
  }

  title.append('text')
  .attr('x', 10)
  .attr('y', 15)
  .text(shorttext)
  .style('fill', 'white')
  .attr('id', 'info');

  title.append('text')
  .attr('x',10)
  .attr('y',35)
  .text(shorttext2)
  .style('fill','white')
  .attr('id','info');

  frame.append('text')
  .attr('x', 10)
  .attr('y', 15)
  .text('('+data.year+')')
  .style('fill', 'white')
  .style('font-size', '12px')
  .attr('id', 'info');

  data.genre.forEach(function(d,i){
    frame.append('text')
    .attr('x', 10)
    .attr('y', 45 + i*15)
    .text(d)
    .style('fill', 'white')
    .style('font-size', '12px')
    .attr('id', 'info');
  })

}

// function will fill in the svg rect with images and color information
var getPosterImage = function(svg, data){
  var tab = 0;
  d3.select(svg).selectAll('.posters').remove();
  var svg = d3.select(svg);
  var PosterForEach = [];
  for (var i = 0; i < data.length; i++){
    PosterForEach.push(i);
  }
  var containers = svg.selectAll('g').data(PosterForEach);
  containers.enter()
    .append('g')
    .attr('height',278)
    .attr('width', 150)
    .attr('transform', function(d){
      return 'translate('+ ((105 * d) + 40 - (105 * POSTERS* tab)) +',10), scale(0.6)';
    })
    .attr('id', function(d){
      return 'container' + d;
    })
    .attr('class', 'posters');

  // insert picture
  // padding of hue bin
  var containers = svg.selectAll('.posters').data(data).enter();

  // insert background padding with the same color with the bin
  containers.selectAll('#bkgrnd').remove();
  svg.selectAll('.posters').append('rect')
    .attr('height', 278)
    .attr('width', 170)
    .attr('x', 0)
    .attr('y', 0)
    .attr('id', 'bkgrnd')
    .style('fill', function(d){
       return d3.rgb(d3.hsl(d.dominant_bin[0]*(360/HUEBIN), 1, (d.dominant_bin[1]+0.2)/LIGHTBIN));
    })
    .style('opacity', 0.5);

  // insert image
  svg.selectAll('#poster_img').remove();
  svg.selectAll('.posters')
    .append("image")
    .attr("id", 'poster_img')
    .attr("xlink:href", function(d){
      return d.file_urls;
    })
    .attr("x", 10)
    .attr("y", 10);

  // insert dominant color rect
  svg.selectAll("#dominant_rect").remove();
  svg.selectAll('.posters')
    .append('rect')
    .attr('height', 30)
    .attr('width', 30)
    .attr('x', 10)
    .attr('y', 10)
    .attr('id', 'dominant_rect')
    .attr('transform','translate(0,230)')
    .style('fill', function(d){
      return d3.rgb(d.dominant_color[0], d.dominant_color[1], d.dominant_color[2]);
    })
    .style('stroke', 'white')
    .style('stroke-width', 0.5)
    .style('opacity', 1);

  // attach mouse event
  svg.selectAll('.posters')
  .on('click', function(d,i){
    d3.selectAll('#shade').transition().style('opacity', 0.5);
    if (d.clicked){
      d.clicked = false;
      d3.select(this).select('#bkgrnd')
      .style("stroke", "None");
      getLargeImage('#big',[]);
      d3.selectAll('#info').remove();
      d3.select(this).select('#shade').transition().style('opacity', 0);
    }
    else{
      d3.selectAll('#bkgrnd').style('stroke','none');
      d3.selectAll('.posters').data().forEach(function(d){d.clicked = false});
      d.clicked = true;
      d3.select(this).select('#bkgrnd')
      .style("stroke", "lime")
      .style("stroke-width", 4);
      getLargeImage('#big',[d]);
      MovieInfo(d);
      d3.select(this).select('#shade').transition().style('opacity', 0);
    }
  })
  .on('mouseover', function(d,i){
      d3.select(this).select('#shade').transition().style('opacity', 0);
    if(d.clicked){
      d3.select(this).style("cursor", "pointer");
    }
    else{
      d3.select(this).style("cursor", "pointer");
      d3.select(this).select('#bkgrnd')
      .style('stroke', 'white')
      .style('stroke-width', 4)
      .style('stroke-opacity', 1);
    }
    if ((i % POSTERS != 0) && ((i+1) % POSTERS != 0)){
      svg.select('#container' + i)
      .transition().attr('transform','translate('+  ((105 * i)-3.75 + 40- ( 105 * POSTERS* tab))  +','+ 3 +'), scale(0.65)');
    }
    else if (i % POSTERS == 0){
      svg.select('#container' + i)
      .transition().attr('transform','translate('+  (105 * i + 40- ( 105 * POSTERS* tab))  +','+ 3 +'), scale(0.65)');
    }
    else if (((i+1) % POSTERS == 0)){
      svg.select('#container' + i)
      .transition().attr('transform','translate('+  ((105 * i) - 8 + 40 - ( 105 * POSTERS* tab))  +','+ 3 +'), scale(0.65)');
    }

    PosterForEach.forEach(function(d){
      var g = svg.select('#container' + d);
      if(d < i){
        g.transition().
        attr('transform','translate(' + ((105 * d) - 6.75 + 40- ( 105 * POSTERS * tab)) + ','+ 10 +'), scale(0.6)');
      }
      else if(d>i){
        g.transition().
        attr('transform','translate(' + ((105 * d) + 6.75 + 40- ( 105 * POSTERS * tab)) + ','+ 10 +'), scale(0.6)');
      }
    })
  })
  .on('mouseout', function(d,i){
    d3.select(this).select('#shade').transition().style('opacity', 0.5);
    if(!d.clicked){
      d3.select(this).select('#bkgrnd')
      .style('stroke', 'none');
    }
    else{
      d3.select(this).select('#bkgrnd')
      .style('stroke', 'lime')
      .style('stroke-width', 4)
      .style('stroke-opacity', 1);
      d3.select(this).select('#shade').transition().style('opacity', 0);
    }
    PosterForEach.forEach(function(i){
      svg.select('#container' + i)
      .transition().attr('transform','translate('+  ((105 * i + 40) - (105 * POSTERS * tab) )+','+ 10 +'), scale(0.6)');
    })
  });

  // insert palette rect
  svg.selectAll('#palette_rect').remove();
  for (var i = 0; i < 6; i ++){
    svg.selectAll('.posters')
      .append('rect')
      .attr('height', 30)
      .attr('width', 18)
      .attr('x', 43 + i *20)
      .attr('y', 10)
      .attr('id', 'palette_rect')
      .attr('transform','translate(0,230)')
      .style('fill', function(d){
        return d3.rgb(d.palette[i][0], d.palette[i][1], d.palette[i][2]);
      })
      .style('stroke', 'white')
      .style('stroke-width', 0.5)
      .style('opacity', 1);
  }

  // shade
  svg.selectAll('.posters')
    .append('rect')
    .attr('height', 278)
    .attr('width', 170)
    .attr('x', 0)
    .attr('y', 0)
    .attr('id', 'shade')
    .style('fill', 'black')
    .style('opacity', .5);

  if (data.length == 0){
    svg.selectAll('.scroll').remove();
    svg.selectAll('.no_match').remove();
    svg.append('rect')
    .attr('x', 40)
    .attr('y', 10)
    .attr('height', 166)
    .attr('width', 315)
    .attr('class', 'no_match')
    .style('fill', 'white')
    .style('opacity', 0.05)

    svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline','central')
    .attr('x', 197)
    .attr('y', 88)
    .attr('fill', 'white')
    .attr('class', 'no_match')
    .text('No Posters Found')
    .attr('opacity', 0.8);
  }
  else{
    svg.selectAll('.no_match').remove();
    svg.selectAll('.scroll').remove();
  }


  svg.selectAll('.scroll').remove();

  // add scrolling
  var right_scroll = svg.append('rect')
  .attr('x', 354)
  .attr('y', 0)
  .attr('width', 38)
  .attr('height', 186)
  .attr('class', 'scroll')
  .style('fill', 'black')
  .style('opacity', 0.5)
  .style("cursor", "pointer")
  .style("visibility", function () {
    if (data.length <= POSTERS)
      return "hidden";
    return "visible";
  })
  .on('mouseenter', function(){
    d3.select(this).transition().style('opacity', 0.8);
    svg.select('#right_arrow').transition().style('opacity', 1);
  })
  .on('mouseout', function(){
    d3.select(this).transition().style('opacity', 0.5);
    svg.select('#right_arrow').transition().style('opacity', 0.2);
  });

  right_scroll.on('click', function(){
    tab += 1;
    PosterForEach.forEach(function(i){
      svg.select('#container' + i)
      .transition().attr('transform','translate('+  ((105 * i + 40) - (105 * POSTERS * tab)) +','+ 10 +'), scale(0.6)');
    });
    left_scroll.transition().style("visibility", "visible");
    left_arrow.transition().style("visibility", "visible");
  	d3.select(this)
  	.transition().style("visibility", function () {
  		if ((tab + 1) * POSTERS < data.length)
  			return "visible";
  		return "hidden";
  	});
    right_arrow.style("visibility", function () {
  		if ((tab + 1) * POSTERS < data.length)
  			return "visible";
  		return "hidden";
  	});
  });

  var left_scroll = svg.append('rect')
  .attr('x', 0)
  .attr('y', 0)
  .attr('width', 38)
  .attr('height', 186)
  .attr('class', 'scroll')
  .style('fill', 'black')
  .style('opacity', 0.5)
  .style("cursor", "pointer")
  .style("visibility", "hidden")
  .on('mouseenter', function(){
    d3.select(this).transition().style('opacity', 0.8);
    svg.select('#left_arrow').transition().style('opacity', 1);
  })
  .on('mouseout', function(){
    d3.select(this).transition().style('opacity', 0.5);
    svg.select('#left_arrow').transition().style('opacity', 0.2);
  });

  var left_arrow = svg.append('text')
  .attr('x', 18)
  .attr('y', 93)
  .attr('class', 'scroll')
  .attr('id', 'left_arrow')
  .style("text-anchor", "middle")
  .style("alignment-baseline", "middle")
  .text('<')
  .style('fill', 'white')
  .style('pointer-events', 'none')
  .style('opacity', .2)
  .style("visibility", "hidden");

  var right_arrow = svg.append('text')
  .attr('x', 375)
  .attr('y', 93)
  .attr('class', 'scroll')
  .attr('id', 'right_arrow')
  .style("text-anchor", "middle")
  .style("alignment-baseline", "middle")
  .text('>')
  .style('fill', 'white')
  .style('pointer-events', 'none')
  .style('opacity', 0.2)
  .style("visibility", function () {
    if (data.length <= POSTERS)
      return "hidden";
    return "visible";
  });

  left_scroll.on('click', function(){
    tab -= 1;
    PosterForEach.forEach(function(i){
      svg.select('#container' + i)
      .transition().attr('transform','translate('+  ((105 * i + 40) - (105 * POSTERS * tab)) +','+ 10 +'), scale(0.6)');
    })
    right_scroll.transition().style("visibility", function () {
  		if ((tab + 1) * POSTERS <= PosterForEach.length)
  			return "visible";
  		return "hidden";
  	});
    right_arrow.transition().style("visibility", function () {
  		if ((tab + 1) * POSTERS <= PosterForEach.length)
  			return "visible";
  		return "hidden";
  	});
    d3.select(this)
  	.transition().style("visibility", function () {
  		if (tab == 0)
  			return "hidden";
  		return "visible";
  	});
    left_arrow.transition().style("visibility", function () {
  		if (tab == 0)
  			return "hidden";
  		return "visible";
  	});
  });
};

var getLargeImage = function(svg, data){
  d3.select(svg).selectAll('.posters').remove();
  d3.select(svg).selectAll('.empty').remove();
  var svg = d3.select(svg);
  var PosterForEach = [];
  for (var i = 0; i < data.length; i++){
    PosterForEach.push(i);
  }
  var containers = svg.selectAll('g').data(PosterForEach);
  containers.enter()
    .append('g')
    .attr('height',278)
    .attr('width', 150)
    .attr('transform', function(d){
      return 'translate('+ (105 * d) +',0), scale(1.0)';
    })
    .attr('id', function(d){
      return 'container' + d;
    })
    .attr('class', 'posters');

  // insert picture
  // padding of hue bin
  var containers = svg.selectAll('.posters').data(data).enter();

  containers.selectAll('#bkgrnd').remove();
  svg.selectAll('.posters').append('rect')
    .attr('height', 278)
    .attr('width', 170)
    .attr('x', 0)
    .attr('y', 0)
    .attr('id', 'bkgrnd')
    .style('fill', function(d){
       return d3.rgb(d3.hsl(d.dominant_bin[0]*(360/HUEBIN), 1, (d.dominant_bin[1]+0.2)/LIGHTBIN));
    }).style('opacity', 0.5);

  svg.selectAll('#poster_img').remove();
  svg.selectAll('.posters')
    .append("image")
    .attr("id", 'poster_img')
    .attr("xlink:href", function(d){
      return d.file_urls;
    })
    .attr("x", 10)
    .attr("y", 10);

  // insert dominant color rect
  svg.selectAll("#dominant_rect").remove();
  svg.selectAll('.posters')
    .append('rect')
    .attr('height', 30)
    .attr('width', 30)
    .attr('x', 10)
    .attr('y', 10)
    .attr('id', 'dominant_rect')
    .attr('transform','translate(0,230)')
    .style('fill', function(d){
      return d3.rgb(d.dominant_color[0], d.dominant_color[1], d.dominant_color[2]);
    })
    .style('stroke', 'white')
    .style('stroke-width', 0.5)
    .style('opacity', 1);

  // insert palette rect
  svg.selectAll('#palette_rect').remove();
  for (var i = 0; i < 6; i ++){
    svg.selectAll('.posters')
      .append('rect')
      .attr('height', 30)
      .attr('width', 18)
      .attr('x', 42 + i *20)
      .attr('y', 10)
      .attr('id', 'palette_rect')
      .attr('transform','translate(0,230)')
      .style('fill', function(d){
        return d3.rgb(d.palette[i][0], d.palette[i][1], d.palette[i][2]);
      })
      .style('stroke', 'white')
      .style('stroke-width', 0.5)
      .style('opacity', 1);
  }
  svg.selectAll('#info_frame').remove();

  if (data.length == 0){
    svg.append('rect')
    .attr('height', 278)
    .attr('width', 170)
    .attr('x', 0)
    .attr('y', 0)
    .attr('class', 'empty')
    .style('fill', 'white')
    .style('opacity', 0.05);

    svg.append('rect')
    .attr('height', 225)
    .attr('width', 150)
    .attr('x', 10)
    .attr('y', 10)
    .attr('class', 'empty')
    .style('fill', 'white')
    .style('opacity', 0.05);

    svg.append('rect')
    .attr('height', 30)
    .attr('width', 30)
    .attr('x', 10)
    .attr('y', 10)
    .attr('transform', 'translate(0,230)')
    .attr('class', 'empty')
    .style('fill', 'white')
    .style('opacity', 0.05);

    svg.append('rect')
    .attr('height', 225)
    .attr('width', 150)
    .attr('x', 10)
    .attr('y', 10)
    .attr('class', 'empty')
    .style('fill', 'white')
    .style('opacity', 0.05);

    for (var i = 0; i < 6; i ++){
      svg.append('rect')
        .attr('height', 30)
        .attr('width', 18)
        .attr('x', 42 + i *20)
        .attr('y', 10)
        .attr('transform','translate(0,230)')
        .attr('class', 'empty')
        .style('fill', 'white')
        .style('opacity', 0.05);
    }

    svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline','central')
    .attr('x', 85)
    .attr('y', 117)
    .attr('fill', 'white')
    .attr('class', 'empty')
    .text('Movie Poster')
    .attr('opacity', 0.8);

    svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline','central')
    .attr('x', 85)
    .attr('y', 255)
    .attr('fill', 'white')
    .attr('class', 'empty')
    .attr('font-size', '12px')
    .text('Color Palette')
    .attr('opacity', 0.8);

    svg.selectAll('#title').remove();
    svg.selectAll('#year').remove();
    svg.selectAll('#genre').remove();
  }
  else{
    svg.selectAll('.no_match').remove();
    svg.selectAll('.empty').remove();
    svg.selectAll('#title').remove();
    svg.selectAll('#year').remove();
    svg.selectAll('#genre').remove();
  }
};

// helper functions for search
var includeColorInPalette = function(d, color){
  var ans = false;
  d.palette_bins.forEach(function(d){
    if ((color[0] == d[0]) && (color[1] == d[1])){ ans = true;}
  });
  return ans;
};

// helper functions for search
var includeColorInPaletteHist = function(d, color){
  var ans = false;
  d.palette_bins.forEach(function(d){
    if (color[0] == d[0]) { ans = true;}
  });
  return ans;
};

// helper functions for search
var includedInDominant = function(d, dominant){
  var ans = false;
  dominant.forEach(function(i){
    if (i.data_id == d.data_id){ ans = true;}
  });
  return ans;
}
// this function will return the list of films based on criteria
var SearchFilms = function(year, genre, color, key){
  var temp = src.filter(function(d){
    return (d.year == year &&
    color[0] == d.dominant_bin[0] &&
    color[1] == d.dominant_bin[1]);
  });
  var temp_p = src.filter(function(d){
    return d.year == year && includeColorInPalette(d, color);
  });
  temp_p = temp_p.filter(function(d){return !includedInDominant(d,temp)});
  if (genre.length == 0){
    if (key == "dominant"){
      return temp;
    }
    else{
      return temp_p;
    }
  }
  else{
    if (GENRE == "animation"){
      if (key == "dominant"){
        return temp.filter(function(d){return d.genre.includes(genre) || d.genre.includes("family");})
      }
      else{
        return temp_p.filter(function(d){return d.genre.includes(genre) || d.genre.includes("family");})
      }
    }
    else{
      if (key == "dominant"){
        return temp.filter(function(d){return d.genre.includes(genre);})
      }
      else{
        return temp_p.filter(function(d){return d.genre.includes(genre);})
      }
    }
  }
};

// this function will return the list of films based on criteria
var SearchFilmsHist = function(year, genre, color, key){
  var temp = src.filter(function(d){
    return (d.year == year &&
    color[0] == d.dominant_bin[0]);
  });
  var temp_p = src.filter(function(d){
    return d.year == year && includeColorInPaletteHist(d, color);
  });
  temp_p = temp_p.filter(function(d){return !includedInDominant(d,temp)});
  if (genre.length == 0){
    if (key == "dominant"){
      return temp;
    }
    else{
      return temp_p;
    }
  }
  else{
    if (GENRE == "animation"){
      if (key == "dominant"){
        return temp.filter(function(d){return d.genre.includes(genre) || d.genre.includes("family");})
      }
      else{
        return temp_p.filter(function(d){return d.genre.includes(genre) || d.genre.includes("family");})
      }
    }
    else{
      if (key == "dominant"){
        return temp.filter(function(d){return d.genre.includes(genre);})
      }
      else{
        return temp_p.filter(function(d){return d.genre.includes(genre);})
      }
    }
  }
};
