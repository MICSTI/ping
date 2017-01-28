/**
 * Created by michael.stifter on 17.01.2017.
 */
Vue.component('site-item', {
    props: ['site'],
    template: '<li class="site-element">' +
                '<div class="text-bold">{{site.name}}</div>' +
                '<div>{{site.description}}</div>' +
                '<div><a target="_blank" v-bind:href="site.url">{{site.url}}</a></div>' +
                '<div class="listeners-container" v-if="site.notify && site.notify.length > 0">' +
                    '<div class="site-listener chip-sm" v-for="user in site.notify">' +
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

var vm = new Vue({
    el: '#app',
    data: {
        // active menu
        activeMenu: 'sites',

        // active modal
        activeModal: null,

        // monitor config JSON editor
        monitorConfigEditor: null,
        monitorConfigDefault: {
            "url": "https://westworld.com/api/version",
            "method": "GET",
            "body": null,
            "headers": {
                "X-Auth": "JWT_TOKEN"
            },
            "settings": {
                "intervalInMinutes": 1,
                "notifyAfterXFailures": 1,
                "addRandomParameter": false
            },
            "response": {
                "status": 200,
                "type": "json",
                "data": {
                    "version": {
                        "type": "String",
                        "regex": "^[0-9]+\\.[0-9]+\\.[0-9]+$",
                        "showInSummary": true,
                        "name": "Version",
                        "description": "The version identifier of the current API build"
                    },
                    "buildNumber": {
                        "type": "Number",
                        "range": {
                            "higher": 11
                        },
                        "showInSummary": false
                    },
                    "theAnswer": {
                        "type": "Number",
                        "exact": 42
                    },
                    "error": {
                        "type": "undefined"
                    }
                }
            }
        },
        monitorConfigJson: null,

        // log in info
        auth: null,
        loginInfo: {
            username: null,
            password: null
        },

        // modal
        modal: {
            title: "Modal title",
            visible: false
        },

        // for add/edit site modal
        siteInfo: {},

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
        addSite: function() {

        },
        closeModal: function(cb) {
            if (cb !== undefined && typeof cb === 'function') {
                cb();
            }

            Vue.set(this.modal, 'visible', false);

            this.activeModal = null;
        },
        // executes a function, after a defined amount of time
        executeStaggered: function(func, stagger) {
            stagger = stagger !== undefined ? stagger : 180;

            setTimeout(func, stagger);
        },
        fetchUserInfo: function(cb) {
            var self = this;
            axios.get('/api/user')
                .then(function(response) {
                    self.auth = response.data;

                    if (cb !== undefined && typeof cb === 'function') {
                        cb(null);
                    }
                })
                .catch(function(err) {
                    console.error(err);
                    self.auth = null;

                    if (cb !== undefined && typeof cb === 'function') {
                        cb(err);
                    }
                })
        },
        // puts the focus to an input element
        focus: function(id) {
            var element = document.getElementById(id);

            if (element !== null) {
                element.focus();
            }
        },
        hideToast: function() {
            var self = this;

            Vue.set(this.toast, 'visible', false);

            vm.$forceUpdate();
        },
        isActive: function(state) {
            return this.activeMenu === state;
        },
        isLoggedIn: function() {
            return this.auth !== null;
        },
        isModal: function(state) {
            return this.activeModal === state;
        },
        isModalVisible: function() {
            return this.modal.visible;
        },
        isToastVisible: function() {
            return this.toast.visible;
        },
        login: function(auth) {
            this.auth = auth;
        },
        logout: function() {
            this.auth = null;
            this.setAuthHeader(null);
        },
        setActive: function(state) {
            this.activeMenu = state;
        },
        setAuthHeader: function(jwt) {
            if (jwt) {
                axios.defaults.headers.common['X-Auth'] = jwt;
            } else {
                axios.defaults.headers.common['X-Auth'] = null;
            }
        },
        // sets the modal content and displays it
        showModal: function(id) {
            if (id === undefined) {
                throw new Error('Cannot open modal without id');
            }

            var self = this;

            switch(id) {
                case 'login':
                    Vue.set(this.modal, 'title', "Log in");

                    this.executeStaggered(function() {
                        self.focus('username');
                    }, 180);

                    break;

                case 'addSite':
                    Vue.set(this.modal, 'title', "Add site");

                    this.executeStaggered(function() {
                        self.focus('name');

                        // JSON editor
                        var container = document.getElementById('config');
                        var options = {
                            mode: 'code',
                            indentation: 2
                        };
                        self.monitorConfigEditor = new JSONEditor(container, options);

                        self.monitorConfigJson = self.monitorConfigDefault;

                        self.monitorConfigEditor.set(self.monitorConfigJson);
                    }, 180);

                    break;

                default:
                    throw new Error("Modal with id '" + id + "' is not defined");
            }

            this.activeModal = id;

            Vue.set(this.modal, 'visible', true);
        },
        // displays a toast on the screen for a certain amount of time
        showToast: function(message, opts) {
            Vue.set(this.toast, 'message', message);
            Vue.set(this.toast, 'type', opts.type || 'toast-success');
            Vue.set(this.toast, 'visible', true);

            vm.$forceUpdate();

            // default timeout is 1 second (if set to zero or a negative value toast will not disappear automatically)
            var displayDuration = opts.timeout || 2500;

            if (displayDuration > 0) {
                setTimeout(this.hideToast, displayDuration);
            }
        },
        // performs the submit of the login form
        submitLogin: function() {
            var self = this;

            axios.post('/api/session', {
                username: this.loginInfo.username,
                password: this.loginInfo.password
            }).then(function(response) {
                var jwt = response.data;

                self.setAuthHeader(jwt);

                self.fetchUserInfo(function(err) {
                    if (err) {
                        // login not successful
                        self.showToast('Failed to log in', {
                            type: 'toast-danger'
                        });
                    }

                    self.showToast('Logged in successfully', {
                        type: 'toast-success',
                        timeout: 2500
                    });
                });
            }).catch(function(err) {
                console.error(err);

                // login not successful
                self.showToast('Failed to log in', {
                    type: 'toast-danger',
                    timeout: 2500
                });
            });

            // clear login info
            this.loginInfo.username = null;
            this.loginInfo.password = null;

            self.closeModal();
        },
        submitAddSite: function() {
            var self = this;

            Vue.set(this.siteInfo, 'config', this.monitorConfigEditor.get(this.monitorConfigJson));

            axios.post('/api/sites', this.siteInfo).then(function(response) {
                self.closeModal(function() {
                    self.siteInfo = null;
                });

                self.showToast('Successfully saved new site', {
                    type: 'toast-success',
                    timeout: 2500
                });

                self.updateSites();
            }).catch(function(err) {
                console.error(err);

                self.closeModal(function() {
                    self.siteInfo = null;
                });

                self.showToast('Could not save site', {
                    type: 'toast-danger',
                    timeout: 2500
                });

                self.updateSites();
            });

            self.closeModal();
        },
        toast: {
            type: null,
            message: null,
            visible: false
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