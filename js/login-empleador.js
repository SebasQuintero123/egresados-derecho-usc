import { auth, db } from "./firebaseConfig.js";

import {
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const formLoginEmpleador = document.getElementById("formLoginEmpleador");

formLoginEmpleador.addEventListener("submit", async (event) => {
  event.preventDefault();

  const correo = document.getElementById("correoLoginEmpresa").value.trim();
  const password = document.getElementById("passwordLoginEmpresa").value;

  try {
    const credencial = await signInWithEmailAndPassword(auth, correo, password);
    const usuario = credencial.user;

    const empleadorRef = doc(db, "empleadores", usuario.uid);
    const empleadorDoc = await getDoc(empleadorRef);

    if (!empleadorDoc.exists()) {
      alert("No se encontró una cuenta empresarial asociada a este correo.");
      await signOut(auth);
      return;
    }

    const datos = empleadorDoc.data();

    if (datos.rol !== "empleador") {
      alert("Esta cuenta no pertenece a un empleador.");
      await signOut(auth);
      return;
    }

    if (datos.estado !== "activo") {
      alert("La cuenta empresarial no está activa.");
      await signOut(auth);
      return;
    }

    window.location.href = "panel-empleador.html";

  } catch (error) {
    console.error("Error al iniciar sesión como empleador:", error);
    alert("Correo o contraseña incorrectos.");
  }
});