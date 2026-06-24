import { auth, db } from "./firebaseConfig.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const nombreEmpresaVista = document.getElementById("nombreEmpresaVista");
const cerrarSesionEmpleador = document.getElementById("cerrarSesionEmpleador");

const btnVerHojasVida = document.getElementById("btnVerHojasVida");
const btnPublicarOferta = document.getElementById("btnPublicarOferta");

const seccionHojasVida = document.getElementById("seccionHojasVida");
const seccionOfertaLaboral = document.getElementById("seccionOfertaLaboral");

const listaHojasVida = document.getElementById("listaHojasVida");
const buscarEgresado = document.getElementById("buscarEgresado");

const formOfertaLaboral = document.getElementById("formOfertaLaboral");
const listaOfertasEmpresa = document.getElementById("listaOfertasEmpresa");

let hojasVida = [];
let usuarioActual = null;
let datosEmpresaActual = null;

onAuthStateChanged(auth, async (usuario) => {
  if (!usuario) {
    window.location.href = "login-empleador.html";
    return;
  }

  usuarioActual = usuario;

  const empleadorRef = doc(db, "empleadores", usuario.uid);
  const empleadorDoc = await getDoc(empleadorRef);

  if (!empleadorDoc.exists()) {
    alert("No tiene permisos como empleador.");
    await signOut(auth);
    window.location.href = "login-empleador.html";
    return;
  }

  datosEmpresaActual = empleadorDoc.data();

  nombreEmpresaVista.textContent = datosEmpresaActual.empresa || "Panel del empleador";

  cargarHojasVida();
  cargarOfertasEmpresa();
});

btnVerHojasVida.addEventListener("click", () => {
  seccionHojasVida.classList.remove("hidden");
  seccionOfertaLaboral.classList.add("hidden");

  btnVerHojasVida.classList.add("active");
  btnPublicarOferta.classList.remove("active");
});

btnPublicarOferta.addEventListener("click", () => {
  seccionOfertaLaboral.classList.remove("hidden");
  seccionHojasVida.classList.add("hidden");

  btnPublicarOferta.classList.add("active");
  btnVerHojasVida.classList.remove("active");
});

async function cargarHojasVida() {
  listaHojasVida.innerHTML = "<p>Cargando hojas de vida...</p>";

  try {
    const consulta = query(
      collection(db, "egresados"),
      where("estado", "==", "aprobado"),
      where("hojaDeVidaPublicada", "==", true)
    );

    const resultado = await getDocs(consulta);

    hojasVida = [];

    if (resultado.empty) {
      listaHojasVida.innerHTML = `
        <div class="empty-message">
          <p>No hay hojas de vida publicadas por el momento.</p>
        </div>
      `;
      return;
    }

    resultado.forEach((documento) => {
      hojasVida.push({
        id: documento.id,
        ...documento.data()
      });
    });

    mostrarHojasVida(hojasVida);

  } catch (error) {
    console.error("Error al cargar hojas de vida:", error);
    listaHojasVida.innerHTML = `
      <div class="empty-message">
        <p>No se pudieron cargar las hojas de vida.</p>
      </div>
    `;
  }
}

function mostrarHojasVida(lista) {
  listaHojasVida.innerHTML = "";

  lista.forEach((egresado) => {
    const tarjeta = document.createElement("article");
    tarjeta.classList.add("cv-card-public");

    const enlaceHV = egresado.hojaDeVidaUrl || "";

    tarjeta.innerHTML = `
      <h3>${egresado.nombre || "Egresado sin nombre"}</h3>
      <p class="cargo">${egresado.cargoActual || "Cargo no registrado"}</p>

      <div class="cv-info-grid">
        <p><strong>Ciudad:</strong> ${egresado.ciudad || "No registra"}</p>
        <p><strong>Programa:</strong> ${egresado.programa || "Derecho"}</p>
        <p><strong>Año o fecha de grado:</strong> ${egresado.anioGrado || "No registra"}</p>
        <p><strong>Celular:</strong> ${egresado.celular || "No registra"}</p>
        <p><strong>Correo:</strong> ${egresado.correo || "No registra"}</p>
      </div>

      <div class="cv-section">
        <h4>Perfil profesional</h4>
        <p>${egresado.perfilProfesional || "No registra perfil profesional."}</p>
      </div>

      <div class="cv-section">
        <h4>Experiencia profesional</h4>
        <p>${egresado.experienciaProfesional || "No registra experiencia."}</p>
      </div>

      <div class="cv-section">
        <h4>Estudios</h4>
        <p>${egresado.estudios || "No registra estudios."}</p>
      </div>

      <div class="cv-section">
        <h4>Habilidades</h4>
        <p>${egresado.habilidades || "No registra habilidades."}</p>
      </div>

      <div class="cv-actions">
        ${
          enlaceHV
          ? `<a href="${enlaceHV}" target="_blank" class="btn-view-cv">Ver hoja de vida</a>`
          : `<span class="btn-view-cv">Sin enlace de HV</span>`
        }

        ${
          egresado.correo
          ? `<a href="mailto:${egresado.correo}" class="btn-contact">Contactar</a>`
          : ""
        }
      </div>
    `;

    listaHojasVida.appendChild(tarjeta);
  });
}

buscarEgresado.addEventListener("input", () => {
  const texto = buscarEgresado.value.toLowerCase().trim();

  const filtrados = hojasVida.filter((egresado) => {
    const contenido = `
      ${egresado.nombre || ""}
      ${egresado.cargoActual || ""}
      ${egresado.ciudad || ""}
      ${egresado.perfilProfesional || ""}
      ${egresado.experienciaProfesional || ""}
      ${egresado.habilidades || ""}
      ${egresado.estudios || ""}
    `.toLowerCase();

    return contenido.includes(texto);
  });

  mostrarHojasVida(filtrados);
});

formOfertaLaboral.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!usuarioActual || !datosEmpresaActual) {
    alert("No se pudo identificar la empresa.");
    return;
  }

  const oferta = {
    empleadorUid: usuarioActual.uid,
    empresa: datosEmpresaActual.empresa || "",
    nit: datosEmpresaActual.nit || "",
    titulo: document.getElementById("tituloOferta").value.trim(),
    ciudad: document.getElementById("ciudadOferta").value.trim(),
    modalidad: document.getElementById("modalidadOferta").value,
    salario: document.getElementById("salarioOferta").value.trim(),
    descripcion: document.getElementById("descripcionOferta").value.trim(),
    requisitos: document.getElementById("requisitosOferta").value.trim(),
    correoContacto: document.getElementById("correoContactoOferta").value.trim(),
    estado: "publicada",
    fechaPublicacion: serverTimestamp()
  };

  try {
    await addDoc(collection(db, "ofertasLaborales"), oferta);

    alert("Oferta laboral publicada correctamente.");

    formOfertaLaboral.reset();
    cargarOfertasEmpresa();

  } catch (error) {
    console.error("Error al publicar oferta:", error);
    alert("No se pudo publicar la oferta laboral.");
  }
});

async function cargarOfertasEmpresa() {
  if (!usuarioActual) return;

  listaOfertasEmpresa.innerHTML = "<p>Cargando ofertas...</p>";

  try {
    const consulta = query(
      collection(db, "ofertasLaborales"),
      where("empleadorUid", "==", usuarioActual.uid)
    );

    const resultado = await getDocs(consulta);

    if (resultado.empty) {
      listaOfertasEmpresa.innerHTML = `
        <div class="empty-message">
          <p>Aún no ha publicado ofertas laborales.</p>
        </div>
      `;
      return;
    }

    listaOfertasEmpresa.innerHTML = "";

    resultado.forEach((documento) => {
      const oferta = documento.data();

      const card = document.createElement("article");
      card.classList.add("job-public-card");

      card.innerHTML = `
        <h3>${oferta.titulo || "Oferta sin título"}</h3>
        <p><strong>Ciudad:</strong> ${oferta.ciudad || "No registra"}</p>
        <p><strong>Modalidad:</strong> ${oferta.modalidad || "No registra"}</p>
        <p><strong>Salario:</strong> ${oferta.salario || "No registra"}</p>
        <p><strong>Estado:</strong> ${oferta.estado || "publicada"}</p>
      `;

      listaOfertasEmpresa.appendChild(card);
    });

  } catch (error) {
    console.error("Error cargando ofertas:", error);
    listaOfertasEmpresa.innerHTML = `
      <div class="empty-message">
        <p>No se pudieron cargar sus ofertas.</p>
      </div>
    `;
  }
}

cerrarSesionEmpleador.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login-empleador.html";
});