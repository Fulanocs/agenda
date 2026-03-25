<script>
const fechaInput = document.getElementById("fecha");
const horaSelect = document.getElementById("hora");
const listaPacientes = document.getElementById("lista-pacientes");
const agendaContainer = document.getElementById("agenda");

let turnos = [];

// ================= UTILIDADES =================

function convertirAMinutos(hora) {
  let [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function minutosAHora(min) {
  let h = Math.floor(min / 60);
  let m = min % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

// ================= LOCAL STORAGE =================

function cargarTurnos() {
  const data = localStorage.getItem('turnos');
  if (data) turnos = JSON.parse(data);
}

function guardarTurnos() {
  localStorage.setItem('turnos', JSON.stringify(turnos));
}

// ================= HORARIOS =================

function generarHoras() {
  let horas = [];
  let inicio = 8 * 60;
  let fin = 18 * 60;

  for (let i = inicio; i <= fin; i += 30) {
    horas.push(minutosAHora(i));
  }

  return horas;
}

function cargarHoras(fecha) {
  horaSelect.innerHTML = "";
  let horas = generarHoras();

  let turnosDelDia = turnos.filter(t => t.fecha === fecha);

  horas.forEach(hora => {
    let option = document.createElement("option");
    option.value = hora;
    option.textContent = hora;

    let horaMin = convertirAMinutos(hora);

    let ocupada = turnosDelDia.some(t => {
      let inicio = convertirAMinutos(t.hora);
      let fin = inicio + parseInt(t.duracion);
      return horaMin >= inicio && horaMin < fin;
    });

    if (ocupada) {
      option.disabled = true;
      option.textContent += " (Ocupado)";
    }

    horaSelect.appendChild(option);
  });

  horaSelect.disabled = false;
}

// ================= EVENTOS =================

fechaInput.addEventListener("change", () => {
  if (fechaInput.value) cargarHoras(fechaInput.value);
});

// ================= HISTORIAL =================

function actualizarHistorial() {
  listaPacientes.innerHTML = "";

  turnos.forEach(turno => {
    const div = document.createElement("div");
    div.classList.add("paciente");

    div.innerHTML = `
      <p><strong>Nombre:</strong> ${turno.nombre}</p>
      <p><strong>Fecha:</strong> ${turno.fecha}</p>
      <p><strong>Hora:</strong> ${turno.hora}</p>
      <p><strong>Duración:</strong> ${turno.duracion === '60' ? '1 hora' : '1h 30 min'}</p>
      <p><strong>Observaciones:</strong> ${turno.observaciones}</p>
    `;

    listaPacientes.appendChild(div);
  });
}

// ================= AGENDA =================

function mostrarAgendaDelDia() {
  const hoy = new Date().toISOString().split('T')[0];
  const turnosHoy = turnos.filter(t => t.fecha === hoy);

  agendaContainer.innerHTML = "";

  if (turnosHoy.length === 0) {
    agendaContainer.innerHTML = "<p>No hay turnos hoy.</p>";
    return;
  }

  turnosHoy.forEach(turno => {
    const div = document.createElement("div");
    div.classList.add("turno");

    let inicio = convertirAMinutos(turno.hora);
    let fin = inicio + parseInt(turno.duracion);

    div.innerHTML = `
      <p><strong>${turno.nombre}</strong></p>
      <p>${minutosAHora(inicio)} - ${minutosAHora(fin)}</p>
      <p>${turno.observaciones}</p>
      <button onclick="marcarAtendido('${turno.hora}')">
        ${turno.atendido ? "Atendido" : "Marcar atendido"}
      </button>
    `;

    agendaContainer.appendChild(div);
  });
}

// ================= ATENDIDO =================

function marcarAtendido(hora) {
  let t = turnos.find(x => x.hora === hora);
  if (t) {
    t.atendido = !t.atendido;
    guardarTurnos();
    mostrarAgendaDelDia();
  }
}

// ================= FORM =================

document.getElementById("form-turno").addEventListener("submit", function(e) {
  e.preventDefault();

  let nuevoInicio = convertirAMinutos(horaSelect.value);
  let duracion = parseInt(document.getElementById("duracion").value);
  let nuevoFin = nuevoInicio + duracion;

  let fecha = fechaInput.value;

  let conflicto = turnos.some(t => {
    if (t.fecha !== fecha) return false;

    let inicio = convertirAMinutos(t.hora);
    let fin = inicio + parseInt(t.duracion);

    return !(nuevoFin <= inicio || nuevoInicio >= fin);
  });

  if (conflicto) {
    alert("Ese horario se superpone con otro turno");
    return;
  }

  let turno = {
    nombre: document.getElementById("nombre").value,
    telefono: document.getElementById("telefono").value,
    observaciones: document.getElementById("observaciones").value,
    duracion: document.getElementById("duracion").value,
    fecha: fecha,
    hora: horaSelect.value,
    atendido: false
  };

  turnos.push(turno);

  alert("Turno guardado");

  guardarTurnos();
  actualizarHistorial();
  mostrarAgendaDelDia();
  cargarHoras(fecha);

  this.reset();
  horaSelect.disabled = true;
});

// ================= INIT =================

cargarTurnos();
actualizarHistorial();
mostrarAgendaDelDia();
</script>