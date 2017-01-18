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

var app = new Vue({
    el: '#app',
    data: {
        // active menu
        activeMenu: 'sites',

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
        this.updateSites();
    },
    methods: {
        isActive: function(state) {
            return this.activeMenu === state;
        },
        setActive: function(state) {
            this.activeMenu = state;
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
        }
    }
});