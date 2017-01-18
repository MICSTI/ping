/**
 * Created by michael.stifter on 17.01.2017.
 */
Vue.component('site-item', {
    props: ['site'],
    template: '<li class="site-element">' +
                '<div class="text-bold">{{site.name}}</div>' +
                '<div>{{site.description}}</div>' +
                '<div><a target="_blank" v-bind:href="site.url">{{site.url}}</a></div>' +
                '<div class="listeners-container" v-if="site.listeners && site.listeners.length > 0">' +
                    '<div class="site-listener chip-sm" v-for="user in site.listeners">' +
                        '<div class="chip-name">{{user.username}}</div>' +
                    '</div>' +
                '</div>' +
            '</li>'
});

Vue.component('user-item', {
    props: ['user'],
    template: '<li class="user-element">' +
                '<div class="text-bold">{{user.username}}</div>' +
            '</li>'
});

var app = new Vue({
    el: '#app',
    data: {
        // active menu
        activeMenu: 'sites',

        // log in info
        auth: null,

        // modal
        modal: {
            title: "Modal title",
            content: "Modal content",
            buttons: [],
            visible: false
        },

        // all sites that are being monitored by the application
        sites: [],

        // flag to indicate if the sites are currently being loaded from the server
        sitesLoading: false,

        // all users that can be added to be notified about a site's status change
        users: [],

        // flag to indicate if the users are currently being loaded from the server
        usersLoading: false
    },
    // on created event handler
    created: function() {
        // upon load, init sites and users
        this.updateSites();
        this.updateUsers();
    },
    methods: {
        closeModal: function() {
            Vue.set(this.modal, 'visible', false);
        },
        isActive: function(state) {
            return this.activeMenu === state;
        },
        isModalVisible: function() {
            return this.modal.visible;
        },
        login: function(auth) {
            this.auth = auth;
        },
        logout: function() {
            this.auth = null;
        },
        setActive: function(state) {
            this.activeMenu = state;
        },
        // displays the login modal
        showLoginModal: function() {
            this.showModal({
                title: 'Log in',
                content: 'Please provide all your details'
            });
        },
        // sets the modal content and displays it
        showModal: function(opts) {
            Vue.set(this.modal, 'title', opts.title || "");
            Vue.set(this.modal, 'content', opts.content || "");
            Vue.set(this.modal, 'buttons', opts.buttons || [{ class: 'btn btn-primary', display: 'Ok', action: this.closeModal }]);
            Vue.set(this.modal, 'visible', true);
        },
        // gets the sites from the API and puts them in the sites array
        updateSites: function() {
            var self = this;

            self.sitesLoading = true;

            axios.get('/api/sites')
                .then(function(response) {
                    self.sites = response.data;
                    self.sitesLoading = false;
                })
                .catch(function(err) {
                    console.error(err);
                });
        },
        // gets the users from the API and puts them in the users array
        updateUsers: function() {
            var self = this;

            self.usersLoading = true;

            axios.get('/api/users')
                .then(function(response) {
                    self.users = response.data;
                    self.usersLoading = false;
                })
                .catch(function(err) {
                    console.error(err);
                });
        }
    }
});