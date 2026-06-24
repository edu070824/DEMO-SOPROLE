sap.ui.define([
  "soprole/portal/controller/BaseController",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/Sorter"
], function (BaseController, Filter, FilterOperator, Sorter) {
  "use strict";

  /*
   * Como portalData.json no tiene campo "Category" en cada producto,
   * usamos este mapeo temporal para que las categorías funcionen.
   * Más adelante lo ideal es agregar "Category" directamente a cada producto.
   */
  var mCategoryDemoIds = {
    "Mundo Yoghurt": ["c1"],
    "Quesos & Especialidades": ["c2", "c3"],
    "Block Cheese": ["c3"],
    "Shredded / Grated Cheese": ["c3"],
    "Functional Yoghurt": ["c1"],
    "Specialty Yellow Cheese": ["c2", "c3"],
    "UHT Flavoured Milk": ["c4", "b1", "p6"],
    "Fresh White Milk": ["c4", "b1", "p6"],
    "Mainstream Yoghurt": ["c1"],
    "Specialty White Mould Cheese": ["c2", "c3"],
    "Butter": ["c4"],
    "Premium / Gourmet Yoghurt": ["c1"],
    "Natural / Authentic Yoghurt": ["c1"],
    "Processed Cheese": ["c2"]
  };

  return BaseController.extend("soprole.portal.controller.Catalog", {

    onInit: function () {
      this.getRouter()
        .getRoute("RouteCatalog")
        .attachPatternMatched(this._onMatched, this);
    },

    _onMatched: function () {
      var oVM = this.getViewModel();

      oVM.setProperty("/page", "catalog");

      if (!oVM.getProperty("/catView")) {
        oVM.setProperty("/catView", "grid");
      }

      if (!oVM.getProperty("/sort")) {
        oVM.setProperty("/sort", "nameAsc");
      }

      this._apply();
    },

    _apply: function () {
      var oVM = this.getViewModel();
      var v = oVM.getData();
      var aF = [];

      /*
       * Filtro por categoría.
       * Primero intenta por campo Category.
       * Luego usa los Ids temporales del mapeo mCategoryDemoIds.
       */
      if (v.category) {
        var aCategoryFilters = [];

        aCategoryFilters.push(
          new Filter("Category", FilterOperator.Contains, v.category)
        );

        var aIds = mCategoryDemoIds[v.category] || [];

        aIds.forEach(function (sId) {
          aCategoryFilters.push(
            new Filter("Id", FilterOperator.EQ, sId)
          );
        });

        if (aCategoryFilters.length > 0) {
          aF.push(new Filter({
            filters: aCategoryFilters,
            and: false
          }));
        }
      }

      /*
       * Filtro por buscador.
       */
      if (v.query) {
        aF.push(new Filter({
          filters: [
            new Filter("Name", FilterOperator.Contains, v.query),
            new Filter("Brand", FilterOperator.Contains, v.query),
            new Filter("Id", FilterOperator.Contains, v.query),
            new Filter("Tag", FilterOperator.Contains, v.query)
          ],
          and: false
        }));
      }

      /*
       * Ordenamiento.
       */
      var fnPriceComparator = function (a, b) {
        return (parseFloat(a) || 0) - (parseFloat(b) || 0);
      };

      var mSorters = {
        nameAsc: new Sorter("Name", false),
        nameDesc: new Sorter("Name", true),
        priceAsc: new Sorter("Price", false, false, fnPriceComparator),
        priceDesc: new Sorter("Price", true, false, fnPriceComparator)
      };

      /*
       * Aplicar filtro y orden tanto a la grilla como a la lista.
       */
      ["catalogGrid", "catalogList"].forEach(function (sId) {
        var oControl = this.byId(sId);

        if (!oControl) {
          return;
        }

        var oBinding = oControl.getBinding("items");

        if (oBinding) {
          oBinding.filter(aF);
          oBinding.sort(mSorters[v.sort] || mSorters.nameAsc);
        }
      }.bind(this));
    },

    onSearch: function (oEvent) {
      var sQuery = oEvent.getParameter("newValue");

      if (sQuery === undefined) {
        sQuery = oEvent.getParameter("query") || "";
      }

      this.getViewModel().setProperty("/query", sQuery);
      this._apply();
    },

    onCategoryPress: function (oEvent) {
      var oSource = oEvent.getParameter("listItem") || oEvent.getSource();

      var sCat =
        oSource.getTitle && oSource.getTitle() ||
        oSource.getText && oSource.getText() ||
        "";

      var oVM = this.getViewModel();

      if (sCat === "All products") {
        oVM.setProperty("/category", "");
      } else if (sCat === "Suggested order") {
        oVM.setProperty("/category", "");
      } else {
        oVM.setProperty("/category", sCat);
      }

      this._apply();
    },

    onSortChange: function (oEvent) {
      var oSelectedItem = oEvent.getParameter("selectedItem");

      if (oSelectedItem) {
        this.getViewModel().setProperty("/sort", oSelectedItem.getKey());
        this._apply();
      }
    },

    onNavHome: function () {
      this.getRouter().navTo("RouteHome");
    }

  });
});