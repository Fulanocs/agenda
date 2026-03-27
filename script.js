const fecha = document.getElementById("fecha");
const horaSelect = document.getElementById("hora");
const agenda = document.getElementById("agenda");
const lista = document.getElementById("lista-pacientes");
const duracionSelect = document.getElementById("duracion");

const filtroFecha = document.getElementById("filtro-fecha");
const buscador = document.getElementById("buscador");

let turnos = JSON.parse(localStorage.getItem("turnos")) || [];
let editandoIndex = null;

// 🔥 UTILIDADES
function horaAMinutos(hora) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function minutosAHora(min) {
  let h = Math.floor(min / 60).toString().padStart(2, "0");
  let m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function formatearFecha(f) {
  let [a, m, d] = f.split("-");
  return `${d}/${m}/${a}`;
}

// 🕐 HORAS
function generarHoras() {
  let horas = [];
  for (let h = 8; h < 21; h++) {
    horas.push(`${String(h).padStart(2, "0")}:00`);
    horas.push(`${String(h).padStart(2, "0")}:30`);
  }
  return horas;
}

// 🔒 OCUPADAS
function horasOcupadas(fechaSel, ignorar = null) {
  let ocupadas = [];

  turnos.forEach((t, i) => {
    if (t.fecha === fechaSel && i !== ignorar) {
      let inicio = horaAMinutos(t.hora);

      for (let x = 0; x < t.duracion; x += 30) {
        ocupadas.push(minutosAHora(inicio + x));
      }
    }
  });

  return ocupadas;
}

// 🚫 VALIDAR
function sePisa(fechaSel, hora, duracion) {
  let ocupadas = horasOcupadas(fechaSel, editandoIndex);
  let inicio = horaAMinutos(hora);

  for (let i = 0; i < duracion; i += 30) {
    if (ocupadas.includes(minutosAHora(inicio + i))) return true;
  }

  return false;
}

// ⏰ CARGAR HORAS
function cargarHoras() {
  horaSelect.innerHTML = "";

  let duracion = parseInt(duracionSelect.value) || 60;

  generarHoras().forEach(h => {
    let op = document.createElement("option");
    op.value = h;
    op.textContent = h;

    if (sePisa(fecha.value, h, duracion)) {
      op.disabled = true;
      op.textContent += " ❌";
    }

    horaSelect.appendChild(op);
  });
}

// ➕ GUARDAR
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

// 🚀 BUSCADOR ULTRA RÁPIDO
let timeout;
buscador.addEventListener("input", () => {
  clearTimeout(timeout);
  timeout = setTimeout(mostrarAgenda, 200); // debounce
});

// 📋 AGENDA
function mostrarAgenda() {
  agenda.innerHTML = "";

  let fechaSel = filtroFecha.value;
  let texto = buscador.value.toLowerCase();

  let filtrados = turnos
    .map((t, i) => ({ ...t, index: i }))
    .filter(t =>
      t.fecha === fechaSel &&
      t.nombre.toLowerCase().includes(texto)
    )
    .sort((a, b) => a.hora.localeCompare(b.hora));

  filtrados.forEach(t => {
    let div = document.createElement("div");
    div.className = "turno";

    let ahora = new Date();
    let turnoDate = new Date(`${t.fecha}T${t.hora}`);
    let diff = (turnoDate - ahora) / 60000;

    if (diff < 30 && diff > 0) div.classList.add("proximo");
    if (diff <= 0) div.classList.add("pasado");

    div.innerHTML = `
      <strong>${t.hora}</strong> - ${t.nombre}<br>
      ${t.duracion} min<br>
      ${t.observaciones || ""}

      <button class="btn-compartir">Compartir</button>
      <button class="btn-editar">Editar</button>
      <button class="btn-eliminar">Eliminar</button>
    `;

    // compartir
    div.querySelector(".btn-compartir").onclick = () => {
      let mensaje = `📅 Turno confirmado
Nombre: ${t.nombre}
Fecha: ${formatearFecha(t.fecha)}
Hora: ${t.hora}
Duración: ${t.duracion} min`;

      navigator.share
        ? navigator.share({ text: mensaje })
        : alert(mensaje);
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

// 📜 HISTORIAL
function mostrarHistorial() {
  lista.innerHTML = "";

  [...turnos]
    .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
    .forEach(t => {
      let div = document.createElement("div");
      div.textContent = `${t.nombre} - ${t.fecha} ${t.hora}`;
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
filtroFecha.addEventListener("change", mostrarAgenda);

// INIT
let hoy = new Date().toISOString().split("T")[0];
fecha.value = hoy;
filtroFecha.value = hoy;

actualizarTodo();
