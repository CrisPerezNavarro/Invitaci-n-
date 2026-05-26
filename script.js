// ==========================================
// 1. CONFIGURACIÓN Y LÓGICA DEL CONTADOR
// ==========================================
const weddingDate = new Date('2026-07-25T15:30:00-06:00'); // Fecha del evento con zona horaria de Costa Rica (-06:00)
const ids = ['days', 'hours', 'minutes', 'seconds'];

function tick() {
  const diff = weddingDate - new Date(); // Calcula la diferencia de tiempo actual con la de la boda
  const total = Math.max(0, Math.floor(diff / 1000)); // Evita números negativos si la fecha expira
  
  // Conversión matemática de milisegundos a unidades de tiempo ordinarias
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  
  // Inyecta los valores numéricos calculados dentro de los contenedores HTML respectivos
  [days, hours, minutes, seconds].forEach((v, i) => {
    document.getElementById(ids[i]).textContent = v;
  });
}
// Inicializa el contador inmediatamente y configura el bucle para que se ejecute cada segundo
tick(); 
setInterval(tick, 1000);


// ==========================================
// 2. EFECTO ANIMACIÓN AL HACER SCROLL (REVEAL)
// ==========================================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => { 
    // Cuando el elemento entra al 15% visual de la pantalla, se le añade la clase CSS '.visible'
    if (entry.isIntersecting) {
      entry.target.classList.add('visible'); 
    }
  });
}, { threshold: .15 });

// Busca todos los elementos que contengan la clase '.reveal' y los pone bajo la observación del script
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));


// ==========================================
// 3. CONTROLADOR DEL REPRODUCTOR DE MÚSICA
// ==========================================
const music = document.getElementById('bgMusic');
const btn = document.getElementById('musicBtn');
let playing = false;

btn.addEventListener('click', async () => {
  try {
    if (!playing) { 
      await music.play(); 
      btn.textContent = 'Ⅱ'; // Cambia el ícono del botón a pausa
      playing = true; 
    } else { 
      music.pause(); 
      btn.textContent = '♪'; // Regresa el ícono a nota musical
      playing = false; 
    }
  } catch (e) { 
    // Alerta de seguridad por si se intenta reproducir sin haber subido el archivo correspondiente
    alert('Agrega el archivo de música en assets/tu-fidelidad-instrumental.mp3'); 
  }
});


// ==========================================
// 4. SISTEMA DE INVITACIONES PERSONALIZADAS VIA URL
// ==========================================
async function personalizarInvitacion() {
  const urlParams = new URLSearchParams(window.location.search);
  const llaveInvitado = urlParams.get('invitado');

  // Los dos números oficiales de Costa Rica
  const telefonoAngie = "50689768296";
  const telefonoCristhofer = "50685970313";

  // Texto de respaldo por si el JSON falla o no hay invitado
  let mensajeGeneral = "¡Hola! Confirmo mi asistencia a la boda.";
  
  // 1. PASO CRÍTICO: Asignar enlaces básicos DE INMEDIATO para que nunca fallen los botones
  const btnAngie = document.getElementById('whatsappBtn1');
  const btnCristhofer = document.getElementById('whatsappBtn2');

  if (btnAngie) btnAngie.href = `https://wa.me/${telefonoAngie}?text=${encodeURIComponent(mensajeGeneral)}`;
  if (btnCristhofer) btnCristhofer.href = `https://wa.me/${telefonoCristhofer}?text=${encodeURIComponent(mensajeGeneral)}`;

  // Si no hay llave en la URL, nos detenemos aquí de forma segura
  if (!llaveInvitado) {
    console.log("Acceso general: Botones configurados con mensaje estándar.");
    return;
  }

  // 2. Intentar cargar la personalización
  try {
    const respuesta = await fetch('invitados.json');
    if (!respuesta.ok) throw new Error("No se pudo leer el archivo invitados.json");
    
    const invitados = await respuesta.json();
    const datos = invitados[llaveInvitado];

    if (datos) {
      // Modificar tarjeta de espacios
      const txtEspacios = document.getElementById('textoEspacios');
      if (txtEspacios) {
        if (datos.pases === 1) {
          txtEspacios.innerHTML = `Hemos reservado <strong>${datos.pases} espacio</strong> especialmente para ti.`;
        } else {
          txtEspacios.innerHTML = `Hemos reservado <strong>${datos.pases} espacios</strong> especialmente para tu familia.`;
        }
      }

      // Modificar saludo de bienvenida
      const saludo = document.getElementById('saludoConfirmacion');
      if (saludo) saludo.innerHTML = `¡<strong>${datos.nombre}</strong>, nos encantaría contar con su presencia!`;

      // Crear mensaje personalizado estructurado
      const mensajeWA = `¡Hola! Confirmo mi asistencia a la boda. %0A%0A👤 Nombre: ${encodeURIComponent(datos.nombre)}%0A👥 Pases asignados: ${datos.pases}`;
      
      // Sobrescribir los botones con el mensaje personalizado de los invitados
      if (btnAngie) btnAngie.href = `https://wa.me/${telefonoAngie}?text=${mensajeWA}`;
      if (btnCristhofer) btnCristhofer.href = `https://wa.me/${telefonoCristhofer}?text=${mensajeWA}`;

      console.log(`Invitación cargada con éxito para: ${datos.nombre}`);
    } else {
      console.warn(`La llave "${llaveInvitado}" no existe en el JSON.`);
    }
  } catch (error) {
    // Si algo falla (ej: error de sintaxis en el JSON), los botones seguirán funcionando con el mensaje general
    console.error("Aviso: Se usaron los enlaces estándar debido a un problema con el JSON ->", error);
  }
}

// ==========================================
// TRUCO DE PANTALLA DE BIENVENIDA PARA LA MÚSICA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const welcomeOverlay = document.getElementById('welcomeOverlay');
  const enterBtn = document.getElementById('enterBtn');
  const musicBtn = document.getElementById('musicBtn');

  if (enterBtn && welcomeOverlay) {
    enterBtn.addEventListener('click', async () => {
      // 1. Ocultar la pantalla de bienvenida con efecto suave
      welcomeOverlay.classList.add('hidden');
      
      // 2. Intentar reproducir la música (ya que el usuario hizo clic)
      try {
        await music.play();
        if (musicBtn) musicBtn.textContent = 'Ⅱ';
        playing = true;
      } catch (e) {
        console.log("El navegador bloqueó el audio automático.");
      }
    });
  }
});

// Ejecutar la función al cargar la página
document.addEventListener('DOMContentLoaded', personalizarInvitacion);

// Escucha activa: Una vez el navegador cargue el HTML base por completo, ejecuta la función de personalización
document.addEventListener('DOMContentLoaded', personalizarInvitacion);
