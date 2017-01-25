/**
 * Created by michael.stifter on 23.01.2017.
 */
var Ping = function() {

};

Ping.prototype.checkType = function(type, value) {
    if (['string', 'number', 'boolean', 'object', 'undefined'].indexOf(type.toLocaleLowerCase()) < 0) {
        throw new Error("Invalid option type '" + type + "'");
    }

    return typeof value === type.toLocaleLowerCase();
};

Ping.prototype.checkExact = function(exact, value) {
    return exact === value;
};

Ping.prototype.checkRange = function(range, value) {
    if (range.lower && !range.higher) {
        return value >= range.lower;
    } else if (!range.lower && range.higher) {
        return value <= range.higher;
    } else if (range.lower && range.higher) {
        return value >= range.lower && value <= range.higher;
    } else {
        return false;
    }
};

Ping.prototype.checkRegex = function(regexString, value) {
    var regex;

    try {
        regex = new RegExp(regexString, 'i');
    } catch (e) {
        return false;
    }

    var matches = value.match(regex);

    return matches !== null && matches.length > 0;
};

Ping.prototype.result = function(opts, value) {
    if (typeof opts === 'undefined') {
        throw new Error("Missing options parameter");
    }

    // array to store the partial results in
    var resultArray = [];

    // ------- TYPE -------
    var type = opts.type || null;

    if (type !== null) {
        resultArray.push(this.checkType(type, value));
    }

    // ------- EXACT VALUE -------
    var exact = opts.exact || null;

    if (exact !== null) {
        resultArray.push(this.checkExact(exact, value));
    }

    // ------- RANGE -------
    var range = opts.range || null;

    if (range !== null && (range.lower || range.higher)) {
        resultArray.push(this.checkRange(range, value));
    }

    // ------- REGEX -------
    var regex = opts.regex || null;

    if (regex !== null) {
        if (type === null || (type !== null && type.toLocaleLowerCase() === 'string')) {
            resultArray.push(this.checkRegex(regex, value));
        } else {
            throw new Error("When using regex the type property must be set to String");
        }
    }

    // ------- FINAL CHECK -------
    // check for 'false' values in result array
    var numberOfFalses = resultArray.filter(function(r) {
        return r === false;
    }).length;

    // return final true or false
    return numberOfFalses === 0;
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Ping;
}