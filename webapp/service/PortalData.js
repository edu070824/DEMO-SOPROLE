sap.ui.define([
  "soprole/portal/service/SoapClient"
], function (SoapClient) {
  "use strict";

  var CONFIG = {
    useApim: false,                       // <-- true para datos reales vía APIM
    path: "/apim-soprole-portal",
    operation: "Z_RFC_SOPROLE_PORTAL",
    maxRows: 200
  };

  function buildBody() {
    return "<urn:" + CONFIG.operation + ">" +
      "<IV_MAX_ROWS>" + CONFIG.maxRows + "</IV_MAX_ROWS>" +
      "<ET_PRODUCTS/><ET_CATEGORIES/><ET_ORDERS/><ET_CAMPAIGNS/><ES_LOYALTY/>" +
      "</urn:" + CONFIG.operation + ">";
  }

  function mapResponse(sXml) {
    var oDoc = SoapClient.parse(sXml);
    var aProducts = SoapClient.tableRows(oDoc, "ET_PRODUCTS");

    function bySection(s) {
      return aProducts.filter(function (r) { return (r.SECTION || r.Section) === s; })
        .map(function (r) {
          return {
            Id: r.MATNR || r.ID, Name: r.MAKTX || r.NAME, Brand: r.BRAND || "",
            Price: r.PRICE || r.NETPR || "0",
            Suggested: parseInt(r.SUGGESTED || r.QTY || "0", 10) || undefined,
            Tag: r.TAG || "", ImageUrl: r.IMAGEURL || r.IMAGE || ""
          };
        });
    }

    return {
      suggested: bySection("SUGGESTED"),
      featured: bySection("FEATURED"),
      bakery: bySection("BAKERY"),
      categories: SoapClient.tableRows(oDoc, "ET_CATEGORIES").map(function (r) {
        return { Name: r.NAME, Count: parseInt(r.COUNT || "0", 10) };
      }),
      orders: SoapClient.tableRows(oDoc, "ET_ORDERS").map(function (r) {
        return { OrderId: r.ORDERID || r.VBELN, Status: r.STATUS,
                 Lines: parseInt(r.LINES || "0", 10), Total: r.TOTAL || "0" };
      }),
      campaigns: SoapClient.tableRows(oDoc, "ET_CAMPAIGNS").map(function (r) {
        return { Title: r.TITLE, Color: r.COLOR || "" };
      }),
      loyalty: (function () {
        var o = SoapClient.nodeToObject(oDoc, "ES_LOYALTY");
        return {
          Points: o.POINTS || "0", Tier: o.TIER || "", ToGoText: o.TOGOTEXT || "",
          ToGoPoints: o.TOGOPOINTS || "", Progress: parseInt(o.PROGRESS || "0", 10),
          ExpiringPoints: o.EXPIRINGPOINTS || "", ExpiringDays: parseInt(o.EXPIRINGDAYS || "0", 10),
          ChallengeName: o.CHALLENGENAME || "", ChallengePct: parseInt(o.CHALLENGEPCT || "0", 10)
        };
      })()
    };
  }

  function loadFallback() {
    var sUrl = sap.ui.require.toUrl("soprole/portal/model/portalData.json");
    return fetch(sUrl).then(function (r) { return r.json(); });
  }

  return {
    load: function () {
      if (!CONFIG.useApim) { return loadFallback(); }
      return SoapClient.post(CONFIG.path, buildBody())
        .then(mapResponse)
        .catch(function (err) { console.error("APIM/SOAP error, usando respaldo:", err); return loadFallback(); });
    }
  };
});