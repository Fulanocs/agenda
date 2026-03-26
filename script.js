let lista = JSON.parse(localStorage.getItem("pacientes")) || [];

function guardarPaciente() {
  const nombre = document.getElementById("nombre").value;
  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;

  if (!nombre || !fecha || !hora) {
    alert("Completa todos los campos");
    return;
  }

  const paciente = { nombre, fecha, hora };
  lista.push(paciente);

  localStorage.setItem("pacientes", JSON.stringify(lista));

  limpiarCampos();
  mostrarLista();
}

function limpiarCampos() {
  document.getElementById("nombre").value = "";
  document.getElementById("fecha").value = "";
  document.getElementById("hora").value = "";
}

function mostrarLista() {
  const contenedor = document.getElementById("lista");
  contenedor.innerHTML = "";

  lista.forEach((p, index) => {
    contenedor.innerHTML += `
      <div class="card">
        <strong>${p.nombre}</strong>
        <p>📅 ${p.fecha}</p>
        <p>⏰ ${p.hora}</p>

        <button class="btn-compartir" onclick="compartir(${index})">
          Compartir
        </button>

        <button class="btn-borrar" onclick="eliminar(${index})">
          Eliminar
        </button>
      </div>
    `;
  });
}

function compartir(index) {
  const p = lista[index];

  const texto = `Hola ${p.nombre}, te confirmo tu cita:
📅 Fecha: ${p.fecha}
⏰ Hora: ${p.hora}`;

  if (navigator.share) {
    navigator.share({
      title: "Cita",
      text: texto
    });
  } else {
    navigator.clipboard.writeText(texto);
    alert("Texto copiado, podés pegarlo en WhatsApp");
  }
}

function eliminar(index) {
  if (confirm("¿Eliminar este turno?")) {
    lista.splice(index, 1);
    localStorage.setItem("pacientes", JSON.stringify(lista));
    mostrarLista();
  }
}

mostrarLista();