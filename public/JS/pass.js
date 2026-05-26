function ShowpassWord() {
  var x = document.getElementById("pEyar");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}
