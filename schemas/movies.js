const z = require('zod');

const movieSchema = z.object({
        title: z.string({ required_error: 'Title is required', invalid_type_error: 'Title must be a string' }).min(1),
        director: z.string().min(1),
        year: z.number().int().min(1888).max(new Date().getFullYear()),
        genre: z.array(z.enum(["Action", "Comedy", "Mystery", "Drama", "Fantasy", "Horror", "Romance", "Thriller", "Sci-Fi"]),
            { invalid_type_error: 'Genre must be an array of valid genres', required_error: 'Genre is required' }
    ).min(1),
        duration: z.number().int().positive(),
        poster: z.url(),
        rate: z.number().min(0).max(10).default(0)
    });
// La id, aunque se la pases a ZOD, no la tiene en cuenta


const validateMovie = (object) => {
    return movieSchema.safeParse(object);
    // Safe parse es más seguro, 
}

const validatePartialMovie = (input) => {
    return movieSchema.partial().safeParse(input);
}

module.exports = { validateMovie, validatePartialMovie };