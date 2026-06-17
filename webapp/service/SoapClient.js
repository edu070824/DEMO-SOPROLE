sap.ui.define([], function () {
  "use strict";

  // Cliente SOAP sobre HTTP — mismo patrón que tu onListarDirecto de Deudores.
  return {
    post: function (sPath, sBody, sNamespace) {
      var sNs = sNamespace || "urn:sap-com:document:sap:rfc:functions";
      var sEnvelope =
        '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" ' +
        'xmlns:urn="' + sNs + '">' +
          '<soapenv:Header/>' +
          '<soapenv:Body>' + sBody + '</soapenv:Body>' +
        '</soapenv:Envelope>';

      return fetch(sPath, {
        method: "POST",
        headers: { "Content-Type": "text/xml" },
        body: sEnvelope
      }).then(function (res) {
        return res.text().then(function (text) {
          if (!res.ok) { throw new Error("HTTP " + res.status + " - " + text); }
          return text;
        });
      });
    },

    parse: function (sXml) {
      return new DOMParser().parseFromString(sXml, "text/xml");
    },

    tableRows: function (oDoc, sTableTag) {
      var aTables = oDoc.getElementsByTagName(sTableTag);
      if (!aTables.length) { return []; }
      var aItems = aTables[0].getElementsByTagName("item");
      var aRows = [];
      for (var i = 0; i < aItems.length; i++) {
        var oRow = {}, aKids = aItems[i].children;
        for (var j = 0; j < aKids.length; j++) { oRow[aKids[j].tagName] = aKids[j].textContent; }
        aRows.push(oRow);
      }
      return aRows;
    },

    nodeToObject: function (oDoc, sTag) {
      var aFound = oDoc.getElementsByTagName(sTag);
      if (!aFound.length) { return {}; }
      var oObj = {}, aKids = aFound[0].children;
      for (var j = 0; j < aKids.length; j++) { oObj[aKids[j].tagName] = aKids[j].textContent; }
      return oObj;
    }
  };
});