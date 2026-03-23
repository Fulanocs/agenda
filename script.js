const fechaInput = document.getElementById("fecha");
const horaSelect = document.getElementById("hora");
const listaPacientes = document.getElementById("lista-pacientes"); // Contenedor del historial
const agendaContainer = document.getElementById("agenda"); // Contenedor de la agenda del día

let turnos = []; // Aquí se guardarán los turnos

// Función para cargar los turnos desde el localStorage
function cargarTurnos() {
  const turnosGuardados = localStorage.getItem('turnos');
  if (turnosGuardados) {
    turnos = JSON.parse(turnosGuardados); // Parsear la cadena JSON y cargar los turnos
  }
}

// Guardar los turnos en el localStorage
function guardarTurnos() {
  localStorage.setItem('turnos', JSON.stringify(turnos)); // Guardar como JSON
}

// Generar horas de 8 AM a 6 PM
function generarHoras() {
  let horas = [];
  for (let h = 8; h <= 18; h++) {
    horas.push(`${h.toString().padStart(2, "0")}:00`);
  }
  return horas;
}

// Cargar las horas disponibles según la fecha seleccionada
function cargarHoras(fecha) {
  horaSelect.innerHTML = ""; // Limpiar las opciones de horas
  let horas = generarHoras(); // Obtener las horas posibles (8:00 - 18:00)

  // Verificar si hay turnos para la fecha seleccionada
  let horasOcupadas = turnos.filter(t => t.fecha === fecha).map(t => t.hora);

  horas.forEach(hora => {
    let option = document.createElement("option");
    option.value = hora;
    option.textContent = hora;

    // Si la hora ya está ocupada, deshabilitarla
    if (horasOcupadas.includes(hora)) {
      option.disabled = true;  
      option.textContent += " (Ocupado)";
    }

    horaSelect.appendChild(option);  // Añadir la opción al selector
  });

  horaSelect.disabled = false; // Habilitar el selector de horas una vez que se haya cargado
}

// Evento para cargar las horas cuando se seleccione una fecha
fechaInput.addEventListener("change", () => {
  let fecha = fechaInput.value;
  if (fecha) {
    cargarHoras(fecha); // Cargar las horas disponibles para la fecha seleccionada
  }
});

// Función para actualizar el historial de pacientes
function actualizarHistorial() {
  listaPacientes.innerHTML = ""; // Limpiar historial
  turnos.forEach(turno => {
    const divPaciente = document.createElement("div");
    divPaciente.classList.add("paciente");

    divPaciente.innerHTML = `
      <p><strong>Nombre:</strong> ${turno.nombre}</p>
      <p><strong>Fecha:</strong> ${turno.fecha}</p>
      <p><strong>Hora:</strong> ${turno.hora}</p>
      <p><strong>Duración:</strong> ${turno.duracion === '60' ? '1 hora' : '1h 30 min'}</p>
      <p><strong>Observaciones:</strong> ${turno.observaciones}</p>
    `;

    listaPacientes.appendChild(divPaciente);
  });
}

// Función para mostrar los turnos del día (agenda)
function mostrarAgendaDelDia() {
  const fechaHoy = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD
  const turnosHoy = turnos.filter(turno => turno.fecha === fechaHoy);

  agendaContainer.innerHTML = ""; // Limpiar la agenda

  if (turnosHoy.length === 0) {
    agendaContainer.innerHTML = "<p>No hay turnos programados para hoy.</p>";
  } else {
    turnosHoy.forEach(turno => {
      const divTurno = document.createElement("div");
      divTurno.classList.add("turno");

      divTurno.innerHTML = `
        <div class="turno-header">
          <p><strong>Paciente:</strong> ${turno.nombre}</p>
          <p><strong>Hora:</strong> ${turno.hora}</p>
        </div>
        <div class="turno-body">
          <p><strong>Duración:</strong> ${turno.duracion === '60' ? '1 hora' : '1h 30 min'}</p>
          <p><strong>Observaciones:</strong> ${turno.observaciones}</p>
          <button class="atendido-btn" onclick="marcarAtendido('${turno.hora}')">
            ${turno.atendido ? "Atendido" : "Marcar como atendido"}
          </button>
        </div>
      `;

      agendaContainer.appendChild(divTurno);
    });
  }
}

// Función para marcar un turno como atendido
function marcarAtendido(hora) {
  const turno = turnos.find(t => t.hora === hora);
  if (turno) {
    turno.atendido = !turno.atendido; // Cambiar el estado de atendido
    guardarTurnos(); // Guardar los turnos actualizados en localStorage
    mostrarAgendaDelDia(); // Volver a mostrar la agenda actualizada
  }
}

// Evento para guardar el turno
document.getElementById("form-turno").addEventListener("submit", function(e) {
  e.preventDefault();

  // Crear objeto del turno
  let turno = {
    nombre: document.getElementById("nombre").value,
    telefono: document.getElementById("telefono").value,
    observaciones: document.getElementById("observaciones").value,
    duracion: document.getElementById("duracion").value, // Duración seleccionada (60 o 90 minutos)
    fecha: fechaInput.value,
    hora: horaSelect.value,
    atendido: false // Inicialmente no ha sido atendido
  };

  // Guardar el turno en el array de turnos
  turnos.push(turno);

  // Mostrar alerta
  alert("Turno agregado correctamente");

  // Guardar los turnos en el localStorage
  guardarTurnos();

  // Actualizar el historial de pacientes
  actualizarHistorial();

  // Mostrar los turnos de hoy en la agenda
  mostrarAgendaDelDia();

  // Recargar las horas disponibles para la fecha seleccionada
  cargarHoras(turno.fecha);

  // Resetear formulario y deshabilitar la selección de hora
  this.reset();
  horaSelect.disabled = true;
});

// Cargar los turnos desde el localStorage al cargar la página
cargarTurnos();

// Mostrar la agenda del día al cargar la página
mostrarAgendaDelDia();