const fechaInput = document.getElementById("fecha");
const horaSelect = document.getElementById("hora");
const lista = document.getElementById("lista");

// Cargar horas al cambiar fecha
fechaInput.addEventListener("change", cargarHorasDisponibles);

// -------- BLOQUEO DE HORAS --------
function cargarHorasDisponibles() {
  const fecha = fechaInput.value;
  horaSelect.innerHTML = "";

  if (!fecha) return;

  const turnos = JSON.parse(localStorage.getItem("turnos")) || [];
  const turnosDelDia = turnos.filter(t => t.fecha === fecha);

  let horasBloqueadas = [];

  turnosDelDia.forEach(t => {
    horasBloqueadas.push(t.hora);

    if (t.duracion === "90") {
      let [h] = t.hora.split(":").map(Number);
      h += 1;
      horasBloqueadas.push(h.toString().padStart(2, "0") + ":00");
    }
  });

  for (let h = 8; h <= 21; h++) {
    let hora = h.toString().padStart(2, "0") + ":00";

    if (!horasBloqueadas.includes(hora)) {
      const option = document.createElement("option");
      option.value = hora;
      option.textContent = hora;
      horaSelect.appendChild(option);
    }
  }
}

// -------- GUARDAR TURNO --------
function guardarTurno() {
  const fecha = fechaInput.value;
  const hora = horaSelect.value;
  const nombre = document.getElementById("nombre").value;
  const obs = document.getElementById("obs").value;
  const duracion = document.getElementById("duracion").value;

  if (!fecha || !hora || !nombre) {
    alert("Completa los datos");
    return;
  }

  const turnos = JSON.parse(localStorage.getItem("turnos")) || [];

  turnos.push({ fecha, hora, nombre, obs, duracion });

  localStorage.setItem("turnos", JSON.stringify(turnos));

  cargarHorasDisponibles();
  mostrarTurnos();
}

// -------- MOSTRAR TURNOS --------
function mostrarTurnos() {
  const turnos = JSON.parse(localStorage.getItem("turnos")) || [];

  // Ordenar por fecha y hora
  turnos.sort((a, b) => {
    return new Date(a.fecha + " " + a.hora) - new Date(b.fecha + " " + b.hora);
  });

  lista.innerHTML = "";

  const ahora = new Date();

  turnos.forEach(t => {
    const div = document.createElement("div");
    div.className = "turno";

    const fechaHora = new Date(t.fecha + " " + t.hora);

    const diferencia = (fechaHora - ahora) / 60000;

    if (diferencia < 0) {
      div.classList.add("pasado");
    } else if (diferencia < 60) {
      div.classList.add("proximo");
    }

    div.innerHTML = `
      <strong>${t.fecha} ${t.hora}</strong><br>
      ${t.nombre}<br>
      ${t.duracion} min<br>
      ${t.obs}
    `;

    lista.appendChild(div);
  });
}

// -------- COMPARTIR --------
function compartirTurnos() {
  const turnos = JSON.parse(localStorage.getItem("turnos")) || [];

  let texto = "Agenda de turnos:\n\n";

  turnos.forEach(t => {
    texto += `${t.fecha} ${t.hora} - ${t.nombre} (${t.duracion} min)\n`;
  });

  if (navigator.share) {
    navigator.share({
      title: "Agenda",
      text: texto
    });
  } else {
    alert(texto);
  }
}

// Inicial
mostrarTurnos();