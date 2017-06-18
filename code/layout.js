////////// div content /////////
// content includes visualization + description
var content = d3.select('.content').append('g');

// svg for the graph
var description = content.append('svg')
  .attr('height',300)
  .attr('width',200)
  .attr('id', 'description')
  .attr('transform', 'translate(100,10)');

// svg for the graph
var heat = content.append('svg')
  .attr('height',330)
  .attr('width',600)
  .attr('id', 'canvas')
  .attr('transform', 'translate(100, 10)');
//
heat.append('rect')
.attr('x', 0)
.attr('y', 0)
.attr('height',350)
.attr('width',600)
.style('fill', 'white')
.style('opacity', 0.05);


var svg = d3.select('#dominant_movie_poster')
.append('g').append('svg')
  .attr('height',200)
  .attr('width',392)
  .attr('transform', 'translate(0,0)')
  .attr('class', 'poster_display')
  .attr('id', 'dominant_posters');

var svg2 = d3.select('#sub_movie_poster')
.append('g').append('svg')
  .attr('height',200)
  .attr('width',392)
  .attr('transform', 'translate(0,0)')
  .attr('class', 'poster_display')
  .attr('id', 'sub_posters');

var g2 = d3.select('#big_poster').append('g')
.attr('transform', 'translate(0, 0)');
g2.append('svg')
.attr('x', 300)
.attr('y', 0)
.attr('height',300)
.attr('width',221)
.attr('transform', 'translate(0,0)')
.attr('id', 'big');

var info = d3.select('#big_poster_info').append('g')
.attr('transform', 'translate(0, 0)');
info.append('svg')
.attr('x', 0)
.attr('y', 0)
.attr('height',40)
.attr('width', 200)
.attr('transform', 'translate(0,0)')
.attr('id', 'big_title');

info.append('svg')
.attr('x', 0)
.attr('y', 0)
.attr('height',250)
.attr('width', 200)
.attr('transform', 'translate(0,0)')
.attr('id', 'big_info');
