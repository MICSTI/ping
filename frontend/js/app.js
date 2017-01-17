/**
 * Created by michael.stifter on 17.01.2017.
 */
var app = new Vue({
    el: '#app',
    data: {
        sites: [{
            name: "evoCall Production",
            description: "The best industry 4.0 solution in the world",
            url: "https://evogeneral.evolaris.net:8765"
        }, {
            name: "evoCall Development",
            description: "The best industry 4.0 solution in the world (in development mode)",
            url: "https://evogeneral.evolaris.net:8766"
        }]
    }
});