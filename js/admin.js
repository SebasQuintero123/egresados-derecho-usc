import { auth, db } from "./firebaseConfig.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const listaPendientes = document.getElementById("listaPendientes");
const cerrarAdmin = document.getElementById("cerrarAdmin");

console.log("admin.js cargado correctamente");

onAuthStateChanged(auth, async (usuario) => {
  if (!usuario) {
    window.location.href = "admin-login.html";
    return;
  }

  const adminRef = doc(db, "admin", usuario.uid);
  const adminDoc = await getDoc(adminRef);

  if (!adminDoc.exists()) {
    alert("No tiene permisos de administrador.");
    await signOut(auth);
    window.location.href = "admin-login.html";
    return;
  }

  cargarPendientes();
});

async function cargarPendientes() {
  listaPendientes.innerHTML = "";

  try {
    const consulta = query(
      collection(db, "egresados"),
      where("estado", "==", "pendiente")
    );

    const resultado = await getDocs(consulta);

    if (resultado.empty) {
      listaPendientes.innerHTML = `
        <div class="empty-message">
          <p>No hay egresados pendientes por aprobar.</p>
        </div>
      `;
      return;
    }

    resultado.forEach((documento) => {
      const datos = documento.data();

      const card = document.createElement("article");
      card.classList.add("admin-card");

      card.innerHTML = `
        <h2>${datos.nombre || "Sin nombre"}</h2>

        <div class="admin-info">
          <p><strong>Documento:</strong> ${datos.documento || "No registra"}</p>
          <p><strong>Programa:</strong> ${datos.programa || "No registra"}</p>
          <p><strong>Año o fecha de grado:</strong> ${datos.anioGrado || "No registra"}</p>
          <p><strong>Correo:</strong> ${datos.correo || "No registra"}</p>
          <p><strong>Celular:</strong> ${datos.celular || "No registra"}</p>
          <p><strong>Ciudad:</strong> ${datos.ciudad || "No registra"}</p>
          <p><strong>Cargo actual:</strong> ${datos.cargoActual || "No registra"}</p>
          <p><strong>Estado:</strong> ${datos.estado || "pendiente"}</p>
        </div>

        <div class="admin-actions">
          <button class="btn-approve">Aprobar egresado</button>
          <button class="btn-reject">Rechazar</button>
        </div>
      `;

      const btnAprobar = card.querySelector(".btn-approve");
      const btnRechazar = card.querySelector(".btn-reject");

      btnAprobar.addEventListener("click", async () => {
        await updateDoc(doc(db, "egresados", documento.id), {
          estado: "aprobado",
          fechaAprobacion: serverTimestamp()
        });

        alert("Egresado aprobado correctamente.");
        cargarPendientes();
      });

      btnRechazar.addEventListener("click", async () => {
        await updateDoc(doc(db, "egresados", documento.id), {
          estado: "rechazado",
          fechaRevision: serverTimestamp()
        });

        alert("Registro rechazado.");
        cargarPendientes();
      });

      listaPendientes.appendChild(card);
    });

  } catch (error) {
    console.error("Error cargando pendientes:", error);
    listaPendientes.innerHTML = `
      <div class="empty-message">
        <p>No se pudieron cargar los registros. Revise las reglas de Firebase o la consola.</p>
      </div>
    `;
  }
}

cerrarAdmin.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "admin-login.html";
});