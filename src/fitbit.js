var fitbitAccessToken;
var CLIENT_ID = '112233';
var NGROK_SUB_DOMAIN = '123456';

if (!window.location.hash) {
  window.location.replace(`https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=https%3A%2F%2F${NGROK_SUB_DOMAIN}.ngrok.io%2F&scope=activity%20nutrition%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight`);
} else {
  var fragmentQueryParameters = {};
  window.location.hash.slice(1).replace(
    new RegExp("([^?=&]+)(=([^&]*))?", "g"),
    function ($0, $1, $2, $3) { fragmentQueryParameters[$1] = $3; }
  );

  fitbitAccessToken = fragmentQueryParameters.access_token;
  document.body.innerHTML = fragmentQueryParameters;
}