const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

app.use(express.json());
let db = null;
let dbPath = path.join(__dirname, "moviesData.db");

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("The Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//get all movie names from movie table
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT 
    * 
    FROM 
    movie;`;
  const movieNamesArray = await db.all(getMoviesQuery);
  const getOnlyNames = (dbObject) => {
    return {
      movieName: dbObject.movie_name,
    };
  };
  response.send(movieNamesArray.map((eachMovie) => getOnlyNames(eachMovie)));
});

//create a new movie in movie table
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const newMovieQuery = `
  INSERT INTO 
  movie (director_id, movie_name, lead_actor)
  VALUES (
      ${directorId},
      '${movieName}',
      '${leadActor}'
  )`;
  const dbResponse = await db.run(newMovieQuery);
  response.send("Movie Successfully Added");
});

//get a movie based on movie_id
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
  SELECT
    *
  FROM
    movie
  WHERE
    movie_id = ${movieId};`;
  const Movie = await db.get(getMovieQuery);
  const getDBMovie = (newMovie) => {
    return {
      movieId: newMovie.movie_id,
      directorId: newMovie.director_id,
      movieName: newMovie.movie_name,
      leadActor: newMovie.lead_actor,
    };
  };
  response.send(getDBMovie(Movie));
});

//update a movie based on movie_id
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieBody = request.body;
  const { directorId, movieName, leadActor } = movieBody;
  const updateQuery = `
  UPDATE
  movie
  SET
  director_id = ${directorId},
  movie_name='${movieName}',
  lead_actor = '${leadActor}';
  WHERE 
  movie_id = ${movieId};`;
  const updateMovie = await db.run(updateQuery);
  response.send("Movie Details Updated");
});

//delete a movie based on movie_id
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
  DELETE FROM
  movie
  WHERE
  movie_id=${movieId};`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

//get all directors
app.get("/directors/", async (request, response) => {
  const directorsQuery = `
    SELECT
    * 
    FROM 
    director;`;
  const directorsArray = await db.all(directorsQuery);

  const getAllResponse = (eachArray) => {
    return {
      directorId: eachArray.director_id,
      directorName: eachArray.director_name,
    };
  };

  response.send(directorsArray.map((eachArray) => getAllResponse(eachArray)));
});

//get list of movie names by director_id
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE 
      director_id = '${directorId}';`;

  const moviesArray = await db.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
module.exports = app;
