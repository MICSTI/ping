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

new Vue({
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
        addSite: function() {
            // show modal
            var self = this;

            this.showModal({
                title: 'Add site',
                content:    '<form>' +

                            '</form>',
                buttons: [
                    {
                        class: 'btn',
                        display: 'Cancel',
                        action: function() {
                            self.closeModal(function onClose() {

                            });
                        }
                    },
                    {
                        class: 'btn btn-primary',
                        display: 'Add site',
                        action: function() {
                            self.closeModal(function onClose() {

                            });
                        }
                    }
                ],
                onOpen: function() {
                    self.focus('username');
                }
            });
        },
        closeModal: function(cb) {
            if (cb !== undefined && typeof cb === 'function') {
                cb();
            }

            Vue.set(this.modal, 'visible', false);
        },
        // executes a function, after a defined amount of time
        executeStaggered: function(func, stagger) {
            stagger = stagger !== undefined ? stagger : 180;

            setTimeout(func, stagger);
        },
        fetchUserInfo: function() {
            var self = this;
            axios.get('/api/user')
                .then(function(response) {
                    self.auth = response.data;
                })
                .catch(function(err) {
                    console.error(err);
                    self.auth = null;
                })
        },
        // puts the focus to an input element
        focus: function(id) {
            var element = document.getElementById(id);

            if (element !== null) {
                element.focus();
            }
        },
        isActive: function(state) {
            return this.activeMenu === state;
        },
        isLoggedIn: function() {
            return this.auth !== null;
        },
        isModalVisible: function() {
            return this.modal.visible;
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
        // displays the login modal
        showLoginModal: function() {
            var self = this;

            this.showModal({
                title: 'Log in',
                content:    '<form>' +
                                '<div class="form-group">' +
                                    '<label class="form-label" for="username">Username</label>' +
                                    '<input class="form-input" type="text" id="username" placeholder="Username" value="" />' +
                                '</div>' +
                                '<div class="form-group">' +
                                    '<label class="form-label" for="password">Password</label>' +
                                    '<input class="form-input" type="password" id="password" placeholder="Password" value="" />' +
                                '</div>' +
                            '</form>',
                buttons: [
                    {
                        class: 'btn',
                        display: 'Cancel',
                        action: function() {
                            self.closeModal(function onClose() {
                                document.getElementById('username').value = '';
                                document.getElementById('password').value = '';
                            });
                        }
                    },
                    {
                        class: 'btn btn-primary',
                        display: 'Login',
                        action: function() {
                            axios.post('/api/session', {
                                username: document.getElementById('username').value,
                                password: document.getElementById('password').value
                            }).then(function(response) {
                                var jwt = response.data;

                                self.setAuthHeader(jwt);

                                self.fetchUserInfo();
                            }).catch(function(err) {
                                console.error(err);
                            });

                            self.closeModal(function onClose() {
                                document.getElementById('username').value = '';
                                document.getElementById('password').value = '';
                            });
                        }
                    }
                ],
                onOpen: function() {
                    self.focus('username');
                }
            });
        },
        setAuthHeader: function(jwt) {
            if (jwt) {
                axios.defaults.headers.common['X-Auth'] = jwt;
            } else {
                axios.defaults.headers.common['X-Auth'] = null;
            }
        },
        // sets the modal content and displays it
        showModal: function(opts) {
            Vue.set(this.modal, 'title', opts.title || "");
            Vue.set(this.modal, 'content', opts.content || "");
            Vue.set(this.modal, 'buttons', opts.buttons || [{ class: 'btn btn-primary', display: 'Ok', action: this.closeModal }]);
            Vue.set(this.modal, 'visible', true);

            if (opts.onOpen !== undefined && typeof opts.onOpen === 'function') {
                this.executeStaggered(opts.onOpen, 180);
            }
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