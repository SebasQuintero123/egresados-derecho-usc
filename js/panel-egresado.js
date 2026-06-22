import { auth, db } from "./firebaseConfig.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const bienvenida = document.getElementById("bienvenida");
const cerrarSesion = document.getElementById("cerrarSesion");

onAuthStateChanged(auth, async (usuario) => {
  if (!usuario) {
    window.location.href = "login-egresado.html";
    return;
  }

  if (!usuario.emailVerified) {
    alert("Debe verificar su correo.");
    await signOut(auth);
    window.location.href = "login-egresado.html";
    return;
  }

  const referencia = doc(db, "egresados", usuario.uid);
  const documento = await getDoc(referencia);

  if (documento.exists()) {
    const datos = documento.data();
    bienvenida.textContent = "Bienvenido, " + datos.nombre;
  } else {
    bienvenida.textContent = "Bienvenido, egresado";
  }
});

cerrarSesion.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});