document.getElementById("send").addEventListener("click", function () {
  var n = document.getElementById("n").value.trim(),
    e = document.getElementById("e").value.trim(),
    m = document.getElementById("m").value.trim(),
    s = document.getElementById("status");

  if (!n || !e || !m) {
    s.textContent = "Fill in your name, email and message first.";
    return;
  }

  var body = encodeURIComponent(m + "\n\nFrom: " + n + " (" + e + ")");
  window.location.href =
    "mailto:you@example.com?subject=" +
    encodeURIComponent("Portfolio message from " + n) +
    "&body=" +
    body;
  s.textContent = "Opening your email app…";
});
