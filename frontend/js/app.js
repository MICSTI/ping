/**
 * Created by michael.stifter on 17.01.2017.
 */
Vue.component('site-item', {
    props: ['site'],
    template: '<li class="site-element"><div class="text-bold">{{site.name}}</div><div>{{site.description}}</div><div><a target="_blank" v-bind:href="site.url">{{site.url}}</a></div></li>'
});

var app = new Vue({
    el: '#app',
    data: {
        // all sites that are being monitored by the application
        sites: [],

        // flag to indicate if the sites are currently being loaded from the server
        sitesLoading: false
    },
    // on created event handler
    created: function() {
        this.updateSites();
    },
    methods: {
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