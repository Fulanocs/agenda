const usuarioActivo = localStorage.getItem("usuarioActivo");

if (!usuarioActivo) {
  location.href = "index.html";
}

function logout() {
  localStorage.removeItem("usuarioActivo");
  location.href = "index.html";
}

let turnos = JSON.parse(localStorage.getItem("turnos")) || [];

const agenda = document.getElementById("agenda");
const horaSelect = document.getElementById("hora");

// horas
function generarHoras() {
  let horas = [];
  for (let h = 8; h < 18; h++) {
    horas.push(`${h}:00`, `${h}:30`);
  }
  return horas;
}

// ocupadas
function ocupadas(fecha) {
  let o = [];
  turnos.filter(t => t.fecha === fecha && t.usuario === usuarioActivo)
    .forEach(t => {
      let [h,m]=t.hora.split(":").map(Number);
      let inicio = h*60+m;

      for(let i=0;i<t.duracion;i+=30){
        let total=inicio+i;
        let hh=Math.floor(total/60);
        let mm=total%60;
        o.push(`${hh}:${mm===0?"00":"30"}`);
      }
    });
  return o;
}

// cargar horas
function cargarHoras(fecha){
  horaSelect.innerHTML="";
  let o=ocupadas(fecha);

  generarHoras().forEach(h=>{
    let op=document.createElement("option");
    op.value=h;
    op.textContent=o.includes(h)?h+" ❌":h;
    op.disabled=o.includes(h);
    horaSelect.appendChild(op);
  });
}

// agendar
form-turno.onsubmit = e => {
  e.preventDefault();

  let t = {
    usuario: usuarioActivo,
    nombre: nombre.value,
    telefono: telefono.value,
    duracion: duracion.value,
    fecha: fecha.value,
    hora: hora.value
  };

  turnos.push(t);
  localStorage.setItem("turnos", JSON.stringify(turnos));

  mostrar();
  cargarHoras(t.fecha);

  form-turno.reset();
};

// PDF + compartir
async function generarPDF(t){
  const {jsPDF}=window.jspdf;
  let doc=new jsPDF();

  let img=new Image();
  img.src="logo.png";

  img.onload=async ()=>{
    doc.addImage(img,"PNG",80,10,50,50);
    doc.text("Turno",105,70,null,null,"center");
    doc.text(`${t.nombre}`,20,90);
    doc.text(`${t.fecha} ${t.hora}`,20,100);

    let blob=doc.output("blob");
    let file=new File([blob],"turno.pdf",{type:"application/pdf"});

    if(navigator.canShare){
      await navigator.share({files:[file]});
    }else{
      doc.save("turno.pdf");
    }
  };
}

// mostrar
function mostrar(){
  agenda.innerHTML="";

  let hoy=new Date().toISOString().split("T")[0];

  turnos
  .filter(t=>t.fecha===hoy && t.usuario===usuarioActivo)
  .sort((a,b)=>a.hora.localeCompare(b.hora))
  .forEach(t=>{
    let d=document.createElement("div");
    d.className="turno";

    d.innerHTML=`
      <b>${t.hora}</b> - ${t.nombre}
      <button onclick='generarPDF(${JSON.stringify(t)})'>📲</button>
    `;

    agenda.appendChild(d);
  });
}

// iniciar
let hoy=new Date().toISOString().split("T")[0];
fecha.value=hoy;

cargarHoras(hoy);
mostrar();

fecha.onchange=()=>cargarHoras(fecha.value);
