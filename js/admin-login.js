import { auth, db } from "./firebaseConfig.js";

import {
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const formAdminLogin = document.getElementById("formAdminLogin");

console.log("admin-login.js cargado correctamente");

formAdminLogin.addEventListener("submit", async (event) => {
  event.preventDefault();

  const correo = document.getElementById("correoAdmin").value.trim();
  const password = document.getElementById("passwordAdmin").value;

  try {
    const credencial = await signInWithEmailAndPassword(auth, correo, password);
    const usuario = credencial.user;

    console.log("Usuario autenticado:", usuario.uid);

    const adminRef = doc(db, "admin", usuario.uid);
    const adminDoc = await getDoc(adminRef);

    if (!adminDoc.exists()) {
      alert("Este usuario no tiene permisos de administrador.");
      await signOut(auth);
      return;
    }

    const datosAdmin = adminDoc.data();

    if (datosAdmin.rol !== "admin" || datosAdmin.activo !== true) {
      alert("El usuario no está activo como administrador.");
      await signOut(auth);
      return;
    }

    window.location.href = "admin.html";

  } catch (error) {
    console.error("Error admin:", error);
    alert("No se pudo iniciar sesión. Revise correo, contraseña o permisos.");
  }
});