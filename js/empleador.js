import { db } from "./firebaseConfig.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const formEmpleador = document.getElementById("formEmpleador");
const zonaHojasVida = document.getElementById("zonaHojasVida");
const listaHojasVida = document.getElementById("listaHojasVida");
const buscarEgresado = document.getElementById("buscarEgresado");

let hojasVida = [];

formEmpleador.addEventListener("submit", async (event) => {
  event.preventDefault();

  const datosEmpleador = {
    empresa: document.getElementById("empresa").value.trim(),
    nit: document.getElementById("nit").value.trim(),
    correoEmpresa: document.getElementById("correoEmpresa").value.trim(),
    telefonoEmpresa: document.getElementById("telefonoEmpresa").value.trim(),
    ciudadEmpresa: document.getElementById("ciudadEmpresa").value.trim(),
    personaContacto: document.getElementById("personaContacto").value.trim(),
    fechaRegistro: serverTimestamp()
  };

  try {
    await addDoc(collection(db, "empleadores"), datosEmpleador);

    alert("Registro de empleador guardado correctamente.");

    formEmpleador.reset();
    zonaHojasVida.classList.remove("hidden");

    cargarHojasVida();

  } catch (error) {
    console.error("Error al registrar empleador:", error);
    alert("No se pudo registrar el empleador.");
  }
});

async function cargarHojasVida() {
  listaHojasVida.innerHTML = "<p>Cargando hojas de vida...</p>";

  try {
    const consulta = query(
      collection(db, "egresados"),
      where("hojaDeVidaPublicada", "==", true),
      where("estado", "==", "aprobado")
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
        <p>No se pudieron cargar las hojas de vida. Revise las reglas de Firebase.</p>
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

      <div class="cv-section">
        <h4>Idiomas</h4>
        <p>${egresado.idiomas || "No registra idiomas."}</p>
      </div>

      <div class="cv-section">
        <h4>Movilidad</h4>
        <p>${egresado.movilidad || "No registra disponibilidad."}</p>
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