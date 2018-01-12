(function () {
    'use strict';

    angular
        .module('app.cryptopare.util.service', [])
        .factory('util', util);

    function util() {

        util.getObjectFromProperty = function (prop, value, list) {
            var lst = $.grep(list, function (e) { return e[prop] == value; });
            if (lst.length > 0)
                return lst[0];
            return undefined;
        }


        util.getCountOfDatesFromDateArray = function (date, dates) {
            var returnDates = [];
            for (var i = 0; i < dates.length; i++) {
                if (dates[i] >= date) {
                    returnDates.push(dates[i]);
                }
            }
            return returnDates.length;
        }

        util.getCountOfDatesFromMinutes = function (dates, min) {
            var a = new Date();
            if (min) {
                var dateAgo = new Date(a.getTime() - 1000 * 60 * min);
                return util.getCountOfDatesFromDateArray(dateAgo, dates);
            }
            return dates;
        }

        util.split = function (arr, n) {
            var res = [];
            while (arr.length) {
                res.push(arr.splice(0, n));
            }
            return res;
        }

        return util;
    }
})();