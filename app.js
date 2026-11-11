let movies = JSON.parse(localStorage.getItem("movies")) || [];

const totalMoviesEl = document.getElementById("totalMovies");
const watchedMoviesEl = document.getElementById("watchedMovies");
const avgRatingEl = document.getElementById("avgRating");
const form = document.getElementById("Form");
const movieTitle = document.getElementById("name");
const movieGenre = document.getElementById("movieGenre");
const movieYear = document.getElementById("movieYear");
const movieRating = document.getElementById("movieRating");
const yearLabel = document.getElementById("yearLabel");
const errorMsg = document.getElementById("errorMsg");
const genreError = document.getElementById("genreError");
const yearError = document.getElementById("yearError");
const ratingError = document.getElementById("ratingError");
const moviesShown = document.getElementById("moviesShown");
const searchInput = document.getElementById("searchInput");
const filterGenre = document.getElementById("filterGenre");
const sortSelect = document.getElementById("sortSelect");
const randomBtn = document.getElementById("randomBtn");

const currentYear = new Date().getFullYear();
yearLabel.textContent = `Year (1900 - ${currentYear})`;

form.addEventListener("submit", function (e) {
    e.preventDefault();

    let isValid = true;
    errorMsg.textContent = "";
    genreError.textContent = "";
    yearError.textContent = "";
    ratingError.textContent = "";

    const titleVal = movieTitle.value.trim();
    const genreVal = movieGenre.value;
    const yearVal = Number(movieYear.value);
    const ratingVal = Number(movieRating.value);

    if (titleVal === "" || titleVal.length < 2) {
        errorMsg.textContent = "Title must be at least 2 letters ⚠️";
        isValid = false;
    } else {
        const isDuplicate = movies.some(
            (m) => m.title.toLowerCase() === titleVal.toLowerCase()
        );
        if (isDuplicate) {
            errorMsg.textContent = "This movie title already exists! ⚠️";
            isValid = false;
        }
    }

    if (genreVal === "") {
        genreError.textContent = "Please choose a genre ⚠️";
        isValid = false;
    }

    if (!movieYear.value || yearVal < 1900 || yearVal > currentYear) {
        yearError.textContent = `Please enter a valid year between 1900 and ${currentYear} ⚠️`;
        isValid = false;
    }

    if (movieRating.value === "") {
        ratingError.textContent = "Please choose a rating ⚠️";
        isValid = false;
    }

    if (isValid) {
        const newMovie = {
            id: Date.now(),
            title: titleVal,
            genre: genreVal,
            year: yearVal,
            rating: ratingVal,
            watched: false
        };

        movies.push(newMovie);
        saveAndRender();
        form.reset();
    }
});

function saveAndRender() {
    localStorage.setItem("movies", JSON.stringify(movies));
    updateStatsCards();
    renderMovies();
}

function updateStatsCards() {
    totalMoviesEl.textContent = movies.length;

    const watchedCount = movies.filter((m) => m.watched).length;
    watchedMoviesEl.textContent = watchedCount;

    if (movies.length === 0) {
        avgRatingEl.textContent = "0.0";
    } else {
        const totalRating = movies.reduce((sum, m) => sum + m.rating, 0);
        avgRatingEl.textContent = (totalRating / movies.length).toFixed(1);
    }
}

function renderMovies() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedGenre = filterGenre.value;
    const sortBy = sortSelect.value;

    let filteredMovies = movies.filter((movie) => {
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm);
        const matchesGenre = selectedGenre === "All" || movie.genre === selectedGenre;
        return matchesSearch && matchesGenre;
    });

    if (sortBy === "rating-desc") {
        filteredMovies.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "rating-asc") {
        filteredMovies.sort((a, b) => a.rating - b.rating);
    } else if (sortBy === "year-desc") {
        filteredMovies.sort((a, b) => b.year - a.year);
    } else if (sortBy === "year-asc") {
        filteredMovies.sort((a, b) => a.year - b.year);
    }

    moviesShown.innerHTML = "";

    if (filteredMovies.length === 0) {
        moviesShown.innerHTML = `<p class="text-center text-muted fs-5">No movies found.</p>`;
        return;
    }

    filteredMovies.forEach((movie) => {
        const stars = "⭐".repeat(movie.rating);
        const cardCol = document.createElement("div");
        cardCol.className = "col-md-4 col-sm-6";

        cardCol.innerHTML = `
            <div class="card h-100 shadow ${movie.watched ? "border-success border-3" : ""}">
                <div class="card-body d-flex flex-column justify-content-between text-dark">
                    <div>
                        <div class="d-flex justify-content-between align-items-start">
                            <h5 class="card-title fw-bold">${movie.title}</h5>
                            <span class="badge bg-primary">${movie.genre}</span>
                        </div>
                        <p class="card-text text-muted mb-1">Year: ${movie.year}</p>
                        <p class="card-text mb-3">Rating: ${stars} (${movie.rating}/5)</p>
                    </div>
                    <div class="d-flex gap-2">
                        <button onclick="toggleWatched(${movie.id})" class="btn btn-sm flex-grow-1 ${movie.watched ? "btn-success" : "btn-outline-secondary"}">
                            ${movie.watched ? "✅ Watched" : "👁️ Mark Watched"}
                        </button>
                        <button onclick="deleteMovie(${movie.id})" class="btn btn-sm btn-danger">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
        moviesShown.appendChild(cardCol);
    });
}

function toggleWatched(id) {
    movies = movies.map((movie) =>
        movie.id === id ? { ...movie, watched: !movie.watched } : movie
    );
    saveAndRender();
}

function deleteMovie(id) {
    if (confirm("Are you sure you want to delete this movie?")) {
        movies = movies.filter((movie) => movie.id !== id);
        saveAndRender();
    }
}

searchInput.addEventListener("input", renderMovies);
filterGenre.addEventListener("change", renderMovies);
sortSelect.addEventListener("change", renderMovies);

randomBtn.addEventListener("click", function () {
    const unwatchedMovies = movies.filter((m) => !m.watched);

    if (unwatchedMovies.length === 0) {
        alert("No unwatched movies available! Add some new movies first 🎬");
        return;
    }

    const randomIndex = Math.floor(Math.random() * unwatchedMovies.length);
    const chosenMovie = unwatchedMovies[randomIndex];
    alert(`🍿 Tonight you should watch:\n\n🎬 ${chosenMovie.title} (${chosenMovie.year})\n🎭 Genre: ${chosenMovie.genre}\n⭐ Rating: ${chosenMovie.rating}/5`);
});

saveAndRender();
