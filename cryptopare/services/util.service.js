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

        util.sleep = function (ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        util.intersect = function (a, b) {
            var t;
            if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
            return a.filter(function (e) {
                return b.indexOf(e) > -1;
            });
        }

        util.clone = function (existingArray) {
            var newObj = (existingArray instanceof (Array)) ? [] : {};
            for (var i in existingArray) {
                if (i == 'clone') continue;
                if (existingArray[i] && typeof (existingArray[i]) == "object") {
                    newObj[i] = util.clone(existingArray[i]);
                } else {
                    newObj[i] = existingArray[i]
                }
            }
            return newObj;
        }

        util.intersect = function (array, property) {
            // var aux = util.clone(array);
            // var result = aux.shift().filter(function (v) {
            //     return aux.every(function (a) {
            //         return a.map(function(elem){
            //             return elem[property];
            //         }).indexOf(v[property]) !== -1;
            //     });
            // });
            // if (result) {
            //     return result;
            // }
            // return undefined;
            var result = array.filter(function (obj1) {
                return array.some(function (obj2) {
                    return obj1 != obj2 &&
                        obj2[property] === obj1[property];
                });
            });
            return result;
        }

        util.groupBy = function (collection, property) {
            var i = 0, val, index,
                values = [], result = [];
            for (; i < collection.length; i++) {
                val = collection[i][property];
                index = values.indexOf(val);
                if (index > -1)
                    result[index].push(collection[i]);
                else {
                    values.push(val);
                    result.push([collection[i]]);
                }
            }
            return result.filter(function (arr) {
                return arr.length > 1;
            });
        }

        util.variationOfMarkets = function (a, b, nameMarketA, nameMarketB) {
            a.forEach(function (elem) {
                var elemB = util.getObjectFromProperty('nome', elem.nome, b);
                if (elemB) {
                    elem[nameMarketA + "Para" + nameMarketB] = {
                        compra: elem.pedido,
                        venda: elemB.ofertado,
                        variacao: ((elemB.ofertado - elem.pedido) / elem.pedido) * 100,
                    };
                    elem[nameMarketB + "Para" + nameMarketA] = {
                        compra: elemB.pedido,
                        venda: elem.ofertado,
                        variacao: ((elem.ofertado - elemB.pedido) / elemB.pedido) * 100,
                    };
                }
            });
            return a.map(function (e) {
                if (util.getObjectFromProperty('nome', e.nome, b)) {
                    return e;
                }
                return null;
            }).filter(function (ee) {
                return ee != null;
            });
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
            var aux = arr.slice(0);
            while (aux.length) {
                res.push(aux.splice(0, n));
            }
            return res;
        }

        return util;
    }
})();