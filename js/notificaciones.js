function getToastContainer() {
  let container = document.querySelector(".toast-container");

  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  return container;
}

function getToastIcon(type) {
  switch (type) {
    case "success":
      return "✅";
    case "error":
      return "❌";
    case "warning":
      return "⚠️";
    case "info":
    default:
      return "ℹ️";
  }
}

function getToastTitle(type) {
  switch (type) {
    case "success":
      return "Éxito";
    case "error":
      return "Error";
    case "warning":
      return "Atención";
    case "info":
    default:
      return "Información";
  }
}

export function mostrarToast(mensaje, tipo = "info", duracion = 3500) {
  const container = getToastContainer();

  const toast = document.createElement("div");
  toast.className = `custom-toast ${tipo}`;

  toast.innerHTML = `
    <div class="toast-icon">${getToastIcon(tipo)}</div>
    <div class="toast-content">
      <div class="toast-title">${getToastTitle(tipo)}</div>
      <div class="toast-message">${mensaje}</div>
    </div>
    <button class="toast-close" aria-label="Cerrar">×</button>
  `;

  container.appendChild(toast);

  const cerrar = () => {
    toast.style.animation = "toastOut 0.2s ease forwards";
    setTimeout(() => toast.remove(), 200);
  };

  toast.querySelector(".toast-close").addEventListener("click", cerrar);

  setTimeout(cerrar, duracion);
}

export function mostrarModal({
  titulo = "Mensaje",
  mensaje = "",
  textoBoton = "Aceptar"
} = {}) {
  const overlay = document.createElement("div");
  overlay.className = "custom-modal-overlay";

  overlay.innerHTML = `
    <div class="custom-modal">
      <div class="custom-modal-header">
        <h3>${titulo}</h3>
      </div>
      <div class="custom-modal-body">
        <p>${mensaje}</p>
      </div>
      <div class="custom-modal-footer">
        <button class="custom-btn custom-btn-primary">${textoBoton}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const cerrar = () => overlay.remove();

  overlay.querySelector(".custom-btn-primary").addEventListener("click", cerrar);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) cerrar();
  });
}

export function mostrarConfirmacion({
  titulo = "Confirmar acción",
  mensaje = "¿Desea continuar?",
  textoAceptar = "Sí, continuar",
  textoCancelar = "Cancelar"
} = {}) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "custom-modal-overlay";

    overlay.innerHTML = `
      <div class="custom-modal">
        <div class="custom-modal-header">
          <h3>${titulo}</h3>
        </div>
        <div class="custom-modal-body">
          <p>${mensaje}</p>
        </div>
        <div class="custom-modal-footer">
          <button class="custom-btn custom-btn-secondary">${textoCancelar}</button>
          <button class="custom-btn custom-btn-primary">${textoAceptar}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const cerrar = (respuesta) => {
      overlay.remove();
      resolve(respuesta);
    };

    const btnCancelar = overlay.querySelector(".custom-btn-secondary");
    const btnAceptar = overlay.querySelector(".custom-btn-primary");

    btnCancelar.addEventListener("click", () => cerrar(false));
    btnAceptar.addEventListener("click", () => cerrar(true));

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) cerrar(false);
    });
  });
}
