var eventsMediator = {
    events: {},
    on: function (eventName, callbackfn) {
        this.events[eventName] = this.events[eventName]
            ? this.events[eventName]
            : [];
        this.events[eventName].push(callbackfn);
    },
    emit: function (eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(function (callBackfn) {
                callBackfn(data);
            });
        }
    },
};
var statsModule = {
    data: [],
    topRated: {},
    init() {
        this.$statsTemplate = $('#stats-template');
        this.$statsTarget = $('#stats-target');
        eventsMediator.on('page-changed', (data) => {
            this.data = data;
            this.findTopRated();
            this.render();
        });
    },
    findTopRated() {
        this.topRated = this.data[0];
        this.data.forEach((movie) => {
            if (movie.vote_average > this.topRated.vote_average)
                this.topRated = movie;
        })
    },
    render() {
        const template = this.$statsTemplate.html();
        const rendered = Mustache.render(template, { currentPage: moviesModule.currentPage, numberOfMovies: this.data.length, topRated: this.topRated });
        this.$statsTarget.html(rendered);
    }
}
var moviesModule = {
    data: [],
    currentPage: 1,
    clickedMovie: {},
    init() {
        this.$moviesTemplate = $('#movie-card-template');
        this.$moviesTarget = $('#movies-target');
        this.$modalTemplate = $('#modal-template');
        this.$modalTarget = $('#modal-target');
        eventsMediator.on('page-changed', () => {
            this.render();
            this.assignOnClick();
        });
        this.fetchPage(this.currentPage)
            .then(() => eventsMediator.emit('page-changed', this.data))
    },
    assignOnClick() {
        this.$movieCards = $('.movie');
        this.$movieCards.each((i, card) => {
            $(card).on('click', () => this.handleCardClick(this.data[i]))
        })
    },
    handleCardClick(movie) {
        this.clickedMovie = movie;
        this.renderModal();
    },
    renderModal() {
        const template = this.$modalTemplate.html();
        const rendered = Mustache.render(template, { movie: this.clickedMovie });
        this.$modalTarget.html(rendered);
        this.$modalTarget.find('button').on('click', this.removeModal.bind(moviesModule));
    },
    removeModal() {
        this.$modalTarget.html('');
    },
    fetchPage(pageNumber) {
        return new Promise((resovle, reject) =>
            fetch('https://api.themoviedb.org/3/trending/movie/week?api_key=f76591075c97e67b7c90de9185ffb80a&page=' + pageNumber)
                .then((response) => response.json())
                .then((data) => this.data = data.results)
                .then(resovle)
                .catch(reject)
        )
    },
    next() {
        this.currentPage++;
        this.fetchPage(this.currentPage)
            .then(() => eventsMediator.emit('page-changed', this.data));
    },
    prev() {
        if (this.currentPage == 1)
            return;
        this.currentPage--;
        this.fetchPage(this.currentPage)
            .then(() => eventsMediator.emit('page-changed', this.data));
    },
    render() {

        const template = this.$moviesTemplate.html();
        const rendered = Mustache.render(template, { movies: this.data });
        this.$moviesTarget.html(rendered);

    }
}
moviesModule.init();
statsModule.init();