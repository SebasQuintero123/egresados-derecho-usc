import { auth, db } from "./firebaseConfig.js";

import {
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const formLogin = document.getElementById("formLogin");

console.log("login-egresado.js cargado correctamente");

// INICIAR SESIÓN
formLogin.addEventListener("submit", async (event) => {
  event.preventDefault();

  const correo = document.getElementById("correoLogin").value.trim();
  const password = document.getElementById("passwordLogin").value;

  try {
    const credencial = await signInWithEmailAndPassword(auth, correo, password);
    const usuario = credencial.user;

    const referencia = doc(db, "egresados", usuario.uid);
    const documento = await getDoc(referencia);

    if (!documento.exists()) {
      alert("No se encontró información del egresado.");
      await signOut(auth);
      return;
    }

    const datos = documento.data();

    if (datos.estado !== "aprobado") {
      alert("Su registro todavía está pendiente de aprobación por parte del administrador.");
      await signOut(auth);
      return;
    }

    window.location.href = "panel-egresado.html";

  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    alert("Correo o contraseña incorrectos.");
  }
});
