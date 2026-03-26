let turnos = [];
let horaSeleccionada = null;
let duracionSeleccionada = 60;
let ultimoTurno = null;

const horasContainer = document.getElementById("horas");
const lista = document.getElementById("lista-turnos");

// generar horarios
function generarHoras() {
  horasContainer.innerHTML = "";

  for (let i = 8; i <= 21; i++) {
    let hora = i.toString().padStart(2, "0") + ":00";

    const btn = document.createElement("div");
    btn.textContent = hora;
    btn.classList.add("hora");

    btn.onclick = () => {
      document.querySelectorAll(".hora").forEach(h => h.classList.remove("seleccionada"));
      btn.classList.add("seleccionada");
      horaSeleccionada = hora;
    };

    horasContainer.appendChild(btn);
  }
}

generarHoras();

// seleccionar duración
function seleccionarDuracion(min) {
  duracionSeleccionada = min;
}

// agendar turno
document.getElementById("btn-agendar").onclick = () => {
  const nombre = document.getElementById("nombre").value;
  const fecha = document.getElementById("fecha").value;
  const obs = document.getElementById("obs").value;

  if (!nombre || !fecha || !horaSeleccionada) {
    alert("Completa todos los campos");
    return;
  }

  const turno = {
    nombre,
    fecha,
    hora: horaSeleccionada,
    duracion: duracionSeleccionada,
    obs
  };

  turnos.push(turno);
  ultimoTurno = turno;

  renderizarTurnos();
};

// ordenar + pintar
function renderizarTurnos() {
  lista.innerHTML = "";

  turnos.sort((a, b) => {
    return new Date(`${a.fecha}T${a.hora}`) - new Date(`${b.fecha}T${b.hora}`);
  });

  turnos.forEach((t, index) => {
    const div = document.createElement("div");
    div.className = "turno " + obtenerClaseTurno(t);

    div.innerHTML = `
      <b>${t.hora}</b> - ${t.nombre}<br>
      ${t.fecha}<br>
      ${t.duracion} min<br>
      ${t.obs || ""}
      <br><button onclick="eliminar(${index})">Eliminar</button>
    `;

    lista.appendChild(div);
  });
}

// colores por tiempo
function obtenerClaseTurno(turno) {
  const ahora = new Date();
  const fechaTurno = new Date(`${turno.fecha}T${turno.hora}`);
  const diff = (fechaTurno - ahora) / 60000;

  if (diff <= 0) return "pasado";
  if (diff <= 60) return "proximo";
  return "";
}

// eliminar turno
function eliminar(i) {
  turnos.splice(i, 1);
  renderizarTurnos();
}

// compartir
document.getElementById("btn-compartir").onclick = () => {
  if (!ultimoTurno) {
    alert("No hay turno");
    return;
  }

  const texto = `Paciente: ${ultimoTurno.nombre}
Fecha: ${ultimoTurno.fecha}
Hora: ${ultimoTurno.hora}
Duración: ${ultimoTurno.duracion} min
Observaciones: ${ultimoTurno.obs}`;

  if (navigator.share) {
    navigator.share({ text: texto });
  } else {
    navigator.clipboard.writeText(texto);
    alert("Copiado para compartir");
  }
};

// actualizar colores cada minuto
setInterval(renderizarTurnos, 60000);