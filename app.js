const { createApp } = Vue;

const DEFAULT_TMDB_API_KEY = '4e44d9029b1270a757cddc766a1bcb63';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

const app = createApp({
  data() {
    return {
      movies: [],
      genres: [
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' },
        { id: 16, name: 'Animation' },
        { id: 35, name: 'Comedy' },
        { id: 80, name: 'Crime' },
        { id: 99, name: 'Documentary' },
        { id: 18, name: 'Drama' },
        { id: 10751, name: 'Family' },
        { id: 14, name: 'Fantasy' },
        { id: 36, name: 'History' },
        { id: 27, name: 'Horror' },
        { id: 10402, name: 'Music' },
        { id: 9648, name: 'Mystery' },
        { id: 10749, name: 'Romance' },
        { id: 878, name: 'Sci-Fi' },
        { id: 53, name: 'Thriller' },
        { id: 10752, name: 'War' },
        { id: 37, name: 'Western' }
      ],
      currentCategory: 'popular',
      selectedGenre: null,
      sortBy: 'popularity.desc',
      minRating: 0,
      activeDropdown: null,
      searchType: 'all',
      categories: [
        { id: 'popular', label: 'Popular', icon: 'fa-solid fa-fire', title: 'Popular Movies' },
        { id: 'trending', label: 'Trending', icon: 'fa-solid fa-arrow-trend-up', title: 'Trending Today' },
        { id: 'top_rated', label: 'Top Rated', icon: 'fa-solid fa-trophy', title: 'Top Rated Classics' },
        { id: 'now_playing', label: 'Now Playing', icon: 'fa-solid fa-film', title: 'In Theaters' },
        { id: 'upcoming', label: 'Upcoming', icon: 'fa-solid fa-calendar-days', title: 'Upcoming Releases' }
      ],
      searchQuery: '',
      activeSearchQuery: '',
      isSearchModalOpen: false,
      recentSearches: ['vincenzo', 'inception', 'interstellar'],
      watchlist: [],
      favorites: [],
      watchStatusMap: {},
      watchlistFilter: 'all',
      activeTab: 'discover',
      selectedMovie: null,
      movieCredits: null,
      movieVideos: [],
      detailsLoading: false,
      loading: false,
      error: null,
      darkMode: true,
      isScrolled: false,
      isMobileMenuOpen: false,
      heroSlideIndex: 0,
      heroSlideInterval: null,
      isTrailerPlaying: false,
      toast: {
        show: false,
        message: '',
        type: 'success'
      },
      toastTimeout: null
    };
  },

  computed: {
    filteredMovies() {
      let result = [...this.movies];

      if (this.selectedGenre !== null && this.selectedGenre !== '') {
        const targetId = Number(this.selectedGenre);
        result = result.filter(movie => {
          if (!movie.genre_ids) return false;
          return movie.genre_ids.includes(targetId);
        });
      }

      if (this.minRating > 0) {
        result = result.filter(movie => (movie.vote_average || 0) >= this.minRating);
      }

      result.sort((a, b) => {
        if (this.sortBy === 'vote_average.desc') {
          return (b.vote_average || 0) - (a.vote_average || 0);
        } else if (this.sortBy === 'release_date.desc') {
          return new Date(b.release_date || 0) - new Date(a.release_date || 0);
        } else if (this.sortBy === 'title.asc') {
          return (a.title || '').localeCompare(b.title || '');
        }
        return (b.popularity || 0) - (a.popularity || 0);
      });

      return result;
    },

    displayedMovies() {
      if (this.activeTab === 'watchlist') {
        if (this.watchlistFilter === 'all') {
          return this.watchlist;
        }
        return this.watchlist.filter(m => (this.watchStatusMap[m.id] || 'plan_to_watch') === this.watchlistFilter);
      }

      if (this.activeTab === 'favorites') {
        return this.favorites;
      }

      return this.filteredMovies;
    },

    heroMovies() {
      if (this.movies.length === 0) return [];
      const withBackdrop = this.movies.filter(m => m.backdrop_path && m.overview);
      return withBackdrop.slice(0, 7);
    },

    currentHeroMovie() {
      if (this.heroMovies.length === 0) return null;
      return this.heroMovies[this.heroSlideIndex] || this.heroMovies[0];
    },

    favoriteCount() {
      return this.favorites.length;
    },

    watchlistCount() {
      return this.watchlist.length;
    },

    watchedCount() {
      return this.watchlist.filter(m => this.watchStatusMap[m.id] === 'completed').length;
    },

    watchingCount() {
      return this.watchlist.filter(m => this.watchStatusMap[m.id] === 'watching').length;
    },

    planToWatchCount() {
      return this.watchlist.filter(m => !this.watchStatusMap[m.id] || this.watchStatusMap[m.id] === 'plan_to_watch').length;
    },

    watchlistCompletionPercent() {
      if (this.watchlistCount === 0) return 0;
      return Math.round((this.watchedCount / this.watchlistCount) * 100);
    },

    favoriteAverageRating() {
      if (this.favorites.length === 0) return '0.0';
      const avg = this.favorites.reduce((sum, m) => sum + (m.vote_average || 0), 0) / this.favorites.length;
      return avg.toFixed(1);
    },

    topFavoriteGenre() {
      if (this.favorites.length === 0) return 'Cinema';
      const countMap = {};
      this.favorites.forEach(m => {
        const names = this.getGenreNames(m);
        names.forEach(g => {
          countMap[g] = (countMap[g] || 0) + 1;
        });
      });
      let best = 'Cinema';
      let max = 0;
      for (const [genre, count] of Object.entries(countMap)) {
        if (count > max) {
          max = count;
          best = genre;
        }
      }
      return best;
    },

    starterPicks() {
      return this.movies.slice(0, 6);
    },

    selectedMovieCast() {
      if (!this.movieCredits || !this.movieCredits.cast) return [];
      return this.movieCredits.cast.slice(0, 10);
    },

    selectedMovieDirector() {
      if (!this.movieCredits || !this.movieCredits.crew) return 'Not Available';
      const director = this.movieCredits.crew.find(c => c.job === 'Director');
      return director ? director.name : 'Not Available';
    },

    activeTrailer() {
      if (!this.movieVideos || this.movieVideos.length === 0) return null;
      const trailer = this.movieVideos.find(
        v => v.site === 'YouTube' && v.type === 'Trailer' && v.key
      ) || this.movieVideos.find(
        v => v.site === 'YouTube' && v.key
      );
      return trailer ? trailer.key : null;
    },

    currentSectionTitle() {
      if (this.activeTab === 'watchlist') return 'Your Watchlist';
      if (this.activeTab === 'favorites') return 'Your Favorite Movies';
      if (this.activeSearchQuery) return `Search Results for "${this.activeSearchQuery}"`;
      const cat = this.categories.find(c => c.id === this.currentCategory);
      return cat ? cat.title : 'Explore Movies';
    },

    selectedGenreName() {
      if (!this.selectedGenre) return 'All Genres';
      const found = this.genres.find(g => g.id === Number(this.selectedGenre));
      return found ? found.name : 'All Genres';
    },

    selectedRatingLabel() {
      if (!this.minRating) return 'All Ratings';
      return `${this.minRating}.0+ ★`;
    },

    selectedSortLabel() {
      switch (this.sortBy) {
        case 'vote_average.desc': return 'Highest Rated';
        case 'release_date.desc': return 'Newest Releases';
        case 'title.asc': return 'Alphabetical (A-Z)';
        case 'popularity.desc':
        default: return 'Most Popular';
      }
    },

    selectedSearchTypeLabel() {
      switch (this.searchType) {
        case 'movies': return 'Movies Only';
        case 'tv': return 'TV Shows Only';
        case 'all':
        default: return 'Movies & TV Shows';
      }
    }
  },

  methods: {
    async fetchMovies() {
      this.loading = true;
      this.error = null;
      this.activeSearchQuery = '';

      let endpoint = `/movie/${this.currentCategory}`;
      if (this.currentCategory === 'trending') {
        endpoint = '/trending/movie/day';
      }

      const url = `${TMDB_BASE_URL}${endpoint}?api_key=${DEFAULT_TMDB_API_KEY}&language=en-US&page=1`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status}: Failed to retrieve data from TMDB.`);
        }
        const data = await response.json();
        this.movies = data.results || [];
        this.heroSlideIndex = 0;
        this.startHeroAutoplay();
      } catch (err) {
        console.error('TMDB API Error:', err);
        this.error = 'Something went wrong while loading movies. Please check your network connection.';
      } finally {
        this.loading = false;
      }
    },

    async searchMovies() {
      const query = this.searchQuery.trim();
      if (!query) {
        this.clearSearch();
        return;
      }

      this.loading = true;
      this.error = null;
      this.activeSearchQuery = query;
      this.activeTab = 'discover';

      const url = `${TMDB_BASE_URL}/search/movie?api_key=${DEFAULT_TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status}: Search request failed.`);
        }
        const data = await response.json();
        this.movies = data.results || [];
      } catch (err) {
        console.error('TMDB Search Error:', err);
        this.error = 'Unable to complete search request. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    toggleDropdown(name) {
      this.activeDropdown = this.activeDropdown === name ? null : name;
    },

    closeDropdowns() {
      this.activeDropdown = null;
    },

    selectGenreOption(genreId) {
      this.selectedGenre = genreId;
      this.closeDropdowns();
    },

    selectRatingOption(rating) {
      this.minRating = rating;
      this.closeDropdowns();
    },

    selectSortOption(sortKey) {
      this.sortBy = sortKey;
      this.closeDropdowns();
    },

    selectSearchTypeOption(typeKey) {
      this.searchType = typeKey;
      this.closeDropdowns();
    },

    goHome() {
      const wasSearch = !!this.activeSearchQuery;
      const wasDifferentTab = this.activeTab !== 'discover';
      const wasFiltered = this.selectedGenre !== null || this.minRating !== 0 || this.currentCategory !== 'popular';
      
      this.activeTab = 'discover';
      this.activeSearchQuery = '';
      this.searchQuery = '';
      this.currentCategory = 'popular';
      this.selectedGenre = null;
      this.minRating = 0;
      this.sortBy = 'popularity.desc';
      this.closeModal();
      this.closeSearchModal();
      this.closeMobileMenu();
      this.closeDropdowns();
      
      if (wasSearch || wasDifferentTab || wasFiltered || this.movies.length === 0) {
        this.fetchMovies();
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    setActiveTab(tab) {
      if (tab === 'discover') {
        this.goHome();
        return;
      }
      this.activeTab = tab;
      this.activeSearchQuery = '';
      this.closeModal();
      this.closeSearchModal();
      this.closeMobileMenu();
      this.closeDropdowns();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
      this.closeDropdowns();
    },

    closeMobileMenu() {
      this.isMobileMenuOpen = false;
    },

    openSearchModal() {
      this.isSearchModalOpen = true;
      this.closeMobileMenu();
      this.closeDropdowns();
      this.$nextTick(() => {
        const input = this.$refs.searchModalInput;
        if (input) {
          input.focus();
          input.select();
        }
      });
    },

    closeSearchModal() {
      this.isSearchModalOpen = false;
      this.closeDropdowns();
    },

    submitSearch(queryToSearch = null) {
      const q = (typeof queryToSearch === 'string' ? queryToSearch : this.searchQuery).trim();
      if (!q) return;

      this.searchQuery = q;
      const filtered = this.recentSearches.filter(s => s.toLowerCase() !== q.toLowerCase());
      this.recentSearches = [q, ...filtered].slice(0, 6);
      this.saveLocalStorage();

      this.closeSearchModal();
      this.searchMovies();
    },

    clearRecentSearches() {
      this.recentSearches = [];
      this.saveLocalStorage();
    },

    removeRecentSearch(idx) {
      this.recentSearches.splice(idx, 1);
      this.saveLocalStorage();
    },

    clearSearch() {
      this.searchQuery = '';
      this.activeSearchQuery = '';
      this.closeSearchModal();
      this.fetchMovies();
    },

    async fetchGenres() {
      const url = `${TMDB_BASE_URL}/genre/movie/list?api_key=${DEFAULT_TMDB_API_KEY}&language=en-US`;
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          this.genres = data.genres || [];
        }
      } catch (err) {
        console.warn('Failed to load genres from TMDB:', err);
      }
    },

    startHeroAutoplay() {
      this.stopHeroAutoplay();
      this.heroSlideInterval = setInterval(() => {
        this.nextHeroSlide();
      }, 6500);
    },

    stopHeroAutoplay() {
      if (this.heroSlideInterval) {
        clearInterval(this.heroSlideInterval);
        this.heroSlideInterval = null;
      }
    },

    nextHeroSlide() {
      if (this.heroMovies.length === 0) return;
      this.heroSlideIndex = (this.heroSlideIndex + 1) % this.heroMovies.length;
    },

    prevHeroSlide() {
      if (this.heroMovies.length === 0) return;
      this.heroSlideIndex = (this.heroSlideIndex - 1 + this.heroMovies.length) % this.heroMovies.length;
    },

    setHeroSlide(index) {
      this.heroSlideIndex = index;
      this.startHeroAutoplay();
    },

    async openMovieDetails(movie, autoPlayTrailer = false) {
      this.selectedMovie = { ...movie };
      this.movieCredits = null;
      this.movieVideos = [];
      this.detailsLoading = true;
      this.isTrailerPlaying = autoPlayTrailer;
      this.closeDropdowns();
      this.closeMobileMenu();

      document.body.style.overflow = 'hidden';

      this.$nextTick(() => {
        const dialog = document.querySelector('.modal-dialog');
        if (dialog) dialog.scrollTop = 0;
      });

      const url = `${TMDB_BASE_URL}/movie/${movie.id}?api_key=${DEFAULT_TMDB_API_KEY}&language=en-US&append_to_response=credits,videos`;

      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          this.selectedMovie = data;
          this.movieCredits = data.credits || null;
          this.movieVideos = (data.videos && data.videos.results) ? data.videos.results : [];
        }
      } catch (err) {
        console.warn('Failed to fetch enriched movie details:', err);
      } finally {
        this.detailsLoading = false;
      }
    },

    playMovieTrailer(movie) {
      this.openMovieDetails(movie, true);
    },

    closeModal() {
      this.selectedMovie = null;
      this.movieCredits = null;
      this.movieVideos = [];
      this.isTrailerPlaying = false;
      this.closeDropdowns();
      document.body.style.overflow = '';
    },

    addToWatchlist(movie) {
      if (!this.isInWatchlist(movie)) {
        this.watchlist.push(movie);
        if (!this.watchStatusMap[movie.id]) {
          this.watchStatusMap[movie.id] = 'plan_to_watch';
        }
        this.saveLocalStorage();
        this.showToastNotification(`"${movie.title}" added to your watchlist`, 'success');
      }
    },

    removeFromWatchlist(movie) {
      const index = this.watchlist.findIndex(m => m.id === movie.id);
      if (index !== -1) {
        this.watchlist.splice(index, 1);
        delete this.watchStatusMap[movie.id];
        this.saveLocalStorage();
        this.showToastNotification(`"${movie.title}" removed from watchlist`, 'remove');
      }
    },

    toggleWatchlist(movie) {
      if (this.isInWatchlist(movie)) {
        this.removeFromWatchlist(movie);
      } else {
        this.addToWatchlist(movie);
      }
    },

    toggleFavorite(movie) {
      const index = this.favorites.findIndex(m => m.id === movie.id);
      if (index !== -1) {
        this.favorites.splice(index, 1);
        this.saveLocalStorage();
        this.showToastNotification(`Removed "${movie.title}" from favorites`, 'remove');
      } else {
        this.favorites.push(movie);
        this.saveLocalStorage();
        this.showToastNotification(`Added "${movie.title}" to favorites`, 'favorite');
      }
    },

    isInWatchlist(movie) {
      if (!movie) return false;
      return this.watchlist.some(m => m.id === movie.id);
    },

    isFavorite(movie) {
      if (!movie) return false;
      return this.favorites.some(m => m.id === movie.id);
    },

    setWatchStatus(movieId, status) {
      this.watchStatusMap[movieId] = status;
      this.saveLocalStorage();
      const label = this.getWatchStatusLabel(status);
      this.showToastNotification(`Status updated to: ${label}`, 'info');
    },

    cycleWatchStatus(movie, event) {
      if (event) event.stopPropagation();
      const current = this.getWatchStatus(movie.id);
      let next = 'watching';
      if (current === 'plan_to_watch') next = 'watching';
      else if (current === 'watching') next = 'completed';
      else if (current === 'completed') next = 'plan_to_watch';
      this.setWatchStatus(movie.id, next);
    },

    getWatchStatus(movieId) {
      return this.watchStatusMap[movieId] || 'plan_to_watch';
    },

    getWatchStatusLabel(status) {
      switch (status) {
        case 'completed': return 'Completed';
        case 'watching': return 'Watching';
        case 'plan_to_watch':
        default: return 'Plan to Watch';
      }
    },

    pickRandomWatchlistMovie() {
      if (this.watchlist.length === 0) return;
      const unwatched = this.watchlist.filter(m => (this.watchStatusMap[m.id] || 'plan_to_watch') !== 'completed');
      const pool = unwatched.length > 0 ? unwatched : this.watchlist;
      const picked = pool[Math.floor(Math.random() * pool.length)];
      this.openMovieDetails(picked);
      this.showToastNotification(`🎲 Selected "${picked.title}" for your movie night!`, 'success');
    },

    pickRandomFavoriteMovie() {
      if (this.favorites.length === 0) return;
      const picked = this.favorites[Math.floor(Math.random() * this.favorites.length)];
      this.openMovieDetails(picked);
      this.showToastNotification(`🎲 Revisit your favorite: "${picked.title}"!`, 'favorite');
    },

    clearCompletedWatchlist() {
      const initialLength = this.watchlist.length;
      this.watchlist = this.watchlist.filter(m => this.watchStatusMap[m.id] !== 'completed');
      const removedCount = initialLength - this.watchlist.length;
      if (removedCount > 0) {
        this.saveLocalStorage();
        this.showToastNotification(`Removed ${removedCount} completed movies from watchlist`, 'remove');
      }
    },

    setCategory(categoryKey) {
      this.currentCategory = categoryKey;
      this.activeTab = 'discover';
      this.clearSearch();
    },

    setActiveTab(tab) {
      this.activeTab = tab;
      this.closeDropdowns();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      this.updateThemeClass();
      this.saveLocalStorage();
    },

    updateThemeClass() {
      if (this.darkMode) {
        document.documentElement.classList.remove('light-theme');
      } else {
        document.documentElement.classList.add('light-theme');
      }
    },

    getPosterUrl(path, size = 'w500') {
      if (!path) return '';
      return `${TMDB_IMAGE_BASE}/${size}${path}`;
    },

    getBackdropUrl(path, size = 'original') {
      if (!path) return '';
      return `${TMDB_IMAGE_BASE}/${size}${path}`;
    },

    formatDate(dateString) {
      if (!dateString) return 'TBA';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    formatYear(dateString) {
      if (!dateString) return 'TBA';
      return dateString.substring(0, 4);
    },

    formatRating(voteAverage) {
      if (typeof voteAverage !== 'number' || isNaN(voteAverage)) return 'N/A';
      return voteAverage.toFixed(1);
    },

    getGenreNames(movie) {
      if (!movie) return [];

      if (movie.genres && Array.isArray(movie.genres)) {
        return movie.genres.map(g => g.name);
      }

      if (movie.genre_ids && Array.isArray(movie.genre_ids)) {
        return movie.genre_ids
          .map(id => {
            const found = this.genres.find(g => g.id === id);
            return found ? found.name : null;
          })
          .filter(Boolean);
      }

      return [];
    },

    showToastNotification(message, type = 'success') {
      if (this.toastTimeout) {
        clearTimeout(this.toastTimeout);
      }
      this.toast = {
        show: true,
        message,
        type
      };
      this.toastTimeout = setTimeout(() => {
        this.toast.show = false;
      }, 3400);
    },

    dismissToast() {
      if (this.toastTimeout) {
        clearTimeout(this.toastTimeout);
      }
      this.toast.show = false;
    },

    loadLocalStorage() {
      try {
        const savedWatchlist = localStorage.getItem('cinevault_watchlist');
        if (savedWatchlist) {
          this.watchlist = JSON.parse(savedWatchlist);
        }

        const savedFavorites = localStorage.getItem('cinevault_favorites');
        if (savedFavorites) {
          this.favorites = JSON.parse(savedFavorites);
        }

        const savedStatus = localStorage.getItem('cinevault_watch_status');
        if (savedStatus) {
          this.watchStatusMap = JSON.parse(savedStatus);
        }

        const savedRecent = localStorage.getItem('cinevault_recent_searches');
        if (savedRecent) {
          this.recentSearches = JSON.parse(savedRecent);
        }

        const savedDarkMode = localStorage.getItem('cinevault_dark_mode');
        if (savedDarkMode !== null) {
          this.darkMode = savedDarkMode === 'true';
        }
      } catch (e) {
        console.warn('LocalStorage load error:', e);
      }
    },

    saveLocalStorage() {
      try {
        localStorage.setItem('cinevault_watchlist', JSON.stringify(this.watchlist));
        localStorage.setItem('cinevault_favorites', JSON.stringify(this.favorites));
        localStorage.setItem('cinevault_watch_status', JSON.stringify(this.watchStatusMap));
        localStorage.setItem('cinevault_recent_searches', JSON.stringify(this.recentSearches));
        localStorage.setItem('cinevault_dark_mode', this.darkMode.toString());
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
    }
  },

  mounted() {
    this.loadLocalStorage();
    this.updateThemeClass();
    this.fetchGenres();
    this.fetchMovies();

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.custom-dropdown-container')) {
        this.closeDropdowns();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.isMobileMenuOpen) {
          this.closeMobileMenu();
        } else if (this.activeDropdown) {
          this.closeDropdowns();
        } else if (this.isSearchModalOpen) {
          this.closeSearchModal();
        } else if (this.selectedMovie) {
          this.closeModal();
        }
      }
      if ((e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) && !this.selectedMovie && !this.isSearchModalOpen) {
        const activeTagName = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (activeTagName !== 'input' && activeTagName !== 'textarea' && activeTagName !== 'select') {
          e.preventDefault();
          this.openSearchModal();
        }
      }
    });
    this.onScroll = () => {
      this.isScrolled = window.scrollY > 20;
    };
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.onScroll();
  },

  beforeUnmount() {
    this.stopHeroAutoplay();
    if (this.onScroll) {
      window.removeEventListener('scroll', this.onScroll);
    }
  }
});

app.mount('#app');
