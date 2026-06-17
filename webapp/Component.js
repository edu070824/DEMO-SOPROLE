sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel",
  "soprole/portal/model/models",
  "soprole/portal/service/PortalData"
], function (UIComponent, JSONModel, models, PortalData) {
  "use strict";

  return UIComponent.extend("soprole.portal.Component", {
    metadata: { manifest: "json" },

    init: function () {
      UIComponent.prototype.init.apply(this, arguments);
      this.setModel(models.createDeviceModel(), "device");
      this.setModel(new JSONModel({ items: [], count: 0, total: "0.00", empty: true }), "cart");
      this.setModel(new JSONModel({ query: "", category: "", sort: "nameAsc", page: "home", catView: "grid" }), "view"); 

      var oModel = new JSONModel({});
      this.setModel(oModel);
      PortalData.load().then(function (oData) { oModel.setData(oData); });

      this.getRouter().initialize();
    }
  });
});