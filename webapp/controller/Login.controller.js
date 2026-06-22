sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("soprole.portal.controller.Login", {

        onLoginButtonPress: function () {
            var sEmail = this.byId("loginEmail").getValue();
            var sPassword = this.byId("loginPassword").getValue();

            if (sEmail === "buyer1@example.com" && sPassword === "soprole") {
                this.getOwnerComponent().getRouter().navTo("RouteHome");
            } else {
                MessageToast.show("Email o contraseña incorrectos.");
            }
        }

    });
});