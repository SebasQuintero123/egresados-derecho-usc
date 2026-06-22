import { db } from "./firebaseConfig.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const formEmpleador = document.getElementById("formEmpleador");

formEmpleador.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await addDoc(collection(db, "empleadores"), {
      nombreEmpresa: document.getElementById("nombreEmpresa").value,
      nit: document.getElementById("nit").value,
      correoEmpresa: document.getElementById("correoEmpresa").value,
      telefonoEmpresa: document.getElementById("telefonoEmpresa").value,
      ciudadEmpresa: document.getElementById("ciudadEmpresa").value,
      personaContacto: document.getElementById("personaContacto").value,
      rol: "empleador",
      estado: "pendiente",
      fechaRegistro: serverTimestamp()
    });

    alert("Registro enviado. La universidad revisará la información.");
    formEmpleador.reset();

  } catch (error) {
    console.error("Error al registrar empleador:", error);
    alert("No se pudo enviar el registro.");
  }
});