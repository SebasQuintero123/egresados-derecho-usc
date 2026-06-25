import { auth, db } from "./firebaseConfig.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

alert("panel-egresado.js actualizado sí está cargando");

// ===============================
// ELEMENTOS PRINCIPALES
// ===============================
const bienvenida = document.getElementById("bienvenida");
const cerrarSesion = document.getElementById("cerrarSesion");
const formPerfil = document.getElementById("formPerfil");
const estadoPublicacion = document.getElementById("estadoPublicacion");
const despublicarHV = document.getElementById("despublicarHV");

// ===============================
// BOTONES DEL MENÚ
// ===============================
const btnMiHojaVida = document.getElementById("btnMiHojaVida");
const btnOfertasLaborales = document.getElementById("btnOfertasLaborales");
const btnEventos = document.getElementById("btnEventos");

// ===============================
// SECCIONES
// ===============================
const seccionMiHojaVida = document.getElementById("seccionMiHojaVida");
const seccionOfertasLaborales = document.getElementById("seccionOfertasLaborales");
const seccionEventosEgresado = document.getElementById("seccionEventosEgresado");

// ===============================
// OFERTAS LABORALES
// ===============================
const listaOfertasLaborales = document.getElementById("listaOfertasLaborales");
const buscarOfertaLaboral = document.getElementById("buscarOfertaLaboral");

// ===============================
// EVENTOS
// ===============================
const listaEventosEgresado = document.getElementById("listaEventosEgresado");

// ===============================
// VARIABLES GLOBALES
// ===============================
let usuarioActual = null;
let referenciaEgresado = null;
let ofertasLaborales = [];

// ===============================
// VALIDAR SESIÓN DEL EGRESADO
// ===============================
onAuthStateChanged(auth, async (usuario) => {
  if (!usuario) {
    window.location.href = "login-egresado.html";
    return;
  }

  try {
    usuarioActual = usuario;
    referenciaEgresado = doc(db, "egresados", usuario.uid);

    const documento = await getDoc(referenciaEgresado);

    if (!documento.exists()) {
      alert("No se encontró el perfil del egresado.");
      await signOut(auth);
      window.location.href = "login-egresado.html";
      return;
    }

    const datos = documento.data();

    if (datos.estado !== "aprobado") {
      alert("Su cuenta todavía no ha sido aprobada por el administrador.");
      await signOut(auth);
      window.location.href = "login-egresado.html";
      return;
    }

    cargarDatos(datos);

  } catch (error) {
    console.error("Error al validar sesión:", error);
    alert("No se pudo validar la sesión del egresado.");
    await signOut(auth);
    window.location.href = "login-egresado.html";
  }
});

// ===============================
// CARGAR DATOS DEL EGRESADO
// ===============================
function cargarDatos(datos) {
  bienvenida.textContent = `Bienvenido, ${datos.nombre || "egresado"}`;

  document.getElementById("nombreVista").textContent = datos.nombre || "Nombre del egresado";
  document.getElementById("cargoVista").textContent = datos.cargoActual || "Sin cargo registrado";
  document.getElementById("ciudadVista").textContent = datos.ciudad || "Ciudad no registrada";
  document.getElementById("correoVista").textContent = datos.correo || "Correo no registrado";

  document.getElementById("nombrePerfil").value = datos.nombre || "";
  document.getElementById("documentoPerfil").value = datos.documento || "";
  document.getElementById("correoPerfil").value = datos.correo || "";
  document.getElementById("celularPerfil").value = datos.celular || "";
  document.getElementById("ciudadPerfil").value = datos.ciudad || "";
  document.getElementById("cargoActualPerfil").value = datos.cargoActual || "";

  document.getElementById("perfilProfesional").value = datos.perfilProfesional || "";
  document.getElementById("experienciaProfesional").value = datos.experienciaProfesional || "";
  document.getElementById("estudios").value = datos.estudios || "";
  document.getElementById("habilidades").value = datos.habilidades || "";
  document.getElementById("idiomas").value = datos.idiomas || "";
  document.getElementById("movilidad").value = datos.movilidad || "";
  document.getElementById("hojaDeVidaUrl").value = datos.hojaDeVidaUrl || "";

  if (datos.hojaDeVidaPublicada === true) {
    estadoPublicacion.textContent = "Publicada";
    estadoPublicacion.style.color = "green";
  } else {
    estadoPublicacion.textContent = "No publicada";
    estadoPublicacion.style.color = "#8b0000";
  }
}

// =============================== 
// CAMBIO DE SECCIONES
// ===============================
function ocultarSecciones() {
  seccionMiHojaVida.classList.add("hidden");
  seccionOfertasLaborales.classList.add("hidden");
  seccionEventosEgresado.classList.add("hidden");

  btnMiHojaVida.classList.remove("active");
  btnOfertasLaborales.classList.remove("active");
  btnEventos.classList.remove("active");
}

btnMiHojaVida.addEventListener("click", () => {
  ocultarSecciones();

  seccionMiHojaVida.classList.remove("hidden");
  btnMiHojaVida.classList.add("active");
});

btnOfertasLaborales.addEventListener("click", () => {
  console.log("Botón Ofertas presionado");

  ocultarSecciones();

  seccionOfertasLaborales.classList.remove("hidden");
  btnOfertasLaborales.classList.add("active");

  cargarOfertasLaborales();
});

btnEventos.addEventListener("click", () => {
  console.log("Botón Eventos presionado");

  ocultarSecciones();

  seccionEventosEgresado.classList.remove("hidden");
  btnEventos.classList.add("active");

  cargarEventosEgresado();
});

// ===============================
// GUARDAR HOJA DE VIDA
// ===============================
formPerfil.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await updateDoc(referenciaEgresado, {
      celular: document.getElementById("celularPerfil").value.trim(),
      ciudad: document.getElementById("ciudadPerfil").value.trim(),
      cargoActual: document.getElementById("cargoActualPerfil").value.trim(),

      perfilProfesional: document.getElementById("perfilProfesional").value.trim(),
      experienciaProfesional: document.getElementById("experienciaProfesional").value.trim(),
      estudios: document.getElementById("estudios").value.trim(),
      habilidades: document.getElementById("habilidades").value.trim(),
      idiomas: document.getElementById("idiomas").value.trim(),
      movilidad: document.getElementById("movilidad").value.trim(),
      hojaDeVidaUrl: document.getElementById("hojaDeVidaUrl").value.trim(),

      hojaDeVidaPublicada: true,
      fechaActualizacionHV: serverTimestamp()
    });

    alert("Hoja de vida guardada y publicada correctamente.");

    const actualizado = await getDoc(referenciaEgresado);
    cargarDatos(actualizado.data());

  } catch (error) {
    console.error("Error al guardar hoja de vida:", error);
    alert("No se pudo guardar la hoja de vida. Revise permisos o consola.");
  }
});

// ===============================
// OCULTAR HOJA DE VIDA
// ===============================
despublicarHV.addEventListener("click", async () => {
  try {
    await updateDoc(referenciaEgresado, {
      hojaDeVidaPublicada: false,
      fechaActualizacionHV: serverTimestamp()
    });

    alert("La hoja de vida fue ocultada.");

    const actualizado = await getDoc(referenciaEgresado);
    cargarDatos(actualizado.data());

  } catch (error) {
    console.error("Error al ocultar hoja de vida:", error);
    alert("No se pudo ocultar la hoja de vida.");
  }
});

// ===============================
// CARGAR OFERTAS LABORALES
// ===============================
async function cargarOfertasLaborales() {
  listaOfertasLaborales.innerHTML = "<p>Cargando ofertas laborales...</p>";

  try {
    const consulta = query(
      collection(db, "ofertasLaborales"),
      where("estado", "==", "publicada")
    );

    const resultado = await getDocs(consulta);

    ofertasLaborales = [];

    if (resultado.empty) {
      listaOfertasLaborales.innerHTML = `
        <div class="empty-message">
          <p>No hay ofertas laborales publicadas por el momento.</p>
        </div>
      `;
      return;
    }

    resultado.forEach((documento) => {
      ofertasLaborales.push({
        id: documento.id,
        ...documento.data()
      });
    });

    mostrarOfertasLaborales(ofertasLaborales);

  } catch (error) {
    console.error("Error al cargar ofertas:", error);

    listaOfertasLaborales.innerHTML = `
      <div class="empty-message">
        <p>No se pudieron cargar las ofertas laborales.</p>
      </div>
    `;
  }
}

// ===============================
// MOSTRAR OFERTAS LABORALES
// ===============================
function mostrarOfertasLaborales(lista) {
  listaOfertasLaborales.innerHTML = "";

  if (lista.length === 0) {
    listaOfertasLaborales.innerHTML = `
      <div class="empty-message">
        <p>No se encontraron ofertas con esa búsqueda.</p>
      </div>
    `;
    return;
  }

  lista.forEach((oferta) => {
    const card = document.createElement("article");
    card.classList.add("job-egresado-card");

    card.innerHTML = `
      <h3>${oferta.titulo || "Oferta laboral"}</h3>

      <p class="empresa-oferta">
        ${oferta.empresa || "Empresa no registrada"}
      </p>

      <div class="job-info-grid">
        <p><strong>Ciudad:</strong> ${oferta.ciudad || "No registra"}</p>
        <p><strong>Modalidad:</strong> ${oferta.modalidad || "No registra"}</p>
        <p><strong>Salario:</strong> ${oferta.salario || "No registra"}</p>
        <p><strong>Correo:</strong> ${oferta.correoContacto || "No registra"}</p>
      </div>

      <div class="cv-section">
        <h4>Descripción</h4>
        <p>${oferta.descripcion || "No registra descripción."}</p>
      </div>

      <div class="cv-section">
        <h4>Requisitos</h4>
        <p>${oferta.requisitos || "No registra requisitos."}</p>
      </div>

      ${
        oferta.correoContacto
          ? `<a href="mailto:${oferta.correoContacto}" class="btn-contact">Postularme</a>`
          : ""
      }
    `;

    listaOfertasLaborales.appendChild(card);
  });
}

// ===============================
// BUSCADOR DE OFERTAS
// ===============================
buscarOfertaLaboral.addEventListener("input", () => {
  const texto = buscarOfertaLaboral.value.toLowerCase().trim();

  const filtradas = ofertasLaborales.filter((oferta) => {
    const contenido = `
      ${oferta.titulo || ""}
      ${oferta.empresa || ""}
      ${oferta.ciudad || ""}
      ${oferta.modalidad || ""}
      ${oferta.salario || ""}
      ${oferta.descripcion || ""}
      ${oferta.requisitos || ""}
    `.toLowerCase();

    return contenido.includes(texto);
  });

  mostrarOfertasLaborales(filtradas);
});

// ===============================
// CARGAR EVENTOS EN PANEL EGRESADO
// ===============================
async function cargarEventosEgresado() {
  listaEventosEgresado.innerHTML = "<p>Cargando eventos...</p>";

  try {
    const consulta = query(
      collection(db, "eventos")
    );

    const resultado = await getDocs(consulta);

    if (resultado.empty) {
      listaEventosEgresado.innerHTML = `
        <div class="empty-message">
          <p>No hay eventos publicados por el momento.</p>
        </div>
      `;
      return;
    }

    listaEventosEgresado.innerHTML = "";

    let eventosPublicados = 0;

    resultado.forEach((documento) => {
      const evento = documento.data();

      if (evento.estado !== "publicado") {
        return;
      }

      eventosPublicados++;

      const fechaMostrar = evento.fechaEvento || evento.fecha || "Sin fecha";
      const horaMostrar = evento.horaEvento || evento.hora || "Sin hora";

      const card = document.createElement("article");
      card.classList.add("job-egresado-card");

      card.innerHTML = `
        <h3>${evento.titulo || "Evento"}</h3>

        <div class="job-info-grid">
          <p><strong>Fecha:</strong> ${fechaMostrar}</p>
          <p><strong>Hora:</strong> ${horaMostrar}</p>
          <p><strong>Lugar:</strong> ${evento.lugar || "No registrado"}</p>
          <p><strong>Modalidad:</strong> ${evento.modalidad || "No registrada"}</p>
        </div>

        <div class="cv-section">
          <h4>Descripción</h4>
          <p>${evento.descripcion || "Sin descripción."}</p>
        </div>

        ${
          evento.enlace
            ? `<a href="${evento.enlace}" target="_blank" class="btn-contact">Ver enlace del evento</a>`
            : ""
        }
      `;

      listaEventosEgresado.appendChild(card);
    });

    if (eventosPublicados === 0) {
      listaEventosEgresado.innerHTML = `
        <div class="empty-message">
          <p>No hay eventos publicados por el momento.</p>
        </div>
      `;
    }

  } catch (error) {
    console.error("Error al cargar eventos:", error);

    listaEventosEgresado.innerHTML = `
      <div class="empty-message">
        <p>No se pudieron cargar los eventos.</p>
      </div>
    `;
  }
}

// ===============================
// CERRAR SESIÓN
// ===============================
cerrarSesion.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login-egresado.html";
});