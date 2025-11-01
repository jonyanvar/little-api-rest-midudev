const crypto  = require('node:crypto');
const express = require('express');
const cors = require('cors');
const movies = require('./movies.json');
const movieSchema = require('./schemas/movies.js');
const { id } = require('zod/v4/locales');

const ACCEPTED_ORIGINS = ['http://localhost:8080', 'http://movies.com'];

const app = express();

app.use(cors({
    origin: (origin, callback) => {
        const ACCEPTED_ORIGINS = ['http://localhost:8080', 'http://movies.com'];
        if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }

}));

app.disable('x-powered-by');

app.use(express.json());

// GET, HEAD Y POST no requieren pre flight
// PUT, PATCH, DELETE requieren pre flight, por eso OPTIONS puede dar error de CORS si no se gestiona 

app.get('/', (req, res) => {
    res.json({ message: 'Hola Mundo con Express' });
});

//


// Todos recursos que sean movies se identiifican con /movies
app.get('/movies', (req, res) => {

    const { genre } = req.query;
    if (genre) {
        const filteredMovies = movies.filter((movie) =>
            movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        );
        return res.json(filteredMovies);
    }

    res.json(movies);
});

app.get('/movies/:id', (req, res) => {
    // :id/:mas/:otro -> const { id, mas, otro } = req.params
    // :id es un segmento dinámico
    const { id } = req.params; // Path to regex
    const movie = movies.find((movie) => movie.id === id);
    if (movie) return res.json(movie);
    res.status(404).json({ error: 'Movie not found' });
})

app.post('/movies', (req, res) => {
    
    const validation = movieSchema.validateMovie(req.body);

    if(validation.error) {
        return res.status(422).json({ error: JSON.parse(validation.error.message) });
    }

    const newMovie =  {
        id: crypto.randomUUID(),
        ...validation.data // Usamos los datos validados, en vez de req.body directamente
    }

    movies.push(newMovie);
    // Aquí normalmente guardarías en una base de datos

    res.status(201).json(newMovie);
});

app.patch('/movies/:id', (req, res) => {
    const result = movieSchema.validatePartialMovie(req.body);
    if(!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) });
    }

    const { id } = req.params;

    const movieIndex = movies.findIndex((movie) => movie.id === id);
    if(movieIndex === -1) {
        return res.status(404).json({ error: 'Movie not found' });
    }

    const updatedMovie = { ...movies[movieIndex], ...result.data };
    movies[movieIndex] = updatedMovie;

    res.json(updatedMovie);
});

app.delete('/movies/:id', (req, res) => {

    const { id } = req.params;
    const movieIndex = movies.findIndex((movie) => movie.id === id);
    movies.splice(movieIndex, 1);
    return res.json({ message: 'Movie deleted successfully' });
})


const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});



// Me quedé en https://youtu.be/-9d3KhCqOtU?list=PLUofhDIg_38qm2oPOV-IRTTEKyrVBBaU7&t=289