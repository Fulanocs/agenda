const fechaInput = document.getElementById("fecha");
const horaSelect = document.getElementById("hora");
const lista = document.getElementById("lista");

let turnos = JSON.parse(localStorage.getItem("turnos")) || [];

// 🔹 Generar horarios
function generarHoras() {
  let horas = [];
  for (let h = 8; h < 18; h++) {
    horas.push(`${h.toString().padStart(2, "0")}:00`);
    horas.push(`${h.toString().padStart(2, "0")}:30`);
  }
  horas.push("18:00");
  return horas;
}

// 🔹 Detectar ocupadas
function obtenerHorasOcupadas(fecha, ignorarIndex = null) {
  let ocupadas = [];

  turnos.forEach((t, index) => {
    if (t.fecha !== fecha) return;
    if (index === ignorarIndex) return;

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
function cargarHoras(fecha, ignorarIndex = null) {
  horaSelect.innerHTML = "";

  let horas = generarHoras();
  let ocupadas = obtenerHorasOcupadas(fecha, ignorarIndex);

  horas.forEach(hora => {
    let option = document.createElement("option");
    option.value = hora;
    option.textContent = hora;

    if (ocupadas.includes(hora)) {
      option.disabled = true;
      option.textContent += " (ocupado)";
    }

    horaSelect.appendChild(option);
  });

  for (let opt of horaSelect.options) {
    if (!opt.disabled) {
      horaSelect.value = opt.value;
      break;
    }
  }
}

// 🔥 AGENDAR
function agendar() {
  let nombre = document.getElementById("nombre").value;
  let telefono = document.getElementById("telefono").value;
  let fecha = fechaInput.value;
  let hora = horaSelect.value;
  let duracion = document.getElementById("duracion").value;

  if (!nombre || !telefono || !fecha || !hora) {
    alert("Faltan datos");
    return;
  }

  let turno = {
    nombre,
    telefono,
    fecha,
    hora,
    duracion,
    confirmado: false,
    recordado: false
  };

  turnos.push(turno);

  guardar();
  mostrar();
  cargarHoras(fecha);

  enviarWhatsApp(turno);

  limpiar();
}

// 📲 WhatsApp
function enviarWhatsApp(turno) {
  let mensaje = `Hola ${turno.nombre}, tu turno está agendado:
📅 ${turno.fecha}
⏰ ${turno.hora}`;

  let numero = turno.telefono.replace(/\D/g, "");
  let url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

  window.open(url, "_blank");
}

// 🔹 Mostrar turnos
function mostrar() {
  let fecha = fechaInput.value;
  lista.innerHTML = "";

  let hoyTurnos = turnos.filter(t => t.fecha === fecha);

  hoyTurnos.forEach((t, index) => {
    let div = document.createElement("div");
    div.classList.add("turno");

    div.innerHTML = `
      <strong>${t.nombre}</strong><br>
      ${t.hora} - ${t.duracion == 60 ? "1h" : "1h 30m"}<br>
      Estado: ${t.confirmado ? "✅ Confirmado" : "⏳ Pendiente"}

      <br><br>
      <button onclick="confirmar(${index})">📲 Confirmar</button>
      <button onclick="editar(${index})">✏️ Editar</button>
      <button onclick="eliminar(${index})">❌ Cancelar</button>
    `;

    lista.appendChild(div);
  });
}

// 🔥 CONFIRMAR
function confirmar(index) {
  turnos[index].confirmado = true;
  guardar();
  mostrar();

  enviarWhatsApp({
    nombre: turnos[index].nombre,
    telefono: turnos[index].telefono,
    fecha: turnos[index].fecha,
    hora: turnos[index].hora
  });
}

// ❌ ELIMINAR
function eliminar(index) {
  if (confirm("¿Cancelar turno?")) {
    turnos.splice(index, 1);
    guardar();
    mostrar();
    cargarHoras(fechaInput.value);
  }
}

// ✏️ EDITAR
function editar(index) {
  let t = turnos[index];

  document.getElementById("nombre").value = t.nombre;
  document.getElementById("telefono").value = t.telefono;
  fechaInput.value = t.fecha;
  document.getElementById("duracion").value = t.duracion;

  cargarHoras(t.fecha, index);
  horaSelect.value = t.hora;

  turnos.splice(index, 1);
}

// 🔔 Recordatorios
function verificarRecordatorios() {
  let ahora = new Date();

  turnos.forEach(turno => {
    let fechaHora = new Date(`${turno.fecha}T${turno.hora}`);
    let diff = (fechaHora - ahora) / 60000;

    if (diff > 0 && diff <= 30 && !turno.recordado) {
      alert(`Turno con ${turno.nombre} en 30 min`);
      turno.recordado = true;
      guardar();
    }
  });
}

setInterval(verificarRecordatorios, 60000);

// 🔹 utils
function guardar() {
  localStorage.setItem("turnos", JSON.stringify(turnos));
}

function limpiar() {
  document.getElementById("nombre").value = "";
  document.getElementById("telefono").value = "";
}

// evento fecha
fechaInput.addEventListener("change", () => {
  cargarHoras(fechaInput.value);
  mostrar();
});

// iniciar
let hoy = new Date().toISOString().split("T")[0];
fechaInput.value = hoy;

cargarHoras(hoy);
mostrar();
