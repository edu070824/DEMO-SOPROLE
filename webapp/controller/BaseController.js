sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/Fragment",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "soprole/portal/model/formatter"
], function (Controller, Fragment, MessageToast, MessageBox, formatter) {
  "use strict";

  return Controller.extend("soprole.portal.controller.BaseController", {
    formatter: formatter,

    getRouter: function () {
      return this.getOwnerComponent().getRouter();
    },

    getCartModel: function () {
      return this.getOwnerComponent().getModel("cart");
    },

    getViewModel: function () {
      return this.getOwnerComponent().getModel("view");
    },

    onNavHome: function () {
      this.getRouter().navTo("RouteHome");
    },

    onNavCatalog: function () {
      this.getViewModel().setProperty("/category", "");
      this.getRouter().navTo("RouteCatalog");
    },

    onNavCart: function () {
      this.getRouter().navTo("RouteCart");
    },

    onAdd: function (oEvent) {
      var oCtx = oEvent.getSource().getBindingContext();

      if (oCtx) {
        this.addToCart(oCtx.getObject(), 1);
      }
    },

    onAddProduct: function (oEvent) {
      var oCtx = oEvent.getSource().getBindingContext();

      if (oCtx) {
        this.addToCart(oCtx.getObject(), oCtx.getProperty("Qty") || 1);
      }
    },

    onQtyPlus: function (oEvent) {
      var oCtx = oEvent.getSource().getBindingContext();

      if (!oCtx) {
        return;
      }

      oCtx.getModel().setProperty(
        oCtx.getPath() + "/Qty",
        (oCtx.getProperty("Qty") || 1) + 1
      );
    },

    onQtyMinus: function (oEvent) {
      var oCtx = oEvent.getSource().getBindingContext();

      if (!oCtx) {
        return;
      }

      oCtx.getModel().setProperty(
        oCtx.getPath() + "/Qty",
        Math.max(1, (oCtx.getProperty("Qty") || 1) - 1)
      );
    },

    addToCart: function (oProduct, iQty) {
      iQty = iQty || 1;

      var oModel = this.getCartModel();
      var oData = oModel.getData();

      if (!oData.items) {
        oData.items = [];
      }

      var oFound = oData.items.filter(function (it) {
        return it.Id === oProduct.Id;
      })[0];

      if (oFound) {
        oFound.Qty += iQty;
      } else {
        oData.items.push({
          Id: oProduct.Id,
          Name: oProduct.Name,
          Brand: oProduct.Brand,
          Price: parseFloat(oProduct.Price) || 0,
          Qty: iQty,
          ImageUrl: oProduct.ImageUrl
        });
      }

      this._recompute(oData);
      oModel.setData(oData);

      MessageToast.show(iQty + "\u00d7 " + oProduct.Name + " added to cart");
    },

    _recompute: function (oData) {
      var c = 0;
      var t = 0;

      if (!oData.items) {
        oData.items = [];
      }

      oData.items.forEach(function (it) {
        c += parseInt(it.Qty, 10) || 0;
        t += (parseFloat(it.Price) || 0) * (parseInt(it.Qty, 10) || 0);
      });

      var d = t >= 150 ? 8 : 0;
      var net = Math.max(t - d, 0);
      var vat = net * 0.19;
      var grand = net + vat;

      oData.count = c;
      oData.subtotal = t;
      oData.discount = d;
      oData.netSubtotal = net;
      oData.vat = vat;
      oData.grandTotal = grand;

      oData.total = grand.toFixed(2).replace(".", ",");
      oData.empty = oData.items.length === 0;
    },

    /*
     * Antes este método abría el popup Cart.fragment.xml.
     * Ahora navega a la página completa del carrito: #/cart
     */
    onOpenCart: function () {
      this.getRouter().navTo("RouteCart");
    },

    onCloseCart: function () {
      if (this._pCart) {
        this._pCart.then(function (oDialog) {
          oDialog.close();
        });
      }
    },

    onCartPlus: function (oEvent) {
      this._changeCartQty(oEvent, 1);
    },

    onCartMinus: function (oEvent) {
      this._changeCartQty(oEvent, -1);
    },

    _changeCartQty: function (oEvent, iDelta) {
      var oContext = oEvent.getSource().getBindingContext("cart");

      if (!oContext) {
        return;
      }

      var sId = oContext.getProperty("Id");
      var oModel = this.getCartModel();
      var oData = oModel.getData();

      if (!oData.items) {
        oData.items = [];
      }

      oData.items.forEach(function (it) {
        if (it.Id === sId) {
          it.Qty = Math.max(1, (parseInt(it.Qty, 10) || 1) + iDelta);
        }
      });

      this._recompute(oData);
      oModel.setData(oData);
    },

    onCartRemove: function (oEvent) {
      var oContext = oEvent.getSource().getBindingContext("cart");

      if (!oContext) {
        return;
      }

      var sId = oContext.getProperty("Id");
      var oModel = this.getCartModel();
      var oData = oModel.getData();

      if (!oData.items) {
        oData.items = [];
      }

      oData.items = oData.items.filter(function (it) {
        return it.Id !== sId;
      });

      this._recompute(oData);
      oModel.setData(oData);

      MessageToast.show("Producto eliminado");
    },

    onOpenLoyalty: function () {
      var oView = this.getView();

      if (!this._pLoy) {
        this._pLoy = Fragment.load({
          id: oView.getId(),
          name: "soprole.portal.view.Loyalty",
          controller: this
        }).then(function (oDialog) {
          oView.addDependent(oDialog);
          return oDialog;
        });
      }

      this._pLoy.then(function (oDialog) {
        oDialog.open();
      });
    },

    onCloseLoyalty: function () {
      if (this._pLoy) {
        this._pLoy.then(function (oDialog) {
          oDialog.close();
        });
      }
    },

    onCheckout: function () {
      var oModel = this.getCartModel();
      var oData = oModel.getData();

      if (!oData.items || !oData.items.length) {
        MessageToast.show("Your cart is empty");
        return;
      }

      MessageBox.success(
        "Simulated order for NZD " + oData.total + " (" + oData.count + " units).\n" +
        "Connect this to your Z_RFC_CREAR_PEDIDO over SOAP to make it real.",
        {
          title: "Order placed",
          onClose: function () {
            oData.items = [];
            this._recompute(oData);
            oModel.setData(oData);
            this.onCloseCart();
          }.bind(this)
        }
      );
    },

onOpenUserMenu: function (oEvent) {
  var oView = this.getView();
  var oButton = oEvent.getSource();

  if (!this._pUserMenu) {
    this._pUserMenu = Fragment.load({
      id: oView.getId(),
      name: "soprole.portal.view.UserMenu",
      controller: this
    }).then(function (oPopover) {
      oView.addDependent(oPopover);
      return oPopover;
    });
  }

  this._pUserMenu.then(function (oPopover) {
    oPopover.openBy(oButton);
  });
},

onMyAccountButtonPress: function () {
    MessageToast.show("My account");
},

onMyOrdersButtonPress: function () {
    MessageToast.show("My orders");
},

onLogoutButtonPress: function () {
    MessageToast.show("Logout");
}


  });
});