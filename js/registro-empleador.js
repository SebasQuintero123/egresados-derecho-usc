import { auth, db } from "./firebaseConfig.js";

import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const formRegistroEmpleador = document.getElementById("formRegistroEmpleador");

formRegistroEmpleador.addEventListener("submit", async (event) => {
  event.preventDefault();

  const empresa = document.getElementById("empresa").value.trim();
  const nit = document.getElementById("nit").value.trim();
  const correoEmpresa = document.getElementById("correoEmpresa").value.trim();
  const telefonoEmpresa = document.getElementById("telefonoEmpresa").value.trim();
  const ciudadEmpresa = document.getElementById("ciudadEmpresa").value.trim();
  const personaContacto = document.getElementById("personaContacto").value.trim();
  const password = document.getElementById("passwordEmpresa").value;
  const confirmarPassword = document.getElementById("confirmarPasswordEmpresa").value;

  if (password !== confirmarPassword) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  if (password.length < 6) {
    alert("La contraseña debe tener mínimo 6 caracteres.");
    return;
  }

  try {
    const credencial = await createUserWithEmailAndPassword(auth, correoEmpresa, password);
    const usuario = credencial.user;

    await setDoc(doc(db, "empleadores", usuario.uid), {
      uid: usuario.uid,
      empresa,
      nit,
      correoEmpresa,
      telefonoEmpresa,
      ciudadEmpresa,
      personaContacto,
      rol: "empleador",
      estado: "activo",
      fechaRegistro: serverTimestamp()
    });

    alert("Cuenta empresarial creada correctamente.");

    formRegistroEmpleador.reset();
    window.location.href = "login-empleador.html";

  } catch (error) {
    console.error("Error al registrar empleador:", error);

    if (error.code === "auth/email-already-in-use") {
      alert("Este correo ya está registrado. Intente iniciar sesión.");
    } else if (error.code === "auth/invalid-email") {
      alert("El correo empresarial no es válido.");
    } else if (error.code === "auth/weak-password") {
      alert("La contraseña debe tener mínimo 6 caracteres.");
    } else {
      alert("No se pudo crear la cuenta empresarial.");
    }
  }
});