const { createApp } = Vue;

const API_BASE = '/api';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const TOKEN_KEY = 'cinevault_token';
const DEFAULT_RECENT_SEARCHES = ['vincenzo', 'inception', 'interstellar'];

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
      recentSearches: DEFAULT_RECENT_SEARCHES.map(query => ({ id: null, query })),
      authToken: null,
      user: null,
      isAuthModalOpen: false,
      authMode: 'login',
      authMessage: '',
      authForm: { name: '', email: '', password: '', password_confirmation: '' },
      authErrors: {},
      authLoading: false,
      pendingAction: null,
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
    isLoggedIn() {
      return !!this.user;
    },

    userInitial() {
      return this.user && this.user.name ? this.user.name.trim().charAt(0).toUpperCase() : '?';
    },

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
    async api(path, { method = 'GET', body } = {}) {
      const headers = { Accept: 'application/json' };
      if (body !== undefined) headers['Content-Type'] = 'application/json';
      if (this.authToken) headers.Authorization = `Bearer ${this.authToken}`;

      const response = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined
      });

      let data = null;
      if (response.status !== 204) {
        try {
          data = await response.json();
        } catch (e) {
          data = null;
        }
      }

      if (!response.ok) {
        if (response.status === 401 && this.authToken) {
          this.clearSession();
          this.showToastNotification('Your session expired. Please sign in again.', 'info');
        }
        const error = new Error((data && data.message) || `Request failed (${response.status})`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    },

    async fetchMovies() {
      this.loading = true;
      this.error = null;
      this.activeSearchQuery = '';

      try {
        const data = await this.api(`/movies/category/${this.currentCategory}?page=1`);
        this.movies = data.results || [];
        this.heroSlideIndex = 0;
        this.startHeroAutoplay();
      } catch (err) {
        console.error('Movie API Error:', err);
        this.error = 'Could not load movies. Make sure the CineVault backend is running and try again.';
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

      try {
        const data = await this.api(`/movies/search?query=${encodeURIComponent(query)}`);
        this.movies = data.results || [];
      } catch (err) {
        console.error('Movie Search Error:', err);
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
      // Genre, rating and sort filters run in the browser, so only a different list needs a reload.
      const needsReload = !!this.activeSearchQuery
        || this.currentCategory !== 'popular'
        || this.movies.length === 0
        || !!this.error;

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
      
      if (needsReload) {
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
      const filtered = this.recentSearches.filter(s => s.query.toLowerCase() !== q.toLowerCase());
      this.recentSearches = [{ id: null, query: q }, ...filtered].slice(0, 6);
      this.saveLocalStorage();

      if (this.isLoggedIn) {
        this.api('/recent-searches', { method: 'POST', body: { query: q } })
          .then(list => { this.recentSearches = list; })
          .catch(err => console.warn('Failed to save recent search:', err));
      }

      this.closeSearchModal();
      this.searchMovies();
    },

    async loadRecentSearches() {
      try {
        this.recentSearches = await this.api('/recent-searches');
      } catch (err) {
        console.warn('Failed to load recent searches:', err);
      }
    },

    clearRecentSearches() {
      this.recentSearches = [];
      this.saveLocalStorage();
      if (this.isLoggedIn) {
        this.api('/recent-searches', { method: 'DELETE' }).catch(() => this.loadRecentSearches());
      }
    },

    removeRecentSearch(item) {
      this.recentSearches = this.recentSearches.filter(s => s !== item);
      this.saveLocalStorage();
      if (this.isLoggedIn && item.id) {
        this.api(`/recent-searches/${item.id}`, { method: 'DELETE' }).catch(() => this.loadRecentSearches());
      }
    },

    clearSearch() {
      this.searchQuery = '';
      this.activeSearchQuery = '';
      this.closeSearchModal();
      this.fetchMovies();
    },

    async fetchGenres() {
      try {
        const data = await this.api('/genres');
        this.genres = data.genres || this.genres;
      } catch (err) {
        console.warn('Failed to load genres:', err);
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

      try {
        const data = await this.api(`/movies/${movie.id}`);
        this.selectedMovie = data;
        this.movieCredits = data.credits || null;
        this.movieVideos = (data.videos && data.videos.results) ? data.videos.results : [];
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

    requireAuth(action, message = 'Sign in to save movies to your account.') {
      if (this.isLoggedIn) return true;
      this.pendingAction = action;
      this.openAuthModal('login', message);
      return false;
    },

    moviePayload(movie) {
      return {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path || null,
        backdrop_path: movie.backdrop_path || null,
        overview: movie.overview || null,
        vote_average: typeof movie.vote_average === 'number' ? movie.vote_average : null,
        popularity: typeof movie.popularity === 'number' ? movie.popularity : null,
        release_date: movie.release_date || null,
        genre_ids: movie.genre_ids || (movie.genres || []).map(g => g.id)
      };
    },

    async loadWatchlist() {
      const { data } = await this.api('/watchlist');
      this.watchlist = data;
      this.watchStatusMap = Object.fromEntries(data.map(m => [m.id, m.status]));
    },

    async loadFavorites() {
      const { data } = await this.api('/favorites');
      this.favorites = data;
    },

    async loadSettings() {
      const settings = await this.api('/settings');
      this.darkMode = !!settings.dark_mode;
      this.updateThemeClass();
      this.saveLocalStorage();
    },

    async loadUserData() {
      const results = await Promise.allSettled([
        this.loadWatchlist(),
        this.loadFavorites(),
        this.loadRecentSearches(),
        this.loadSettings()
      ]);
      results
        .filter(r => r.status === 'rejected')
        .forEach(r => console.warn('Failed to load account data:', r.reason));
    },

    async addToWatchlist(movie) {
      if (!this.requireAuth(() => this.addToWatchlist(movie))) return;
      if (this.isInWatchlist(movie)) return;

      this.watchlist.push(movie);
      this.watchStatusMap[movie.id] = 'plan_to_watch';
      this.showToastNotification(`"${movie.title}" added to your watchlist`, 'success');

      try {
        await this.api('/watchlist', { method: 'POST', body: this.moviePayload(movie) });
      } catch (err) {
        this.watchlist = this.watchlist.filter(m => m.id !== movie.id);
        delete this.watchStatusMap[movie.id];
        this.showToastNotification(`Could not add "${movie.title}" to your watchlist`, 'error');
      }
    },

    async removeFromWatchlist(movie) {
      const index = this.watchlist.findIndex(m => m.id === movie.id);
      if (index === -1) return;

      const [removed] = this.watchlist.splice(index, 1);
      const previousStatus = this.watchStatusMap[movie.id];
      delete this.watchStatusMap[movie.id];
      this.showToastNotification(`"${movie.title}" removed from watchlist`, 'remove');

      try {
        await this.api(`/watchlist/${movie.id}`, { method: 'DELETE' });
      } catch (err) {
        if (err.status === 404) return;
        this.watchlist.splice(index, 0, removed);
        this.watchStatusMap[movie.id] = previousStatus;
        this.showToastNotification(`Could not remove "${movie.title}" from your watchlist`, 'error');
      }
    },

    toggleWatchlist(movie) {
      if (this.isInWatchlist(movie)) {
        this.removeFromWatchlist(movie);
      } else {
        this.addToWatchlist(movie);
      }
    },

    async toggleFavorite(movie) {
      if (!this.requireAuth(() => this.toggleFavorite(movie), 'Sign in to save your favorite movies.')) return;

      const index = this.favorites.findIndex(m => m.id === movie.id);
      if (index !== -1) {
        const [removed] = this.favorites.splice(index, 1);
        this.showToastNotification(`Removed "${movie.title}" from favorites`, 'remove');
        try {
          await this.api(`/favorites/${movie.id}`, { method: 'DELETE' });
        } catch (err) {
          if (err.status === 404) return;
          this.favorites.splice(index, 0, removed);
          this.showToastNotification(`Could not remove "${movie.title}" from favorites`, 'error');
        }
      } else {
        this.favorites.push(movie);
        this.showToastNotification(`Added "${movie.title}" to favorites`, 'favorite');
        try {
          await this.api('/favorites', { method: 'POST', body: this.moviePayload(movie) });
        } catch (err) {
          this.favorites = this.favorites.filter(m => m.id !== movie.id);
          this.showToastNotification(`Could not add "${movie.title}" to favorites`, 'error');
        }
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

    async setWatchStatus(movieId, status) {
      const previous = this.watchStatusMap[movieId];
      this.watchStatusMap[movieId] = status;
      const label = this.getWatchStatusLabel(status);
      this.showToastNotification(`Status updated to: ${label}`, 'info');

      try {
        await this.api(`/watchlist/${movieId}`, { method: 'PATCH', body: { status } });
      } catch (err) {
        this.watchStatusMap[movieId] = previous;
        this.showToastNotification('Could not update the status. Please try again.', 'error');
      }
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

    async clearCompletedWatchlist() {
      const completed = this.watchlist.filter(m => this.watchStatusMap[m.id] === 'completed');
      if (completed.length === 0) return;

      this.watchlist = this.watchlist.filter(m => this.watchStatusMap[m.id] !== 'completed');
      completed.forEach(m => delete this.watchStatusMap[m.id]);
      this.showToastNotification(`Removed ${completed.length} completed movies from watchlist`, 'remove');

      try {
        await this.api('/watchlist/completed', { method: 'DELETE' });
      } catch (err) {
        await this.loadWatchlist().catch(() => {});
        this.showToastNotification('Could not clear completed movies. Please try again.', 'error');
      }
    },

    setCategory(categoryKey) {
      this.currentCategory = categoryKey;
      this.activeTab = 'discover';
      this.clearSearch();
    },

    openAuthModal(mode = 'login', message = '') {
      this.authMode = mode;
      this.authMessage = message;
      this.authErrors = {};
      this.authForm = { name: '', email: '', password: '', password_confirmation: '' };
      this.isAuthModalOpen = true;
      this.closeMobileMenu();
      this.closeDropdowns();
      this.closeSearchModal();
      this.focusAuthInput();
    },

    closeAuthModal() {
      this.isAuthModalOpen = false;
      this.pendingAction = null;
    },

    switchAuthMode(mode) {
      this.authMode = mode;
      this.authErrors = {};
      this.focusAuthInput();
    },

    focusAuthInput() {
      this.$nextTick(() => {
        const input = document.getElementById(this.authMode === 'register' ? 'auth-name' : 'auth-email');
        if (input) input.focus();
      });
    },

    authError(field) {
      const messages = this.authErrors[field];
      return messages && messages.length ? messages[0] : '';
    },

    startSession(token, user) {
      this.authToken = token;
      this.user = user;
      try {
        localStorage.setItem(TOKEN_KEY, token);
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
    },

    clearSession() {
      this.authToken = null;
      this.user = null;
      this.watchlist = [];
      this.favorites = [];
      this.watchStatusMap = {};
      this.watchlistFilter = 'all';
      this.recentSearches = this.readGuestRecentSearches();
      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch (e) {
        console.warn('LocalStorage remove error:', e);
      }
    },

    async submitAuth() {
      if (this.authLoading) return;
      this.authLoading = true;
      this.authErrors = {};

      const isRegister = this.authMode === 'register';
      const body = isRegister
        ? { ...this.authForm }
        : { email: this.authForm.email, password: this.authForm.password };

      try {
        const data = await this.api(isRegister ? '/register' : '/login', { method: 'POST', body });
        this.startSession(data.token, data.user);

        if (isRegister) {
          this.api('/settings', { method: 'PUT', body: { dark_mode: this.darkMode } }).catch(() => {});
        }

        const action = this.pendingAction;
        this.pendingAction = null;
        this.isAuthModalOpen = false;
        this.authForm = { name: '', email: '', password: '', password_confirmation: '' };
        this.showToastNotification(`Welcome${isRegister ? '' : ' back'}, ${data.user.name}!`, 'success');

        await this.loadUserData();
        if (action) action();
      } catch (err) {
        if (err.status === 422 && err.data && err.data.errors) {
          this.authErrors = err.data.errors;
        } else {
          this.authErrors = { form: [err.message || 'Something went wrong. Please try again.'] };
        }
      } finally {
        this.authLoading = false;
      }
    },

    async logout() {
      this.closeDropdowns();
      this.closeMobileMenu();
      try {
        await this.api('/logout', { method: 'POST' });
      } catch (err) {
        console.warn('Logout request failed:', err);
      }
      this.clearSession();
      this.showToastNotification('You have been logged out', 'info');
    },

    async restoreSession() {
      let token = null;
      try {
        token = localStorage.getItem(TOKEN_KEY);
      } catch (e) {
        console.warn('LocalStorage load error:', e);
      }
      if (!token) return;

      this.authToken = token;
      try {
        this.user = await this.api('/user');
        await this.loadUserData();
      } catch (err) {
        console.warn('Could not restore session:', err);
      }
    },

    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      this.updateThemeClass();
      this.saveLocalStorage();
      if (this.isLoggedIn) {
        this.api('/settings', { method: 'PUT', body: { dark_mode: this.darkMode } }).catch(() => {});
      }
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

    readGuestRecentSearches() {
      try {
        const saved = JSON.parse(localStorage.getItem('cinevault_recent_searches'));
        if (Array.isArray(saved)) {
          return saved.filter(q => typeof q === 'string').map(query => ({ id: null, query }));
        }
      } catch (e) {
        console.warn('LocalStorage load error:', e);
      }
      return DEFAULT_RECENT_SEARCHES.map(query => ({ id: null, query }));
    },

    loadLocalStorage() {
      try {
        const savedDarkMode = localStorage.getItem('cinevault_dark_mode');
        if (savedDarkMode !== null) {
          this.darkMode = savedDarkMode === 'true';
        }
      } catch (e) {
        console.warn('LocalStorage load error:', e);
      }
      this.recentSearches = this.readGuestRecentSearches();
    },

    saveLocalStorage() {
      try {
        localStorage.setItem('cinevault_dark_mode', this.darkMode.toString());
        if (!this.isLoggedIn) {
          localStorage.setItem('cinevault_recent_searches', JSON.stringify(this.recentSearches.map(s => s.query)));
        }
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
    this.restoreSession();

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.custom-dropdown-container')) {
        this.closeDropdowns();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.isAuthModalOpen) {
          this.closeAuthModal();
        } else if (this.isMobileMenuOpen) {
          this.closeMobileMenu();
        } else if (this.activeDropdown) {
          this.closeDropdowns();
        } else if (this.isSearchModalOpen) {
          this.closeSearchModal();
        } else if (this.selectedMovie) {
          this.closeModal();
        }
      }
      if ((e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) && !this.selectedMovie && !this.isSearchModalOpen && !this.isAuthModalOpen) {
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
