sap.ui.define([
  "soprole/portal/controller/BaseController",
  "sap/m/MessageToast"
], function (BaseController, MessageToast) {
  "use strict";

  return BaseController.extend("soprole.portal.controller.Cart", {

    onInit: function () {
      this.getRouter()
        .getRoute("RouteCart")
        .attachPatternMatched(this._onMatched, this);
    },

    _onMatched: function () {
      this._recalculate();
    },

    _getCartModel: function () {
      return this.getView().getModel("cart");
    },

    _recalculate: function () {
      var oCartModel = this._getCartModel();

      if (!oCartModel) {
        return;
      }

      var aItems = oCartModel.getProperty("/items") || [];

      var fSubtotal = aItems.reduce(function (fTotal, oItem) {
        var fPrice = parseFloat(oItem.Price) || 0;
        var iQty = parseInt(oItem.Qty, 10) || 0;

        return fTotal + (fPrice * iQty);
      }, 0);

      var fDiscount = fSubtotal >= 150 ? 8 : 0;
      var fNetSubtotal = Math.max(fSubtotal - fDiscount, 0);
      var fVat = fNetSubtotal * 0.19;
      var fGrandTotal = fNetSubtotal + fVat;

      oCartModel.setProperty("/subtotal", fSubtotal);
      oCartModel.setProperty("/discount", fDiscount);
      oCartModel.setProperty("/netSubtotal", fNetSubtotal);
      oCartModel.setProperty("/vat", fVat);
      oCartModel.setProperty("/grandTotal", fGrandTotal);
      oCartModel.setProperty("/total", this._formatNumber(fGrandTotal));
      oCartModel.setProperty("/empty", aItems.length === 0);
    },

    _getItemContext: function (oEvent) {
      return oEvent.getSource().getBindingContext("cart");
    },

    onCartPlus: function (oEvent) {
      var oContext = this._getItemContext(oEvent);

      if (!oContext) {
        return;
      }

      var oCartModel = this._getCartModel();
      var sPath = oContext.getPath();
      var iQty = parseInt(oCartModel.getProperty(sPath + "/Qty"), 10) || 0;

      oCartModel.setProperty(sPath + "/Qty", iQty + 1);
      this._recalculate();
    },

    onCartMinus: function (oEvent) {
      var oContext = this._getItemContext(oEvent);

      if (!oContext) {
        return;
      }

      var oCartModel = this._getCartModel();
      var sPath = oContext.getPath();
      var iQty = parseInt(oCartModel.getProperty(sPath + "/Qty"), 10) || 0;

      if (iQty <= 1) {
        this.onCartRemove(oEvent);
        return;
      }

      oCartModel.setProperty(sPath + "/Qty", iQty - 1);
      this._recalculate();
    },

    onCartRemove: function (oEvent) {
      var oContext = this._getItemContext(oEvent);

      if (!oContext) {
        return;
      }

      var oCartModel = this._getCartModel();
      var sPath = oContext.getPath();
      var oItem = oContext.getObject();
      var aItems = oCartModel.getProperty("/items") || [];

      aItems = aItems.filter(function (oProduct) {
        return oProduct.Id !== oItem.Id;
      });

      oCartModel.setProperty("/items", aItems);
      this._recalculate();

      MessageToast.show("Producto eliminado");
    },

    onClearCart: function () {
      var oCartModel = this._getCartModel();

      if (!oCartModel) {
        return;
      }

      oCartModel.setProperty("/items", []);
      this._recalculate();

      MessageToast.show("Carrito limpiado");
    },

    onCheckout: function () {
      MessageToast.show("Checkout en desarrollo");
    },

    onNavHome: function () {
      this.getRouter().navTo("RouteHome");
    },

    onNavCatalog: function () {
      this.getRouter().navTo("RouteCatalog");
    },

    onNavCart: function () {
      this.getRouter().navTo("RouteCart");
    },

    onOpenCart: function () {
      this.getRouter().navTo("RouteCart");
    },

    formatMoney: function (vValue) {
      var fValue = parseFloat(vValue) || 0;

      return "NZD " + this._formatNumber(fValue);
    },

    formatDiscount: function (vValue) {
      var fValue = parseFloat(vValue) || 0;

      if (fValue <= 0) {
        return "NZD 0,00";
      }

      return "-NZD " + this._formatNumber(fValue);
    },

    formatLineTotal: function (vPrice, vQty) {
      var fPrice = parseFloat(vPrice) || 0;
      var iQty = parseInt(vQty, 10) || 0;

      return "NZD " + this._formatNumber(fPrice * iQty);
    },

    _formatNumber: function (vValue) {
      var fValue = parseFloat(vValue) || 0;

      return fValue.toLocaleString("es-PE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }

  });
});