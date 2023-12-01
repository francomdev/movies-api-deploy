const express = require('express')
const crypto = require('node:crypto')
const cors = require('cors')
const movies = require('./movies.json')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')
// const { error } = require('node:console')

const app = express()
const port = process.env.PORT ?? 3000
app.disable('x-powered-by')
app.use(express.json())
app.use(cors())
// Todos los recursos que sean Movies se identifican con /movies

app.get('/movies', (req, res) => {
  const { genre } = req.query
  if (genre) {
    const moviesByGenre = movies.filter((movie) =>
      movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
    )
    res.json(moviesByGenre)
  } else {
    res.json(movies)
  }
})

app.get('/movies/:id', (req, res) => {
  const movieId = req.params.id
  const movieById = movies.find((movie) => movie.id === movieId)
  if (movieById) return res.json(movieById)

  res.status(404).json({ message: 'Movie not found' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  } else {
    const newMovie = {
      id: crypto.randomUUID(),
      ...result.data
    }
    const checkMovieIndex = movies.findIndex(movie =>
      movie.title.toLowerCase() === newMovie.title.toLowerCase())
    if (checkMovieIndex > 0) {
      return res.status(400).json({ message: 'Movie already exists' })
    }
    movies.push(newMovie)
    res.status(201).json(newMovie) // actualiza el cache del cliente
  }
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)
  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex < 0) {
    return res.status(404).json({ message: 'Movie not found' })
  }
  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }
  movies[movieIndex] = updateMovie
  res.status(200).json(updateMovie)
}
)

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const indexToDelete = movies.findIndex(movie => movie.id === id)
  movies.splice(indexToDelete, 1)
  res.status(200).json(movies)
})

app.listen(port, () =>
  console.log(`Server listening on http://localhost:${port}`)
)
