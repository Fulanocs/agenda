document.addEventListener("DOMContentLoaded", () => {

  const fechaInput = document.getElementById("fecha");
  const horaSelect = document.getElementById("hora");
  const listaPacientes = document.getElementById("lista-pacientes");
  const agendaContainer = document.getElementById("agenda");

  let turnos = [];

  function cargarTurnos() {
    const turnosGuardados = localStorage.getItem('turnos');
    if (turnosGuardados) {
      turnos = JSON.parse(turnosGuardados);
    }
  }

  function guardarTurnos() {
    localStorage.setItem('turnos', JSON.stringify(turnos));
  }

  function generarHoras() {
    let horas = [];
    for (let h = 8; h <= 18; h++) {
      horas.push(`${h.toString().padStart(2, "0")}:00`);
    }
    return horas;
  }

  function cargarHoras(fecha) {
    horaSelect.innerHTML = "";

    let horas = generarHoras();
    let horasOcupadas = turnos
      .filter(t => t.fecha === fecha)
      .map(t => t.hora);

    horas.forEach(hora => {
      let option = document.createElement("option");
      option.value = hora;
      option.textContent = hora;

      if (horasOcupadas.includes(hora)) {
        option.disabled = true;
        option.textContent += " (Ocupado)";
      }

      horaSelect.appendChild(option);
    });

    horaSelect.disabled = false;
  }

  // 🔥 EVENTO CLAVE (arreglado)
  fechaInput.addEventListener("change", function () {
    if (this.value) {
      cargarHoras(this.value);
    }
  });

  function actualizarHistorial() {
    listaPacientes.innerHTML = "";

    turnos.forEach(turno => {
      const div = document.createElement("div");
      div.classList.add("paciente");

      div.innerHTML = `
        <p><strong>Nombre:</strong> ${turno.nombre}</p>
        <p><strong>Fecha:</strong> ${turno.fecha}</p>
        <p><strong>Hora:</strong> ${turno.hora}</p>
      `;

      listaPacientes.appendChild(div);
    });
  }

  function mostrarAgendaDelDia() {
    const fechaHoy = new Date().toISOString().split('T')[0];
    const turnosHoy = turnos.filter(t => t.fecha === fechaHoy);

    agendaContainer.innerHTML = "";

    if (turnosHoy.length === 0) {
      agendaContainer.innerHTML = "<p>No hay turnos hoy</p>";
      return;
    }

    turnosHoy.forEach(turno => {
      const div = document.createElement("div");

      div.innerHTML = `
        <p>${turno.nombre} - ${turno.hora}</p>
      `;

      agendaContainer.appendChild(div);
    });
  }

  document.getElementById("form-turno").addEventListener("submit", function(e) {
    e.preventDefault();

    if (!horaSelect.value) {
      alert("Seleccioná una hora");
      return;
    }

    let turno = {
      nombre: document.getElementById("nombre").value,
      telefono: document.getElementById("telefono").value,
      observaciones: document.getElementById("observaciones").value,
      duracion: document.getElementById("duracion").value,
      fecha: fechaInput.value,
      hora: horaSelect.value,
      atendido: false
    };

    turnos.push(turno);

    guardarTurnos();
    actualizarHistorial();
    mostrarAgendaDelDia();
    cargarHoras(turno.fecha);

    this.reset();
    horaSelect.disabled = true;

    alert("Turno agregado");
  });

  cargarTurnos();
  actualizarHistorial();
  mostrarAgendaDelDia();

});
