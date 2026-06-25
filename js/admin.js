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
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

alert("admin.js versión 10 cargado");

// ===============================
// ELEMENTOS PRINCIPALES
// ===============================
const cerrarSesionAdmin = document.getElementById("cerrarSesionAdmin");

const btnPendientes = document.getElementById("btnPendientes");
const btnRechazados = document.getElementById("btnRechazados");
const btnEventosAdmin = document.getElementById("btnEventosAdmin");

const seccionPendientes = document.getElementById("seccionPendientes");
const seccionRechazados = document.getElementById("seccionRechazados");
const seccionEventosAdmin = document.getElementById("seccionEventosAdmin");

const listaPendientes = document.getElementById("listaPendientes");
const listaRechazados = document.getElementById("listaRechazados");

const formEvento = document.getElementById("formEvento");
const listaEventosAdmin = document.getElementById("listaEventosAdmin");

let usuarioAdmin = null;

// ===============================
// VALIDAR ADMINISTRADOR
// ===============================
onAuthStateChanged(auth, async (usuario) => {
  if (!usuario) {
    window.location.href = "admin-login.html";
    return;
  }

  try {
    usuarioAdmin = usuario;

    alert("Usuario activo: " + usuario.email + " / UID: " + usuario.uid);


    // IMPORTANTE:
    // Si tu colección en Firestore se llama "admins", déjalo así.
    // No debe ser "admin" en singular.
    const adminRef = doc(db, "admin", usuario.uid);
    const adminDoc = await getDoc(adminRef);

    if (!adminDoc.exists()) {
      alert("No tiene permisos de administrador.");
      await signOut(auth);
      window.location.href = "admin-login.html";
      return;
    }

    const datosAdmin = adminDoc.data();

    if (datosAdmin.rol !== "admin" || datosAdmin.activo !== true) {
      alert("El acceso de administrador no está activo.");
      await signOut(auth);
      window.location.href = "admin-login.html";
      return;
    }

    cargarPendientes();
    cargarRechazados();
    cargarEventosAdmin();

  } catch (error) {
  console.error("Error validando administrador:", error);
  alert("Error real: " + error.message);
  await signOut(auth);
  window.location.href = "admin-login.html";
}
});

// ===============================
// CAMBIO DE PESTAÑAS
// ===============================
function limpiarTabs() {
  seccionPendientes.classList.add("hidden");
  seccionRechazados.classList.add("hidden");
  seccionEventosAdmin.classList.add("hidden");

  btnPendientes.classList.remove("active");
  btnRechazados.classList.remove("active");
  btnEventosAdmin.classList.remove("active");
}

btnPendientes.addEventListener("click", () => {
  limpiarTabs();

  seccionPendientes.classList.remove("hidden");
  btnPendientes.classList.add("active");

  cargarPendientes();
});

btnRechazados.addEventListener("click", () => {
  limpiarTabs();

  seccionRechazados.classList.remove("hidden");
  btnRechazados.classList.add("active");

  cargarRechazados();
});

btnEventosAdmin.addEventListener("click", () => {
  limpiarTabs();

  seccionEventosAdmin.classList.remove("hidden");
  btnEventosAdmin.classList.add("active");

  cargarEventosAdmin();
});

// ===============================
// CARGAR PENDIENTES
// ===============================
async function cargarPendientes() {
  listaPendientes.innerHTML = "<p>Cargando registros pendientes...</p>";

  try {
    const consulta = query(
      collection(db, "egresados"),
      where("estado", "==", "pendiente")
    );

    const resultado = await getDocs(consulta);

    if (resultado.empty) {
      listaPendientes.innerHTML = `
        <div class="admin-empty">
          <p>No hay egresados pendientes por aprobar.</p>
        </div>
      `;
      return;
    }

    listaPendientes.innerHTML = "";

    resultado.forEach((documento) => {
      const egresado = documento.data();

      const card = document.createElement("article");
      card.classList.add("admin-item");

      card.innerHTML = `
        <h3>${egresado.nombre || "Sin nombre"}</h3>

        <div class="admin-info-grid">
          <p><strong>Documento:</strong> ${egresado.documento || "No registra"}</p>
          <p><strong>Correo:</strong> ${egresado.correo || "No registra"}</p>
          <p><strong>Programa:</strong> ${egresado.programa || "Derecho"}</p>
          <p><strong>Ciudad:</strong> ${egresado.ciudad || "No registra"}</p>
          <p><strong>Celular:</strong> ${egresado.celular || "No registra"}</p>
          <p><strong>Cargo:</strong> ${egresado.cargoActual || "No registra"}</p>
        </div>

        <div class="admin-actions">
          <button class="btn-approve">Aprobar</button>
          <button class="btn-reject">Rechazar</button>
        </div>
      `;

      card.querySelector(".btn-approve")
        .addEventListener("click", () => aprobarEgresado(documento.id));

      card.querySelector(".btn-reject")
        .addEventListener("click", () => rechazarEgresado(documento.id));

      listaPendientes.appendChild(card);
    });

  } catch (error) {
    console.error("Error cargando pendientes:", error);
    listaPendientes.innerHTML = "<p>No se pudieron cargar los registros pendientes.</p>";
  }
}

// ===============================
// APROBAR EGRESADO
// ===============================
async function aprobarEgresado(uid) {
  const confirmar = confirm("¿Está seguro de aprobar este egresado?");

  if (!confirmar) return;

  try {
    await updateDoc(doc(db, "egresados", uid), {
      estado: "aprobado",
      fechaAprobacion: serverTimestamp()
    });

    alert("Egresado aprobado correctamente.");
    cargarPendientes();

  } catch (error) {
    console.error("Error aprobando egresado:", error);
    alert("No se pudo aprobar el egresado.");
  }
}

// ===============================
// RECHAZAR EGRESADO
// ===============================
async function rechazarEgresado(uid) {
  const motivo = prompt("Escriba el motivo del rechazo:");

  if (motivo === null) return;

  const confirmar = confirm("¿Está seguro de rechazar este registro?");

  if (!confirmar) return;

  try {
    await updateDoc(doc(db, "egresados", uid), {
      estado: "rechazado",
      motivoRechazo: motivo.trim() || "Sin motivo registrado",
      fechaRechazo: serverTimestamp()
    });

    alert("Registro rechazado.");
    cargarPendientes();
    cargarRechazados();

  } catch (error) {
    console.error("Error rechazando egresado:", error);
    alert("No se pudo rechazar el registro.");
  }
}

// ===============================
// CARGAR RECHAZADOS
// ===============================
async function cargarRechazados() {
  listaRechazados.innerHTML = "<p>Cargando registros rechazados...</p>";

  try {
    const consulta = query(
      collection(db, "egresados"),
      where("estado", "==", "rechazado")
    );

    const resultado = await getDocs(consulta);

    if (resultado.empty) {
      listaRechazados.innerHTML = `
        <div class="admin-empty">
          <p>No hay registros rechazados.</p>
        </div>
      `;
      return;
    }

    listaRechazados.innerHTML = "";

    resultado.forEach((documento) => {
      const egresado = documento.data();

      const card = document.createElement("article");
      card.classList.add("admin-item", "rejected-item");

      card.innerHTML = `
        <h3>${egresado.nombre || "Sin nombre"}</h3>

        <div class="admin-info-grid">
          <p><strong>Documento:</strong> ${egresado.documento || "No registra"}</p>
          <p><strong>Correo:</strong> ${egresado.correo || "No registra"}</p>
          <p><strong>Ciudad:</strong> ${egresado.ciudad || "No registra"}</p>
          <p><strong>Motivo:</strong> ${egresado.motivoRechazo || "Sin motivo"}</p>
        </div>

        <div class="admin-actions">
          <button class="btn-restore">Volver a pendiente</button>
          <button class="btn-delete">Eliminar registro</button>
        </div>
      `;

      card.querySelector(".btn-restore")
        .addEventListener("click", () => restaurarEgresado(documento.id));

      card.querySelector(".btn-delete")
        .addEventListener("click", () => eliminarEgresado(documento.id, egresado.nombre));

      listaRechazados.appendChild(card);
    });

  } catch (error) {
    console.error("Error cargando rechazados:", error);
    listaRechazados.innerHTML = "<p>No se pudieron cargar los registros rechazados.</p>";
  }
}

// ===============================
// RESTAURAR RECHAZADO
// ===============================
async function restaurarEgresado(uid) {
  const confirmar = confirm("¿Desea volver este registro a pendiente?");

  if (!confirmar) return;

  try {
    await updateDoc(doc(db, "egresados", uid), {
      estado: "pendiente",
      motivoRechazo: "",
      fechaRestauracion: serverTimestamp()
    });

    alert("Registro enviado nuevamente a pendientes.");
    cargarRechazados();
    cargarPendientes();

  } catch (error) {
    console.error("Error restaurando egresado:", error);
    alert("No se pudo restaurar el registro.");
  }
}

// ===============================
// ELIMINAR RECHAZADO
// ===============================
async function eliminarEgresado(uid, nombre) {
  const confirmar = confirm(`¿Está seguro de eliminar el registro de ${nombre || "este egresado"}?`);

  if (!confirmar) return;

  const confirmarFinal = confirm("Esta acción no se puede deshacer. ¿Desea continuar?");

  if (!confirmarFinal) return;

  try {
    await deleteDoc(doc(db, "egresados", uid));

    alert("Registro eliminado correctamente.");
    cargarRechazados();

  } catch (error) {
    console.error("Error eliminando registro:", error);
    alert("No se pudo eliminar el registro.");
  }
}

// ===============================
// CREAR EVENTO
// ===============================
formEvento.addEventListener("submit", async (event) => {
  event.preventDefault();

  const titulo = document.getElementById("tituloEvento").value.trim();
  const fechaEvento = document.getElementById("fechaEvento").value;
  const horaEvento = document.getElementById("horaEvento").value;
  const lugar = document.getElementById("lugarEvento").value.trim();
  const modalidad = document.getElementById("modalidadEvento").value;
  const descripcion = document.getElementById("descripcionEvento").value.trim();
  const enlace = document.getElementById("enlaceEvento").value.trim();

  try {
    await addDoc(collection(db, "eventos"), {
      titulo,
      fechaEvento,
      horaEvento,
      lugar,
      modalidad,
      descripcion,
      enlace,
      estado: "publicado",
      creadoPor: usuarioAdmin.uid,
      fechaCreacion: serverTimestamp()
    });

    alert("Evento publicado correctamente.");
    formEvento.reset();
    cargarEventosAdmin();

  } catch (error) {
    console.error("Error publicando evento:", error);
    alert("No se pudo publicar el evento. Revise permisos o consola.");
  }
});

// ===============================
// CARGAR EVENTOS ADMIN
// ===============================
async function cargarEventosAdmin() {
  listaEventosAdmin.innerHTML = "<p>Cargando eventos...</p>";

  try {
    const consulta = query(
      collection(db, "eventos"),
      orderBy("fechaEvento", "asc")
    );

    const resultado = await getDocs(consulta);

    if (resultado.empty) {
      listaEventosAdmin.innerHTML = `
        <div class="admin-empty">
          <p>No hay eventos publicados.</p>
        </div>
      `;
      return;
    }

    listaEventosAdmin.innerHTML = "";

    resultado.forEach((documento) => {
      const evento = documento.data();

      const card = document.createElement("article");
      card.classList.add("admin-item");

      card.innerHTML = `
        <h3>${evento.titulo || "Evento sin título"}</h3>

        <div class="admin-info-grid">
          <p><strong>Fecha:</strong> ${evento.fechaEvento || "No registra"}</p>
          <p><strong>Hora:</strong> ${evento.horaEvento || "No registra"}</p>
          <p><strong>Modalidad:</strong> ${evento.modalidad || "No registra"}</p>
          <p><strong>Lugar:</strong> ${evento.lugar || "No registra"}</p>
          <p><strong>Estado:</strong> ${evento.estado || "publicado"}</p>
        </div>

        <p class="admin-description">${evento.descripcion || ""}</p>

        ${
          evento.enlace
            ? `<p><a href="${evento.enlace}" target="_blank">Ver enlace del evento</a></p>`
            : ""
        }

        <div class="admin-actions">
          <button class="btn-reject">Ocultar evento</button>
          <button class="btn-delete">Eliminar evento</button>
        </div>
      `;

      card.querySelector(".btn-reject")
        .addEventListener("click", () => ocultarEvento(documento.id));

      card.querySelector(".btn-delete")
        .addEventListener("click", () => eliminarEvento(documento.id));

      listaEventosAdmin.appendChild(card);
    });

  } catch (error) {
    console.error("Error cargando eventos:", error);
    listaEventosAdmin.innerHTML = "<p>No se pudieron cargar los eventos.</p>";
  }
}

// ===============================
// OCULTAR EVENTO
// ===============================
async function ocultarEvento(id) {
  const confirmar = confirm("¿Desea ocultar este evento para los egresados?");

  if (!confirmar) return;

  try {
    await updateDoc(doc(db, "eventos", id), {
      estado: "oculto",
      fechaOculto: serverTimestamp()
    });

    alert("Evento ocultado.");
    cargarEventosAdmin();

  } catch (error) {
    console.error("Error ocultando evento:", error);
    alert("No se pudo ocultar el evento.");
  }
}

// ===============================
// ELIMINAR EVENTO
// ===============================
async function eliminarEvento(id) {
  const confirmar = confirm("¿Está seguro de eliminar este evento?");

  if (!confirmar) return;

  try {
    await deleteDoc(doc(db, "eventos", id));

    alert("Evento eliminado.");
    cargarEventosAdmin();

  } catch (error) {
    console.error("Error eliminando evento:", error);
    alert("No se pudo eliminar el evento.");
  }
}

// ===============================
// CERRAR SESIÓN
// ===============================
cerrarSesionAdmin.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "admin-login.html";
});
