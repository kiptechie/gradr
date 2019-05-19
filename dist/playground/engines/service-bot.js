(function(d, m){
    var kommunicateSettings = {"appId":"16da32293bf0e4abd72423e754eb5183b", "attachment" : false, "popupWidget":true,"conversationTitle":"Gradr Support","automaticChatOpenOnNavigation":true};
    var s = document.createElement("script"); s.type = "text/javascript"; s.async = true;
    s.src = "https://api.kommunicate.io/v2/kommunicate.app";
    var h = document.getElementsByTagName("head")[0]; h.appendChild(s);
    window.kommunicate = m; m._globals = kommunicateSettings;
  })(document, window.kommunicate || {});