/**
 * Created by michael.stifter on 17.01.2017.
 */
Vue.component('site-item', {
    props: ['site', 'isLoggedIn'],
    methods: {
        getMaintenanceStatus: function(site) {
            return site.maintenance === true ? '<span class="bold color-red">Maintenance mode is on</span><br/>Site is currently not being monitored' : 'Maintenance mode is off';
        },
        getSiteStatus: function(site) {
            return "status-" + site.status;
        },
        getStatusTitle: function(site) {
            switch (site.status) {
                case "ok":
                    return "Everything ok";
                case "fail":
                    return "Something is not alright";
                case "null":
                default:
                    return "No status info available right now. Maybe set status to active?";
            }
        },
        getUserNotifyTitle: function(user) {
            return user.username + " will be notified about changes to this site status";
        },
        onMaintenanceStatusChanged: function(site) {
            console.log('maintenance status changed', site.maintenance);
        }
    },
    template: '<li class="site-element clearfix">' +
                '<div class="site-element-status-container">' +
                    // status indicator
                    '<span class="site-element-status-indicator" v-bind:class="getSiteStatus(site)" v-bind:title="getStatusTitle(site)"></span>' +

                    // maintenance mode switch
                    '<div class="form-group" v-if="isLoggedIn() && site.active === true">' +
                        '<label class="form-switch">' +
                            '<input type="checkbox" v-model="site.maintenance" v-on:change="onMaintenanceStatusChanged(site)" />' +
                            '<i class="form-icon switch-right"></i>' +
                        '</label>' +
                    '</div>' +
                    '<div class="site-element-maintenance-status" v-if="isLoggedIn() && site.active === true" v-html="getMaintenanceStatus(site)"></div>' +
                '</div>' +

                '<div>' +
                    '<span class="site-element-title">{{site.name}}</span>' +
                    '<span class="label label-danger" v-if="!site.active">Not active</span>' +
                '</div>' +
                '<div class="site-element-description">{{site.description}}</div>' +
                '<div class="site-element-url"><a target="_blank" v-bind:href="site.url">{{site.url}}</a></div>' +
                '<div class="listeners-container" v-if="site.notify && site.notify.length > 0">' +
                    '<div class="site-listener chip-sm" v-for="user in site.notify">' +
                        '<div class="chip-name" v-bind:title="getUserNotifyTitle(user)">{{user.username}}</div>' +
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

        // form validation
        formValidation: {
            'addSite': {
                display: false,
                fields: {
                    'name': {
                        is: 'required',
                        valid: null
                    },
                    'description': {
                        is: 'required',
                        valid: null
                    }
                }
            }
        },

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
        siteInfo: {
            name: '',
            description: '',
            url: '',
            active: false,
            notify: [],
            config: {}
        },

        // all sites that are being monitored by the application
        sites: [],

        // flag to indicate if the sites are currently being loaded from the server
        sitesLoading: false,

        // toast (notification)
        toast: {
            message: '',
            type: '',
            visible: false
        },

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
        checkFormValidity: function(formId) {
            var form = this.formValidation[formId];

            var formValid = true;

            if (!form) {
                throw new Error("No form with ID '" + formId + "' declared in formValidation object");
            }

            if (form.fields !== undefined) {
                var formFields = Object.keys(form.fields);

                if (formFields.length > 0) {
                    formFields.forEach(function(field) {
                        if (form.fields.hasOwnProperty(field)) {
                            var elem = document.getElementById(field);

                            if (!elem) {
                                throw new Error("No input element with ID '" + field + "' found in form " + formId);
                            }

                            var validator = form.fields[field];

                            if (!validator || validator.is === undefined || validator.valid === undefined) {
                                throw new Error("Validation object with ID '" + field + "' is malformed");
                            }

                            switch (validator.is) {
                                case 'required':
                                    validator.valid = elem.value.trim() !== "";

                                    // set global valid flag to false if this element is invalid
                                    if (!validator.valid) {
                                        formValid = false;
                                    }

                                    break;

                                default:
                                    throw new Error("Illegal value for validator.is: " + validator.is);
                            }
                        }
                    });
                }
            }

            // after the first check, display the error/success messages
            vm.formValidation[formId].display = true;

            return formValid;
        },
        closeModal: function(cb) {
            if (cb !== undefined && typeof cb === 'function') {
                cb();
            }

            Vue.set(this.modal, 'visible', false);

            // clear form validation messages
            if (this.formValidation[this.activeModal]) {
                this.formValidation[this.activeModal].display = false;
            }

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
            this.toast.visible = false;
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
        onSiteMaintenanceStatusChanged: function(site) {

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

            switch(id) {
                case 'login':
                    Vue.set(this.modal, 'title', "Log in");

                    this.executeStaggered(function() {
                        vm.focus('username');
                    }, 180);

                    break;

                case 'addSite':
                    this.modal.title = 'Add site';

                    this.siteInfo = {
                        name: '',
                        description: '',
                        url: '',
                        active: false,
                        notify: [],
                        config: {}
                    };

                    this.executeStaggered(function() {
                        vm.focus('name');

                        // JSON editor
                        var container = document.getElementById('config');
                        var options = {
                            mode: 'code',
                            indentation: 2
                        };

                        vm.monitorConfigEditor = new JSONEditor(container, options);
                        vm.monitorConfigJson = vm.monitorConfigDefault;
                        vm.monitorConfigEditor.set(vm.monitorConfigJson);

                        // form validation

                        var inputElements = document.getElementsByClassName('form-input');
                        var inputElementLength = inputElements.length;

                        for (var i = 0; i < inputElementLength; i++) {
                            var element = inputElements[i];

                            if (element) {
                                element.addEventListener('blur', function() {
                                    if (vm.formValidation[vm.activeModal] && vm.formValidation[vm.activeModal].display === true) {
                                        vm.checkFormValidity(vm.activeModal);
                                    }
                                });
                            }
                        }
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

            // default timeout is 2.5 seconds (if set to zero or a negative value toast will not disappear automatically)
            var displayDuration = opts.timeout || 2500;

            if (displayDuration > 0) {
                setTimeout(vm.hideToast, displayDuration);
            }
        },
        // performs the submit of the login form
        submitLogin: function() {
            axios.post('/api/session', {
                username: this.loginInfo.username,
                password: this.loginInfo.password
            }).then(function(response) {
                var jwt = response.data;

                vm.setAuthHeader(jwt);

                vm.fetchUserInfo(function(err) {
                    if (err) {
                        // login not successful
                        vm.showToast('Failed to log in', {
                            type: 'toast-danger',
                            timeout: 2500
                        });
                    }

                    vm.showToast('Logged in successfully', {
                        type: 'toast-success',
                        timeout: 2500
                    });
                });


            }).catch(function(err) {
                console.error(err);

                // login not successful
                vm.showToast('Failed to log in', {
                    type: 'toast-danger',
                    timeout: 2500
                });
            });

            vm.closeModal();

            // clear login info
            vm.loginInfo.username = null;
            vm.loginInfo.password = null;
        },
        submitAddSite: function() {
            // check if form is valid
            if (!this.checkFormValidity('addSite')) {
                return;
            }

            // get the config value from the JSON editor
            this.siteInfo.config = this.monitorConfigEditor.get(this.monitorConfigJson);

            axios.post('/api/sites', this.siteInfo).then(function(response) {
                vm.showToast('Successfully saved new site', {
                    type: 'toast-success',
                    timeout: 2500
                });

                vm.updateSites();
            }).catch(function(err) {
                console.error(err);

                vm.showToast('Could not save site', {
                    type: 'toast-danger',
                    timeout: 2500
                });

                vm.updateSites();
            });

            vm.closeModal();
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
            this.usersLoading = true;

            axios.get('/api/users')
                .then(function(response) {
                    vm.users = response.data;
                    vm.usersLoading = false;
                })
                .catch(function(err) {
                    console.error(err);
                });
        }
    }
});