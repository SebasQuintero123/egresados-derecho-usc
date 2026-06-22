import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDBG3ZQxBnpvZEiM3As2jFOcFWqNqre6o",
  authDomain: "egresadosderechousc.firebaseapp.com",
  projectId: "egresadosderechousc",
  storageBucket: "egresadosderechousc.appspot.com",
  messagingSenderId: "584207512744",
  appId: "1:584207512744:web:68e04108ae0c909d5b7e9d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const formulario = document.getElementById("formulario");

formulario.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await addDoc(collection(db, "egresados"), {
      nombre: document.getElementById("nombre").value,
      documento: document.getElementById("documento").value,
      programa: document.getElementById("programa").value,
      anioGrado: document.getElementById("anioGrado").value,
      correo: document.getElementById("correo").value,
      celular: document.getElementById("celular").value,
      ciudad: document.getElementById("ciudad").value,
      cargoActual: document.getElementById("cargoActual").value,
      estado: "pendiente",
      fechaRegistro: serverTimestamp()
    });

    alert("Datos enviados correctamente");
    formulario.reset();
    localStorage.setItem("registroGuardado", "true");
    mostrarBannerRegistro();

  } catch (error) {
    console.error(error);
    alert("Error al guardar datos");
  }
});

const bannerRegistro = document.getElementById("registroGuardadoBanner");

function mostrarBannerRegistro() {
  if (localStorage.getItem("registroGuardado") === "true") {
    bannerRegistro.classList.remove("hidden");
  } else {
    bannerRegistro.classList.add("hidden");
  }
}

window.addEventListener("load", mostrarBannerRegistro);
