const usuarios = [
  { user: "admin", pass: "snixy" }
];

login-form.onsubmit = e => {
  e.preventDefault();

  let u = usuario.value;
  let p = password.value;

  let ok = usuarios.find(x => x.user === u && x.pass === p);

  if (ok) {
    localStorage.setItem("usuarioActivo", u);
    location.href = "agenda.html";
  } else {
    alert("Error");
  }
};