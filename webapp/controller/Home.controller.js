sap.ui.define([
  "soprole/portal/controller/BaseController",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], function (BaseController, Filter, FilterOperator) {
  "use strict";
  var GRID_IDS = ["gridSuggested", "gridFeatured", "gridBakery"];
  return BaseController.extend("soprole.portal.controller.Home", {
    onInit: function () { this.getViewModel().setProperty("/page", "home"); },
    onSearch: function (oEvent) {
      var sQuery = oEvent.getParameter("newValue");
      if (sQuery === undefined) { sQuery = oEvent.getParameter("query") || ""; }
      var aFilters = sQuery ? [new Filter({
        filters: [ new Filter("Name", FilterOperator.Contains, sQuery),
                   new Filter("Brand", FilterOperator.Contains, sQuery) ], and: false
      })] : [];
      GRID_IDS.forEach(function (sId) {
        var oB = this.byId(sId) && this.byId(sId).getBinding("items");
        if (oB) { oB.filter(aFilters); }
      }.bind(this));
    },
    onCategoryPress: function (oEvent) {

    var oSource = oEvent.getParameter("listItem") || oEvent.getSource();

    this.getViewModel().setProperty("/category", oSource.getTitle());

    this.getRouter().navTo("RouteCatalog");
}
  });
});