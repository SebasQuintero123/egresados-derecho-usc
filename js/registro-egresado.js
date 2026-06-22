import { auth, db } from "./firebaseConfig.js";

import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const formRegistro = document.getElementById("formRegistro");

formRegistro.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const documento = document.getElementById("documento").value.trim();
  const programa = document.getElementById("programa").value.trim();
  const anioGrado = document.getElementById("anioGrado").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const celular = document.getElementById("celular").value.trim();
  const ciudad = document.getElementById("ciudad").value.trim();
  const cargoActual = document.getElementById("cargoActual").value.trim();
  const password = document.getElementById("password").value;
  const confirmarPassword = document.getElementById("confirmarPassword").value;

  if (password !== confirmarPassword) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  if (password.length < 6) {
    alert("La contraseña debe tener mínimo 6 caracteres.");
    return;
  }

  try {
    const credencial = await createUserWithEmailAndPassword(auth, correo, password);
    const usuario = credencial.user;

    await setDoc(doc(db, "egresados", usuario.uid), {
      uid: usuario.uid,
      nombre: nombre,
      documento: documento,
      programa: programa,
      anioGrado: anioGrado,
      correo: correo,
      celular: celular,
      ciudad: ciudad,
      cargoActual: cargoActual,
      rol: "egresado",
      estado: "pendiente",
      hojaDeVidaPublicada: false,
      fechaRegistro: serverTimestamp()
    });

    alert("Registro enviado correctamente. El administrador revisará su información y habilitará su acceso.");

    formRegistro.reset();
    window.location.href = "login-egresado.html";

  } catch (error) {
    console.error("Error completo:", error);
    console.error("Código del error:", error.code);

    if (error.code === "auth/email-already-in-use") {
      alert("Este correo ya está registrado. Intente iniciar sesión.");
    } else if (error.code === "auth/weak-password") {
      alert("La contraseña debe tener mínimo 6 caracteres.");
    } else if (error.code === "auth/invalid-email") {
      alert("El correo electrónico no es válido.");
    } else {
      alert("No se pudo crear el registro. Revise la consola.");
    }
  }
});