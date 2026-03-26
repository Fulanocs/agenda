const fechaInput = document.getElementById("fecha");
const horaSelect = document.getElementById("hora");
const agenda = document.getElementById("agenda");
const lista = document.getElementById("lista-pacientes");

let turnos = JSON.parse(localStorage.getItem("turnos")) || [];

// 🔹 Horarios
function generarHoras() {
  let horas = [];
  for (let h = 8; h < 18; h++) {
    horas.push(`${h.toString().padStart(2, "0")}:00`);
    horas.push(`${h.toString().padStart(2, "0")}:30`);
  }
  horas.push("18:00");
  return horas;
}

// 🔹 Ocupadas
function horasOcupadas(fecha) {
  let ocupadas = [];

  turnos.filter(t => t.fecha === fecha).forEach(t => {
    let [h, m] = t.hora.split(":").map(Number);
    let inicio = h * 60 + m;
    let duracion = parseInt(t.duracion);

    for (let i = 0; i < duracion; i += 30) {
      let total = inicio + i;
      let hh = Math.floor(total / 60).toString().padStart(2, "0");
      let mm = (total % 60).toString().padStart(2, "0");
      ocupadas.push(`${hh}:${mm}`);
    }
  });

  return ocupadas;
}

// 🔹 Cargar horas
function cargarHoras(fecha) {
  horaSelect.innerHTML = "";

  let horas = generarHoras();
  let ocupadas = horasOcupadas(fecha);

  horas.forEach(h => {
    let op = document.createElement("option");
    op.value = h;
    op.textContent = h;

    if (ocupadas.includes(h)) {
      op.disabled = true;
      op.textContent += " (ocupado)";
    }

    horaSelect.appendChild(op);
  });

  for (let o of horaSelect.options) {
    if (!o.disabled) {
      horaSelect.value = o.value;
      break;
    }
  }
}

// 🔥 AGENDAR
document.getElementById("form-turno").addEventListener("submit", e => {
  e.preventDefault();

  let turno = {
    nombre: nombre.value,
    telefono: telefono.value,
    observaciones: observaciones.value,
    duracion: duracion.value,
    fecha: fecha.value,
    hora: hora.value,
    recordado: false
  };

  turnos.push(turno);
  localStorage.setItem("turnos", JSON.stringify(turnos));

  mostrarAgenda();
  mostrarHistorial();
  cargarHoras(turno.fecha);

  generarPDF(turno);

  e.target.reset();
  document.getElementById("nombre").focus();
});

// 📄 PDF CON LOGO
function generarPDF(turno) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let img = new Image();
  img.src = "logo.png";

  img.onload = function () {

    // logo
    doc.addImage(img, "PNG", 80, 10, 50, 50);

    // titulo
    doc.setFontSize(18);
    doc.text("COMPROBANTE DE TURNO", 105, 70, null, null, "center");

    doc.line(20, 75, 190, 75);

    doc.setFontSize(12);

    doc.text(`Paciente: ${turno.nombre}`, 20, 90);
    doc.text(`Teléfono: ${turno.telefono}`, 20, 100);
    doc.text(`Fecha: ${turno.fecha}`, 20, 110);
    doc.text(`Hora: ${turno.hora}`, 20, 120);
    doc.text(`Duración: ${turno.duracion == 60 ? "1h" : "1h 30m"}`, 20, 130);

    if (turno.observaciones) {
      doc.text(`Observaciones: ${turno.observaciones}`, 20, 140);
    }

    doc.text("Gracias por confiar en nosotros", 105, 170, null, null, "center");

    doc.save(`Turno_${turno.nombre}.pdf`);
  };
}

// 🔹 Agenda
function mostrarAgenda() {
  let hoy = new Date().toISOString().split("T")[0];

  let hoyTurnos = turnos
    .filter(t => t.fecha === hoy)
    .sort((a, b) => a.hora.localeCompare(b.hora));

  agenda.innerHTML = "";

  if (hoyTurnos.length === 0) {
    agenda.innerHTML = "<p>No hay turnos programados para hoy.</p>";
    return;
  }

  hoyTurnos.forEach(t => {
    let div = document.createElement("div");
    div.className = "turno";

    div.innerHTML = `
      <strong>${t.hora}</strong> - ${t.nombre}<br>
      ${t.duracion == 60 ? "1h" : "1h 30m"}<br>
      ${t.observaciones || ""}
    `;

    agenda.appendChild(div);
  });
}

// 🔹 Historial
function mostrarHistorial() {
  lista.innerHTML = "";

  turnos.forEach(t => {
    let div = document.createElement("div");
    div.innerHTML = `${t.nombre} - ${t.fecha} ${t.hora}`;
    lista.appendChild(div);
  });
}

// 🔔 Recordatorios
function recordatorios() {
  let ahora = new Date();

  turnos.forEach(t => {
    let fh = new Date(`${t.fecha}T${t.hora}`);
    let diff = (fh - ahora) / 60000;

    if (diff > 0 && diff <= 30 && !t.recordado) {
      alert(`Turno con ${t.nombre} en 30 min`);
      t.recordado = true;
      localStorage.setItem("turnos", JSON.stringify(turnos));
    }
  });
}

setInterval(recordatorios, 60000);

// iniciar
let hoy = new Date().toISOString().split("T")[0];
fecha.value = hoy;

cargarHoras(hoy);
mostrarAgenda();
mostrarHistorial();

window.onload = () => {
  document.getElementById("nombre").focus();
};

fecha.addEventListener("change", () => cargarHoras(fecha.value));
