sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/Device"
], function (Controller, Device) {
  "use strict";

  return Controller.extend("soprole.portal.controller.App", {
    onInit: function () {
      var sClass = Device.support.touch ? "sapUiSizeCozy" : "sapUiSizeCompact";
      this.getView().addStyleClass(sClass);
    }
  });
});