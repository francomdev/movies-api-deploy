const z = require('zod')

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title is required'
  }),
  year: z.number().int().min(1900).max(2024),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).default(5),
  poster: z.string().url({
    message: 'Poster must be a valid url'
  }),
  genre: z.array(
    z.enum([
      'Action',
      'Drama',
      'Crime',
      'Sci-Fi',
      'Thriller',
      'Romance',
      'Adventure',
      'Comedy'
    ]),
    {
      required_error: 'At least one genre is required',
      invalid_type_error: 'Movie genre must be an array'
    }
  )
})

function validateMovie (object) {
  return movieSchema.safeParse(object)
}

function validatePartialMovie (object) {
  return movieSchema.partial().safeParse(object)
  // partial hace que todos los campos sean opcionales, únicamente valida los que están.
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
