var fitbitAccessToken;
var CLIENT_ID = '22CYSG';
var EXPIRES_IN = 31536000;

if (!window.location.hash) {
  window.location.replace(`https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=https%3A%2F%2Falincode.github.io%2Fdevon4&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=${EXPIRES_IN}`);
} else {
  var fragmentQueryParameters = {};
  window.location.hash.slice(1).replace(
    new RegExp("([^?=&]+)(=([^&]*))?", "g"),
    function ($0, $1, $2, $3) { fragmentQueryParameters[$1] = $3; }
  );

  fitbitAccessToken = fragmentQueryParameters.access_token;
  document.body.innerHTML = fragmentQueryParameters;
}

var processResponse = function (res) {
  if (!res.ok) {
    throw new Error('Fitbit API request failed: ' + res);
  }

  var contentType = res.headers.get('content-type')
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return res.json();
  } else {
    throw new Error('JSON expected but received ' + contentType);
  }
}

var getProfile = function(profile) {
  console.log(profile.user.age);
  return profile;
}

fetch(
  'https://api.fitbit.com/1/user/-/profile.json',
  {
    headers: new Headers({
      'Authorization': 'Bearer ' + fitbitAccessToken
    }),
    mode: 'cors',
    method: 'GET'
  }
).then(processResponse)
  .then(getProfile)
  .catch(function (error) {
    console.error(error);
  });