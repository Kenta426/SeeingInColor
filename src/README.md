# movie_data.csv
This dataset contains information about movies as well as color palette of posters and its url.
Movies selected based on top 250 most popular movies from 1967 - 2016 (50 years, 12500 movies) and parsed from [letterboxd](https://letterboxd.com). The color palette was extracted using [ColorTheif](https://github.com/fengsp/color-thief-py).

The columns names are as follows
* [ *data_id* ] : the primal key for the movies.

* [ *title* ] : the title of the movie.

* [ *year* ] : the year when the movie came out.

* [ *genre* ] : genre of the movie in the form of string array.

* [ *imdb_id* ] : the primal key pf the movies for the imdb. If the movie does not exist in imdb, 'none'.

* [ *rank* ] : the ranking of the movie within the same year (1-250). If the movie is the most popular in a year, indexed as 1.

* [ *file_urls* ] : the url to the poster image. stored in the form of array with 1 element.

* [ *dominant_color* ] : dominant color of the poster in rgb form.

* [ *palette* ] : 6-color palette of the poster in rgb form. stored as an array with the length of 6.
