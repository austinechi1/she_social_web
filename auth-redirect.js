(function () {
  var hash = window.location.hash || '';
  var authMatch = hash.match(/^#(invite_token|recovery_token|confirmation_token|email_change_token)=([^&]+)/);
  if (authMatch) {
    var key = authMatch[1];
    var value = authMatch[2];
    window.location.replace('/admin/?' + key + '=' + encodeURIComponent(value));
  }
})();
