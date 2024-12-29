// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const moviesContainer = document.getElementById('moviesContainer');
const loader = document.getElementById('loader');
const searchHistory = document.getElementById('searchHistory');
const homeButton = document.getElementById('homeButton');  // Home button

const API_KEY = '7e01ddad';  // Your OMDb API key
const API_URL = `https://www.omdbapi.com/?apikey=${API_KEY}`;

// On window load, fetch the latest movies and display search history
window.onload = () => {
  fetchLatestMovies();
  displaySearchHistory();
};

// Function to fetch the latest movies from OMDb API
async function fetchLatestMovies() {
  loader.classList.remove('hidden');
  moviesContainer.innerHTML = '';

  try {
    const currentYear = new Date().getFullYear();
    const response = await fetch(`${API_URL}&s=movie&y=${currentYear}`);
    const data = await response.json();

    // Check if response is successful
    if (data.Response === 'True') {
      displayMovies(data.Search);
    } else {
      moviesContainer.innerHTML = `<p>No latest movies available for ${currentYear}.</p>`;
    }
  } catch (error) {
    console.error('Error fetching latest movies:', error);
    moviesContainer.innerHTML = '<p>Something went wrong. Please try again later.</p>';
  } finally {
    loader.classList.add('hidden');
  }
}

// Function to fetch movies based on search query
async function fetchMovies(query) {
  loader.classList.remove('hidden');
  moviesContainer.innerHTML = '';

  try {
    const response = await fetch(`${API_URL}&s=${query}`);
    const data = await response.json();

    if (data.Response === 'True') {
      displayMovies(data.Search);
    } else {
      moviesContainer.innerHTML = `<p>${data.Error}</p>`;
    }
  } catch (error) {
    console.error('Error fetching movies:', error);
    moviesContainer.innerHTML = '<p>Something went wrong. Please try again later.</p>';
  } finally {
    loader.classList.add('hidden');
  }
}

// Function to display movie cards
function displayMovies(movies) {
  moviesContainer.innerHTML = '';
  movies.forEach(movie => {
    const movieDiv = document.createElement('div');
    movieDiv.classList.add('movie');
    movieDiv.innerHTML = `
      <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'placeholder.jpg'}" alt="${movie.Title}">
      <h3>${movie.Title}</h3>
      <p>${movie.Year}</p>
    `;
    movieDiv.addEventListener('click', () => showMovieDetails(movie.imdbID));
    moviesContainer.appendChild(movieDiv);
  });
}

// Event listener to handle live search input
searchButton.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query) {
    fetchMovies(query);
    saveSearch(query);
    searchInput.value = ''; // Clear the search input
  }
});

// Allow search when "Enter" is pressed in search input
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const query = searchInput.value.trim();
    if (query) {
      fetchMovies(query);
      saveSearch(query);
      searchInput.value = ''; // Clear the search input
    }
  }
});

// Function to save search to local storage
function saveSearch(query) {
  let searches = JSON.parse(localStorage.getItem('searches')) || [];
  if (!searches.includes(query)) {
    searches.unshift(query);
    if (searches.length > 5) {
      searches.pop();
    }
    localStorage.setItem('searches', JSON.stringify(searches));
  }
  displaySearchHistory();
}

// Function to display search history
function displaySearchHistory() {
  const searches = JSON.parse(localStorage.getItem('searches')) || [];
  searchHistory.innerHTML = '';

  if (searches.length === 0) {
    searchHistory.innerHTML = '<p>No recent searches</p>';
  } else {
    searches.forEach(query => {
      const historyItem = document.createElement('button');
      historyItem.classList.add('search-history-item');
      historyItem.innerText = query;
      historyItem.addEventListener('click', () => fetchMovies(query));
      searchHistory.appendChild(historyItem);
    });
  }
}

// Clear search history
document.getElementById('clearHistoryButton').addEventListener('click', () => {
  localStorage.removeItem('searches');
  displaySearchHistory();
});

// Function to show movie details when clicked
async function showMovieDetails(imdbID) {
  const response = await fetch(`${API_URL}&i=${imdbID}`);
  const data = await response.json();

  if (data.Response === 'True') {
    alert(`Movie: ${data.Title}\nYear: ${data.Year}\nPlot: ${data.Plot}`);
  } else {
    alert('Could not fetch movie details.');
  }
}

// Home button functionality (scroll to top and reset content)
homeButton.addEventListener('click', () => {
  window.scrollTo(0, 0); // Scroll to top of the page
  fetchLatestMovies(); // Fetch and display the latest movies (reset content)
  searchInput.value = ''; // Clear the search input field
  moviesContainer.innerHTML = ''; // Clear the movie results
  displaySearchHistory(); // Display search history
});
