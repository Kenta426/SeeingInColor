// loading file and initialization

// for the inspection
var src;
var svg;
var root;

// parameters

//visualizations
var HUEBIN = 8;     // number of hues
var LIGHTBIN = 5;   // number of lightness
var POSTERS = 3;    // number of posters to show
var XINTERVAL = 50; // x intervals between circles
var YINTERVAL = 45; // y intervals between circles
var HISTWIDTH = 42; // the width of histogram
var RADIUS = 3;     // make circles larger

// current selection (important)
var GENRE = "";     // empty = all genre
var YEAR = "2016";
var VIS = "heat"    // "heat", "bubble", "hist"
var COLOR = [4,0];  // default color
var CLICKED = [4,0];

// Scale functions
// heatmap all genre
var HeatAllGenreScale = d3.scaleSqrt().domain([0,150]).range([0,30]);
// heat map with genre
var HeatGenreScale = d3.scaleSqrt().domain([0,60]).range([0,35]);
// histogram with all genre
var HistAllGenreScale = d3.scaleLinear().domain([0,250]).range([0,250]);
// histogram with genre
var HistGenreScale = function(){
  if (GENRE == "horror"){
    return d3.scaleLinear().domain([0,85]).range([0,250]);
  }
  else if (GENRE == "comedy" ){
    return d3.scaleLinear().domain([0,110]).range([0,250]);
  }
  else if (GENRE == "action" || GENRE == "romance"){
    return d3.scaleLinear().domain([0,75]).range([0,250]);
  }
  else if (GENRE == "science fiction"){
    return d3.scaleLinear().domain([0,45]).range([0,250]);
  }
  else if (GENRE == "animation" || GENRE == "western"){
    return d3.scaleLinear().domain([0,30]).range([0,250]);
  }
}
// bubble chart with all genre
var BubbleScale = d3.scaleSqrt().domain([0,1500]).range([0,250]);
// bubble chart with genre
var BubbleGenreScale = d3.scaleSqrt().domain([0,550]).range([0,250]);

// hover function for the circle
var CircleHoverOn = function(d, coods){
  var svg = d3.select("#heatmap")
  .append('svg')
  .attr('x', coods[0]+10)
  .attr('y', coods[1]-10)
  .attr('id', 'blurb');
  // info blurb
  svg.append('rect')
  .attr('id', 'info_s')
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
  // movie count
  svg.append('text')
  .attr('x', 12)
  .attr('y', 19)
  .text(function(){return d.tally + " movies"})
  .attr('fill', 'white')
  .attr('font-size', '14px');
}

// hover function for the circle
var CircleHoverOff = function(){
  d3.selectAll("#blurb").remove();
}

///////////////////// load function /////////////////////
d3.csv("movie_data.csv",function(error, data){
  src = data;

  // Data cleaning
  // genre into string array
  src.forEach(function(d){
    d.file_urls = d.file_urls.split("[")[1].split("]")[0];
  })
  src.forEach(function(d){
    d.genre = d.genre.split(/\[|, |\]/).filter(function(d){return d.length != 0})
  });
  // dominant color into an array of hue bin and lightness bin
  src.forEach(function(d){
    var dominant = d.dominant_color.split(/[(,)]+/)
      .map(Number)
      .filter(function(d){
        return d != 0;
      });
    d.dominant_color = dominant;
    var dominant_hsl = d3.hsl(d3.rgb(dominant[0],dominant[1],dominant[2]));
    d.dominant_bin = [Math.floor(dominant_hsl.h/(360/HUEBIN)), Math.floor(dominant_hsl.l*LIGHTBIN)];
  });
  // palette into an array of hue bin and lightness bin
  src.forEach(function(d){
    var Bins = [];
    var palette = d.palette.split(/\(|\)/).filter(function(d){return d.length > 4});
    for (var i = 0; i < palette.length; i++){
      palette[i] = palette[i].split(',').map(Number)
    };
    for(var i = 0; i < 6; i++){
      Bins.push([])
    };
    palette.forEach(function(d,i){
      var hsl = d3.hsl(d3.rgb(d[0],d[1],d[2]));
      Bins[i][0] = Math.floor(hsl.h/(360/HUEBIN));
      Bins[i][1] = Math.floor(hsl.l*LIGHTBIN);
    });
    d.palette = palette;
    d.palette_bins = Bins;
    d.clicked = false;
  });
  // End of data cleaning

  // defining circles
  var circles = heat.append('g')
  .attr('transform', 'translate(80,55)')
  .style('margin', '0 auto')
  .attr('id', 'heatmap');

  for (var i = 0; i < HUEBIN; i ++){
    for (var j = 0; j < LIGHTBIN; j ++){
      circles.append('circle')
      .attr("cx", function(d){ return i*XINTERVAL + 30; })
      .attr("cy", function(d){ return j*YINTERVAL + 30; })
      .attr("r", 3)
      .style("fill", function(d){
        return d3.hsl(i*(360/HUEBIN), 1, (j+0.5)/LIGHTBIN);
      })
      .style("stroke-width", 3)
      .style("stroke", function(d){
        if(i == CLICKED[0] && j == CLICKED[1]){
           return "lime"; // initialization
         }
        else{
          return "none";
        }
      })
      .attr('id', 'color_circle')
      .style("opacity", 0.8)
      .on("mouseenter", function(d){
        if(d.clicked){
          d3.select(this)
          .attr("r", 1.2*this.r.animVal.value)
          .style('opacity', 1)
          .style("cursor", "pointer");
        }
        else{
          d3.select(this)
          .attr("r", 1.2*this.r.animVal.value)
          .style('opacity', 1)
          .style("stroke", "white")
          .style("cursor", "pointer")
          .style("stroke-width", 3)
        }
        CircleHoverOn(d, d3.mouse(this));
      })
      .on("mouseout", function(d){
        if(!d.clicked){
          d3.select(this)
          .attr("r", this.r.animVal.value/1.2)
          .style("stroke", "None")
          .style("opacity", 0.8);
        }
        else{
          d3.select(this)
          .attr("r", this.r.animVal.value/1.2)
          .style("opacity", 1);
        }
        CircleHoverOff();
      })
      .on("click",function(d){
        if(d.clicked){
          d.clicked = false;
          COLOR = [];
          d3.select(this)
          .style("stroke", "None");
        }
        else{
          d3.selectAll('#color_circle').style('stroke','none');
          d3.selectAll('#color_circle').data().forEach(function(d){d.clicked = false});
          d.clicked = true;
          d3.select(this)
          .style("stroke", "lime")
          .style("stroke-width", 3);
          var hsl = d3.hsl(this.style.fill);
          COLOR = [Math.floor(Math.ceil(hsl.h)/(360/HUEBIN)), Math.floor(hsl.l*LIGHTBIN)];
          CLICKED = [Math.floor(Math.ceil(hsl.h)/(360/HUEBIN)), Math.floor(hsl.l*LIGHTBIN)];
        }
        d3.selectAll('#bkgrnd').style('stroke','none');
        d3.selectAll('.posters').data().forEach(function(d){d.clicked = false});
        getLargeImage('#big',[]);
        d3.selectAll('#info').remove();
        var Films =SearchFilms(YEAR, GENRE, COLOR, "dominant");
        var Films2 =SearchFilms(YEAR, GENRE, COLOR, "sub");
        getPosterImage('#dominant_posters', Films);
        getPosterImage('#sub_posters', Films2);
      });
    }
  }

  // insert slider
  var slider = d3.select('#year_select').append('svg')
  .attr('width', 530)
  .attr('height', 50)
  .attr('transform', 'translate(0,0)')
  .attr('id', 'slider');

  slider.append('rect')
  .attr('x', 650)
  .attr('y', 0)
  .attr('rx', 3)
  .attr('ry', 3)
  .attr('width', 80)
  .attr('height', 30)
  .style('fill', 'white')
  .style('opacity', 0.05);

  // current year
  var year_window = d3.select('#year_select').append('svg')
  .attr('width', 50)
  .attr('height', 60)
  .attr('transform', 'translate(0,0)')
  .attr('id', 'slider');

  year_window.append('text')
  .attr('text-anchor', 'middle')
  .attr('alignment-baseline','central')
  .attr('x', 18)
  .attr('y', 50)
  .attr('fill', 'white')
  .attr('id', 'current_year')
  .text(YEAR)
  .attr('opacity', 1);

  insertSlider('#slider');
  // insert buttons
  var buttons1 = d3.select('#graph_select').append('svg')
  .attr('width', 450)
  .attr('height', 25);
  buttons1.append('g')
  .attr('id', 'graph_buttons')
  .attr('transform','translate(0,0)');

  var buttons2 = d3.select('#genre_select').append('svg')
  .attr('width', 450)
  .attr('height', 25);
  buttons2.append('g')
  .attr('id', 'genre_buttons')
  .attr('transform','translate(0,0)');

  var buttons3 = d3.select('#genre_select2').append('svg')
  .attr('width', 450)
  .attr('height', 25);
  buttons3.append('g')
  .attr('id', 'genre_buttons2')
  .attr('transform','translate(0,0)');

  var visualization = [ 'Heat Map', 'Histogram', 'Bubble Chart'];
  var genres = ["All", "Action", "Animation", "Comedy"];
  var genres2 = ["Horror", "Romance", "Science fiction", "Western"];

  insertButtons("#graph_buttons", visualization, 0);
  insertButtons("#genre_buttons", genres, 1);
  insertButtons("#genre_buttons2", genres2, 1);


  // draw initial heatmap
  DrawHeatMap(YEAR);

  // update display
  var Films = SearchFilms(YEAR, GENRE, COLOR, "dominant");
  var Films2 =SearchFilms(YEAR, GENRE, COLOR, "sub");
  getPosterImage('#dominant_posters', Films);
  getPosterImage('#sub_posters', Films2);
  getLargeImage('#big', []);
  d3.selectAll('#info').remove();

});
