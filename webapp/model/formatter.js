sap.ui.define([], function () {
  "use strict";
  function clp(value) {
    if (value === undefined || value === null || value === "") { return ""; }
    return (parseFloat(value) || 0).toFixed(2).replace(".", ",");
  }
  return {
    price: function (value) {
      if (value === undefined || value === null || value === "") { return ""; }
      return "NZD " + clp(value);
    },
    money: clp,
    lineTotal: function (price, qty) {
      return "NZD " + clp((parseFloat(price) || 0) * (parseInt(qty, 10) || 0));
    },
    suggestedEA: function (n) { return n ? "Suggested " + n + " EA" : ""; },
    bulkText: function (min, price) { return min + "+  NZD " + clp(price); },
    tagStyleClass: function (tag) {
      switch (tag) {
        case "Habitual": return "soproleTag soproleTagHabitual";
        case "Nuevo": return "soproleTag soproleTagNuevo";
        case "Pruébalo": return "soproleTag soproleTagPruebalo";
        default: return "soproleTag";
      }
    },
    has: function (v) { return !!v; },
    orderLine: function (status, lines, total) {
      return (status || "") + " · " + lines + " lines · NZD " + clp(total);
    }
  };
});