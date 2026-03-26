const fecha = document.getElementById("fecha");
const horaSelect = document.getElementById("hora");
const agenda = document.getElementById("agenda");
const lista = document.getElementById("lista-pacientes");
const duracionSelect = document.getElementById("duracion");

let turnos = JSON.parse(localStorage.getItem("turnos")) || [];

// 🔹 HORAS
function generarHoras() {
  let horas = [];
  for (let h = 8; h < 21; h++) {
    horas.push(`${h.toString().padStart(2, "0")}:00`);
    horas.push(`${h.toString().padStart(2, "0")}:30`);
  }
  return horas;
}

// 🔹 OCUPADAS
function horasOcupadas(fecha) {
  let ocupadas = [];

  turnos.filter(t => t.fecha === fecha).forEach(t => {
    let [h, m] = t.hora.split(":").map(Number);
    let inicio = h * 60 + m;

    for (let i = 0; i < t.duracion; i += 30) {
      let total = inicio + i;
      let hh = Math.floor(total / 60).toString().padStart(2, "0");
      let mm = (total % 60).toString().padStart(2, "0");
      ocupadas.push(`${hh}:${mm}`);
    }
  });

  return ocupadas;
}

// 🔴 VALIDAR SOLAPAMIENTO
function sePisa(fechaSel, hora, duracion) {
  let ocupadas = horasOcupadas(fechaSel);

  let [h, m] = hora.split(":").map(Number);
  let inicio = h * 60 + m;

  for (let i = 0; i < duracion; i += 30) {
    let total = inicio + i;
    let hh = Math.floor(total / 60).toString().padStart(2, "0");
    let mm = (total % 60).toString().padStart(2, "0");

    if (ocupadas.includes(`${hh}:${mm}`)) return true;
  }

  return false;
}

// 🔹 CARGAR HORAS
function cargarHoras() {
  horaSelect.innerHTML = "";

  let horas = generarHoras();
  let duracion = parseInt(duracionSelect.value);

  horas.forEach(h => {
    let op = document.createElement("option");
    op.value = h;
    op.textContent = h;

    if (sePisa(fecha.value, h, duracion)) {
      op.disabled = true;
      op.textContent += " (ocupado)";
    }

    horaSelect.appendChild(op);
  });
}

// 🔥 AGENDAR
document.getElementById("form-turno").addEventListener("submit", e => {
  e.preventDefault();

  let turno = {
    nombre: nombre.value,
    telefono: telefono.value,
    observaciones: observaciones.value,
    duracion: parseInt(duracion.value),
    fecha: fecha.value,
    hora: hora.value
  };

  turnos.push(turno);
  localStorage.setItem("turnos", JSON.stringify(turnos));

  actualizarTodo();
  e.target.reset();
});

// 🔹 MOSTRAR AGENDA
function mostrarAgenda() {
  agenda.innerHTML = "";

  let hoy = new Date().toISOString().split("T")[0];
  let ahora = new Date();

  let hoyTurnos = turnos
    .filter(t => t.fecha === hoy)
    .sort((a, b) => a.hora.localeCompare(b.hora));

  hoyTurnos.forEach(t => {
    let div = document.createElement("div");
    div.className = "turno";

    let fechaHora = new Date(`${t.fecha}T${t.hora}`);
    let diff = (fechaHora - ahora) / 60000;

    if (diff <= 30 && diff > 0) div.classList.add("proximo");
    if (diff <= 0) div.classList.add("pasado");

    div.innerHTML = `
      <strong>${t.hora}</strong> - ${t.nombre}<br>
      ${t.duracion == 60 ? "1h" : "1h 30m"}<br>
      ${t.observaciones || ""}
      <button class="btn-compartir">Compartir</button>
    `;

    // 📲 COMPARTIR
    div.querySelector(".btn-compartir").addEventListener("click", () => {
      let texto = `Turno confirmado:
Paciente: ${t.nombre}
Fecha: ${t.fecha}
Hora: ${t.hora}
Duración: ${t.duracion == 60 ? "1h" : "1h 30m"}`;

      if (navigator.share) {
        navigator.share({ text: texto });
      } else {
        navigator.clipboard.writeText(texto);
        alert("Copiado para compartir");
      }
    });

    agenda.appendChild(div);
  });
}

// 🔹 HISTORIAL
function mostrarHistorial() {
  lista.innerHTML = "";

  let ordenados = [...turnos].sort((a, b) =>
    (a.fecha + a.hora).localeCompare(b.fecha + b.hora)
  );

  ordenados.forEach(t => {
    let div = document.createElement("div");
    div.innerHTML = `${t.nombre} - ${t.fecha} ${t.hora}`;
    lista.appendChild(div);
  });
}

// 🔄 ACTUALIZAR
function actualizarTodo() {
  cargarHoras();
  mostrarAgenda();
  mostrarHistorial();
}

// EVENTOS
fecha.addEventListener("change", actualizarTodo);
duracionSelect.addEventListener("change", cargarHoras);

// INICIO
let hoy = new Date().toISOString().split("T")[0];
fecha.value = hoy;

actualizarTodo();
