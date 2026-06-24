import { auth } from "./firebaseConfig.js";

import {
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

console.log("recuperar-password.js cargado correctamente");

const formRecuperarPassword = document.getElementById("formRecuperarPassword");
const mensajeRecuperacion = document.getElementById("mensajeRecuperacion");

formRecuperarPassword.addEventListener("submit", async (event) => {
  event.preventDefault();

  console.log("Formulario de recuperación enviado");

  const correo = document.getElementById("correoRecuperacion").value.trim();

  if (!correo) {
    mensajeRecuperacion.textContent = "Escriba su correo electrónico.";
    mensajeRecuperacion.style.color = "#8b0000";
    return;
  }

  try {
    auth.languageCode = "es";

    await sendPasswordResetEmail(auth, correo);

    mensajeRecuperacion.textContent =
      "Se envió un enlace de recuperación. Revise su correo o la carpeta de spam.";
    mensajeRecuperacion.style.color = "green";

    alert("Se envió el correo de recuperación.");

  } catch (error) {
    console.error("Error al enviar correo de recuperación:", error);

    mensajeRecuperacion.style.color = "#8b0000";

    if (error.code === "auth/invalid-email") {
      mensajeRecuperacion.textContent = "El correo escrito no es válido.";
    } else if (error.code === "auth/user-not-found") {
      mensajeRecuperacion.textContent = "No existe una cuenta registrada con ese correo.";
    } else {
      mensajeRecuperacion.textContent =
        "No se pudo enviar el correo. Revise la consola para ver el error.";
    }

    alert("No se pudo enviar el correo de recuperación.");
  }
});