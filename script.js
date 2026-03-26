const fechaInput = document.getElementById("fecha");
const horaSelect = document.getElementById("hora");
const lista = document.getElementById("lista-pacientes");

let turnos = JSON.parse(localStorage.getItem("turnos")) || [];

function guardar() {
  localStorage.setItem("turnos", JSON.stringify(turnos));
}

// Generar horas disponibles
function generarHoras() {
  const fecha = fechaInput.value;
  horaSelect.innerHTML = "";

  for (let h = 8; h < 21; h++) {
    for (let m of [0, 30]) {

      let hora = (h < 10 ? "0" + h : h) + ":" + (m === 0 ? "00" : "30");

      if (!estaOcupado(fecha, hora)) {
        let opt = document.createElement("option");
        opt.value = hora;
        opt.textContent = hora;
        horaSelect.appendChild(opt);
      }
    }
  }
}

// Convertir hora a minutos
function aMinutos(hora) {
  let [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

// Verificar si se pisa
function estaOcupado(fecha, horaNueva) {
  let inicioNuevo = aMinutos(horaNueva);

  return turnos.some(t => {
    if (t.fecha !== fecha) return false;

    let inicio = aMinutos(t.hora);
    let fin = inicio + parseInt(t.duracion);

    return (inicioNuevo >= inicio && inicioNuevo < fin);
  });
}

// Agendar turno
function agendar() {
  const fecha = fechaInput.value;
  const hora = horaSelect.value;
  const nombre = document.getElementById("nombre").value;
  const obs = document.getElementById("obs").value;
  const duracion = document.getElementById("duracion").value;

  if (!fecha || !hora || !nombre) {
    alert("Completa todo");
    return;
  }

  turnos.push({ fecha, hora, nombre, obs, duracion });
  guardar();
  mostrar();
  generarHoras();
}

// Mostrar turnos
function mostrar() {
  lista.innerHTML = "";

  turnos.forEach((t, i) => {
    let li = document.createElement("li");
    li.innerHTML = `
      ${t.fecha} - ${t.hora} (${t.duracion} min)
      <br><b>${t.nombre}</b>
      <br>${t.obs}
      <br>
      <button onclick="eliminar(${i})">Eliminar</button>
    `;
    lista.appendChild(li);
  });
}

// Eliminar turno
function eliminar(i) {
  turnos.splice(i, 1);
  guardar();
  mostrar();
  generarHoras();
}

// Actualizar horas al cambiar fecha
fechaInput.addEventListener("change", generarHoras);

mostrar();