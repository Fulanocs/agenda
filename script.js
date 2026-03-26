const fecha = document.getElementById("fecha");
const horaSelect = document.getElementById("hora");
const agenda = document.getElementById("agenda");
const lista = document.getElementById("lista-pacientes");
const duracionSelect = document.getElementById("duracion");

const filtroFecha = document.getElementById("filtro-fecha");
const buscador = document.getElementById("buscador");

let turnos = JSON.parse(localStorage.getItem("turnos")) || [];
let editandoIndex = null;

// HORAS
function generarHoras() {
  let horas = [];
  for (let h = 8; h < 21; h++) {
    horas.push(`${h.toString().padStart(2, "0")}:00`);
    horas.push(`${h.toString().padStart(2, "0")}:30`);
  }
  return horas;
}

// OCUPADAS
function horasOcupadas(fechaSel, ignorarIndex = null) {
  let ocupadas = [];

  turnos.forEach((t, i) => {
    if (t.fecha === fechaSel && i !== ignorarIndex) {
      let [h, m] = t.hora.split(":").map(Number);
      let inicio = h * 60 + m;

      for (let x = 0; x < t.duracion; x += 30) {
        let total = inicio + x;
        let hh = Math.floor(total / 60).toString().padStart(2, "0");
        let mm = (total % 60).toString().padStart(2, "0");
        ocupadas.push(`${hh}:${mm}`);
      }
    }
  });

  return ocupadas;
}

// VALIDAR
function sePisa(fechaSel, hora, duracion) {
  let ocupadas = horasOcupadas(fechaSel, editandoIndex);

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

// CARGAR HORAS
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

// AGREGAR / EDITAR
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

  if (editandoIndex !== null) {
    turnos[editandoIndex] = turno;
    editandoIndex = null;
  } else {
    turnos.push(turno);
  }

  localStorage.setItem("turnos", JSON.stringify(turnos));

  actualizarTodo();
  e.target.reset();
});

// MOSTRAR AGENDA
function mostrarAgenda() {
  agenda.innerHTML = "";

  let fechaSel = filtroFecha.value || new Date().toISOString().split("T")[0];
  let texto = buscador.value.toLowerCase();
  let ahora = new Date();

  let filtrados = turnos
    .map((t, i) => ({ ...t, index: i }))
    .filter(t => t.fecha === fechaSel && t.nombre.toLowerCase().includes(texto))
    .sort((a, b) => a.hora.localeCompare(b.hora));

  if (filtrados.length === 0) {
    agenda.innerHTML = "<p>No hay turnos.</p>";
    return;
  }

  filtrados.forEach(t => {
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
      <button class="btn-editar">Editar</button>
      <button class="btn-eliminar">Eliminar</button>
    `;

    // compartir
    div.querySelector(".btn-compartir").onclick = () => {
     let texto = `Turno confirmado:
Nombre: ${t.nombre}
Fecha: ${t.fecha}
Hora: ${t.hora}
Duración: ${t.duracion == 60 ? "1 hora" : "1 hora 30 min"}
Observación: ${t.observaciones || "Sin observaciones"}`;

      navigator.share
        ? navigator.share({ text: texto })
        : alert(texto);
    };

    // editar
    div.querySelector(".btn-editar").onclick = () => {
      nombre.value = t.nombre;
      telefono.value = t.telefono;
      observaciones.value = t.observaciones;
      duracion.value = t.duracion;
      fecha.value = t.fecha;

      editandoIndex = t.index;

      cargarHoras();
      setTimeout(() => horaSelect.value = t.hora, 100);
    };

    // eliminar
    div.querySelector(".btn-eliminar").onclick = () => {
      if (confirm("¿Eliminar turno?")) {
        turnos.splice(t.index, 1);
        localStorage.setItem("turnos", JSON.stringify(turnos));
        actualizarTodo();
      }
    };

    agenda.appendChild(div);
  });
}

// HISTORIAL
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

// ACTUALIZAR
function actualizarTodo() {
  cargarHoras();
  mostrarAgenda();
  mostrarHistorial();
}

// EVENTOS
fecha.addEventListener("change", actualizarTodo);
duracionSelect.addEventListener("change", cargarHoras);
filtroFecha.addEventListener("change", mostrarAgenda);
buscador.addEventListener("input", mostrarAgenda);

// INICIO
let hoy = new Date().toISOString().split("T")[0];
fecha.value = hoy;
filtroFecha.value = hoy;

actualizarTodo();
