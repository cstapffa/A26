/* =============================================================
   Aniversario 26 · lógica del juego
   -------------------------------------------------------------
   1) Configuración          5) Niveles (render + respuestas)
   2) Datos editables        6) Pantalla final
   3) Utilidades             7) Extras (gato y chispas)
   4) Estado y guardado      8) Arranque
   ============================================================= */
"use strict";

/* =============================================================
   1) CONFIGURACIÓN
   ============================================================= */
const CONFIG = {
  nombre: "Nico",
  apodo: "mamol <3",
  firma: "Mila",
  // El mes va de 0 a 11 (9 = octubre).
  fechaPareja: new Date(2023, 7, 25),   // se usa para el contador de "días juntos"
  claveStorage: "anniversary-26",
};

/* =============================================================
   2) DATOS EDITABLES
   -------------------------------------------------------------

   Campos de un nivel:
   - tipo: "texto" (input) | "opciones" (botones)
   - titulo, pregunta, pista
   - visual / visualClase / visualAria: línea grande opcional (emojis, cifrado)
   - opciones: [{ texto, mensaje? }]  (mensaje = respuesta graciosa si la elige)
   - respuestasAceptadas: lista de respuestas válidas (se normalizan solas)
   - recuerdo: { tipo: "texto" | "imagen" | "audio", contenido, alt?, pie? }
       texto  -> contenido es el texto
       imagen -> contenido es la ruta (assets/img/...)
       audio  -> contenido es la ruta (assets/audio/...)
   ============================================================= */
const LEVELS = [
  {
    id: 1,
    tipo: "texto",
    titulo: "La fecha",
    pregunta: "Feriado patrio. Una resaca de un lado, un asado del otro. Dos desconocidos y un match. ¿Qué día fue? (DD/MM)",
    placeholder: "DD/MM",
    respuestasAceptadas: ["25/08", "25/8", "25-08", "25-8", "25 de agosto", "25 agosto"],
    pista: "Independencia de Uruguay.",
    // Si tenés la captura del primer mensaje de Tinder, cambiá el recuerdo por:
    // { tipo: "imagen", contenido: "assets/img/nivel1-tinder.jpg", alt: "Nuestro primer mensaje", pie: "Ahí empezó todo." }
    recuerdo: { tipo: "texto", contenido: "Yo estaba con resaca y vos en un asado. Ahí empezó todo." },
  },
  {
    id: 2,
    tipo: "texto",
    titulo: "La noche anterior",
    pregunta: "La noche antes de hablarnos, vos habías ido a una fiesta Brooklyn y todavía andabas flotando. ¿Qué banda viste?",
    placeholder: "Una banda",
    respuestasAceptadas: ["bandalos chinos", "bandalos", "los bandalos chinos"],
    pista: "Empiezan con B y suenan a travesura.",
    recuerdo: { tipo: "texto", contenido: "Yo no estaba ahí, pero ya te estaba esperando." },
  },
  {
    id: 3,
    tipo: "opciones",
    titulo: "El desastre del vino",
    pregunta: "Tercera cita. Pantalón claro. Una jarra de vino con vocación de cascada. ¿En qué bar pasó?",
    opciones: [
      { texto: "Brecha" },
      { texto: "Finisterre" },
      { texto: "Sumo" },
      { texto: "Un bar que no existe", mensaje: "Ese bar no existe. La jarra de vino, en cambio, sí existió, y mi pantalón lo recuerda." },
    ],
    respuestasAceptadas: ["Finisterre"],
    pista: "No fue en nuestro bar por excelencia.",
    recuerdo: {
      tipo: "imagen",
      contenido: "assets/img/nivel3-brecha.jpg",
      alt: "El bar Brecha",
      pie: "Brecha sigue siendo nuestro bar, pero Finisterre me debe un pantalón.",
    },
  },
  {
    id: 4,
    tipo: "texto",
    titulo: "El cifrado",
    pregunta: "Esto fue lo que usé para engatusarte. Corré cada letra 3 lugares hacia atrás.",
    visual: "wdoodulqhv frq wxfr",           // César +3 de "tallarines con tuco" (verificado)
    visualClase: "entrada__visual--cifra",
    placeholder: "Descifralo",
    respuestasAceptadas: ["tallarines con tuco"],
    pista: "A=D, B=E, C=F... pero al revés. Es una comida.",
    recuerdo: { tipo: "texto", contenido: "Y no, el agua de tanga no fue en un té." },
  },
  {
    id: 5,
    tipo: "texto",
    titulo: "El modo",
    pregunta: "En La Paloma se nos activó un modo. ¿Cuál?",
    visual: "🏡🌊 + 🍄",
    visualClase: "entrada__visual--emoji",
    visualAria: "Una casa, el mar y un par de thais.",
    placeholder: "Un modo",
    respuestasAceptadas: ["araña", "modo araña", "arana", "modo arana"],
    pista: "Tiene ocho patas.",
    recuerdo: {
      tipo: "imagen",
      contenido: "assets/img/nivel5-la-paloma.jpg",
      alt: "La Paloma",
      pie: "Flasheamos lo mismo y no nos dijimos nada hasta el final. Somos un caso.",
    },
  },
  {
    id: 6,
    tipo: "opciones",
    titulo: "El primer toque",
    pregunta: "Nuestro primer toque juntos. Después vinieron Divididos, Rada, La Vela, NTVG, NAFTA y los que siguen... pero el primero fue de:",
    opciones: [
      { texto: "Dillom" },
      { texto: "Pa7triel y Catito Amorosos" },
      { texto: "Luis Miguel", mensaje: "Esa es la playlist de 4 horas, no un toque." },
    ],
    respuestasAceptadas: ["Dillom"],
    pista: "Fue el que abrió la lista.",
    recuerdo: {
      tipo: "imagen",
      contenido: "assets/img/nivel6-toques.jpg",
      alt: "Entradas y fotos de nuestros toques",
      pie: "Y los que faltan.",
    },
  },
  {
    id: 7,
    tipo: "texto",
    titulo: "La canción",
    pregunta: "Unas horas antes de que cumpliera 24, sonaba esta canción en vivo. ¿Cuál?",
    placeholder: "Una canción",
    respuestasAceptadas: ["spaghetti del rock", "spaghetti", "espagueti", "spaguetti", "espagueti del rock", "spaguetti del rock"],
    pista: "Una comida un tanto punk.",
    recuerdo: {
      tipo: "audio",
      contenido: "assets/audio/spaghetti-del-rock.mp3",
      pie: "Esa noche lloramos los dos. Te amo.",
    },
  },
];

/* Mensajes al fallar y al acertar. {nombre} se reemplaza por CONFIG.nombre. */
const FALLOS = [
  "No, {nombre}. Pensalo con más cariño.",
  "Eso no es. Y mirá que estuviste ahí.",
  "Casi. Mentira, no, pero se agradece el esfuerzo.",
  "Incorrecto. Probá de nuevo, que para eso dejé una pista.",
  "Mmm, no. Hacé memoria, que lo vivimos juntos.",
];
const ACIERTOS = [
  "Acertaste. Obvio que te acordabas.",
  "Eso es. Te desbloqueé un recuerdo.",
  "Correcto. Me estás haciendo quedar bien.",
];

/* variante: "rubia" | "paatpat" | "jojo" (define el dibujo en svgGato) */
const GATOS = [
  { nombre: "PaatPat", variante: "paatpat" }, // negro, hocico, panza y patas blancas
  { nombre: "Jojo", variante: "jojo" },       // negro, patas y punta de la cola blancas
  { nombre: "La Rubia", variante: "rubia" },  // ámbar
];

/* Carta final: un string por párrafo. TODO: escribila vos, sin pulir. */
const CARTA = [
  "[PÁRRAFO 1: cómo te sentís hoy, tres años después.]",
  "[PÁRRAFO 2: lo que más extrañás de estar con él.]",
  "[PÁRRAFO 3: algo que le agradezcas o le prometas.]",
  "[PÁRRAFO 4: el cierre, lo último que querés que lea.]",
];

/* "Nuestros tres años". valor puede ser un número o una función.
   Si usás `texto`, se muestra tal cual (sin contador). */
const RESUMEN = [
  { id: "dias", valor: () => diasJuntos(), etiqueta: "días juntos, aunque ahora a distancia", nota: "Y los que faltan, los estoy contando.", grande: true },
  // TODO: actualizá el número de toques si querés. Hoy cuenta los 9 de la lista más "los que se me olvidan".
  { id: "toques", valor: 9, sufijo: "+", etiqueta: "toques, recitales y fiestas", nota: "Dillom, Divididos, Rada, Catriel y Paco Amoroso, La Vela Puerca, NTVG, la Juli, NAFTA, Ete y Los Problems, y los que se me faltan." },
  { id: "gatos", valor: 3, etiqueta: "gatos criados", nota: "PaatPat, Jojo y La Rubia." },
  { id: "luismi", valor: 4, sufijo: " h", etiqueta: "de Luis Miguel en la playlist", nota: "Y contando." },
  { id: "entregas", texto: "Algún par", etiqueta: "entregas de la facultad hechas por mí", nota: "Con tu nota y mi esfuerzo." },
  { id: "bares", texto: "N", etiqueta: "bares en común", nota: "Como queda una lunita." },
];

/* Vales canjeables */
const VALES = [
  { id: "tallarines", titulo: "Vale por unos tallarines con tuco", detalle: "Receta original. Sin té de por medio." },
  { id: "luismi", titulo: "Vale por una noche de Luis Miguel sin quejas", detalle: "Cuatro horas de playlist, cero comentarios." },
  { id: "toque", titulo: "Vale por un toque a elección", detalle: "Yo pongo las ganas, vos elegís la banda." },
  { id: "abrazo", titulo: "Vale por un abrazo largo", detalle: "Se cobra en persona. No vence." }, // TODO: cambialo si querés otro
];

/* =============================================================
   3) UTILIDADES
   ============================================================= */
const $ = (selector, raiz = document) => raiz.querySelector(selector);
const azar = (lista) => lista[Math.floor(Math.random() * lista.length)];
const reducirMovimiento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const scrollArriba = () => window.scrollTo({ top: 0, behavior: reducirMovimiento() ? "auto" : "smooth" });

/* Evita que un texto rompa el HTML al inyectarlo con innerHTML */
const escapar = (texto) =>
  String(texto).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* Minúsculas, sin tildes, sin signos raros y sin espacios dobles.
   "¡Araña! " -> "arana" | "25 de Agosto" -> "25 de agosto" */
const normalizar = (texto) =>
  String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\/\- ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const esCorrecta = (nivel, valor) => {
  const v = normalizar(valor);
  return nivel.respuestasAceptadas.some((r) => normalizar(r) === v);
};

/* Días de calendario entre la fecha de pareja y hoy */
function diasJuntos() {
  const f = CONFIG.fechaPareja;
  const hoy = new Date();
  const a = Date.UTC(f.getFullYear(), f.getMonth(), f.getDate());
  const b = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return Math.max(0, Math.round((b - a) / 86400000));
}

/* Mueve el "corte" de la entrada: las muescas laterales quedan justo
   en la línea punteada, sin importar cuánto mida el talón. */
function ajustarTalon(entrada) {
  const talon = entrada && entrada.querySelector(".entrada__talon");
  if (!talon) return;
  const aplicar = () => entrada.style.setProperty("--talon", `${talon.offsetHeight}px`);
  aplicar();
  if ("ResizeObserver" in window) new ResizeObserver(aplicar).observe(talon);
}

/* =============================================================
   4) ESTADO Y GUARDADO (localStorage con try/catch)
   ============================================================= */
const FASES = ["intro", "nivel", "final"];
const estadoNuevo = () => ({ fase: "intro", nivel: 0, resuelto: false, vales: {} });

function cargarEstado() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CONFIG.claveStorage));
    if (!guardado) return estadoNuevo();
    const e = { ...estadoNuevo(), ...guardado };
    if (!FASES.includes(e.fase)) return estadoNuevo();
    if (!Number.isInteger(e.nivel) || e.nivel < 0 || e.nivel >= LEVELS.length) e.nivel = 0;
    if (!e.vales || typeof e.vales !== "object") e.vales = {};
    return e;
  } catch {
    return estadoNuevo();
  }
}

function guardarEstado() {
  try {
    localStorage.setItem(CONFIG.claveStorage, JSON.stringify(estado));
  } catch {
    /* modo privado o storage bloqueado: el juego sigue funcionando, solo no recuerda */
  }
}

let estado = cargarEstado();

/* =============================================================
   5) NIVELES
   ============================================================= */
function render() {
  $("#intro").hidden = estado.fase !== "intro";
  $("#nivel").hidden = estado.fase !== "nivel";
  $("#final").hidden = estado.fase !== "final";
  $("#barra").hidden = estado.fase !== "nivel";

  if (estado.fase === "intro") ajustarTalon($("#entrada-intro"));
  if (estado.fase === "nivel") renderNivel();
  if (estado.fase === "final") renderFinal();
}

function renderProgreso() {
  const lista = $("#progreso");
  lista.setAttribute("aria-label", `Nivel ${estado.nivel + 1} de ${LEVELS.length}`);
  lista.innerHTML = LEVELS.map((_, i) => {
    const hecho = i < estado.nivel || (i === estado.nivel && estado.resuelto);
    const clase = hecho ? "progreso__paso--hecho" : i === estado.nivel ? "progreso__paso--actual" : "";
    return `<li class="progreso__paso ${clase}"></li>`;
  }).join("");
}

function plantillaNivel(nivel, i) {
  const visual = nivel.visual
    ? `<p class="entrada__visual ${nivel.visualClase || ""}" ${
        nivel.visualAria ? `role="img" aria-label="${escapar(nivel.visualAria)}"` : ""
      }>${escapar(nivel.visual)}</p>`
    : "";

  const talon =
    nivel.tipo === "opciones"
      ? `<div class="entrada__talon">
           <div class="opciones" role="group" aria-labelledby="titulo-nivel">
             ${nivel.opciones
               .map((o) => `<button type="button" class="opcion" data-valor="${escapar(o.texto)}">${escapar(o.texto)}</button>`)
               .join("")}
           </div>
         </div>`
      : `<div class="entrada__talon">
           <form class="respuesta" id="form-respuesta" autocomplete="off" novalidate>
             <label class="visually-hidden" for="campo-respuesta">Tu respuesta</label>
             <input class="campo" id="campo-respuesta" name="respuesta" type="text"
                    placeholder="${escapar(nivel.placeholder || "Tu respuesta")}"
                    autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="send">
             <button type="submit" class="boton">Probar</button>
           </form>
         </div>`;

  return `
    <div class="caja" id="caja">
      <article class="entrada" id="entrada" aria-labelledby="titulo-nivel">
        <div class="entrada__cuerpo">
          <p class="entrada__numero">Nivel ${i + 1} de ${LEVELS.length}</p>
          <h2 class="entrada__titulo" id="titulo-nivel" tabindex="-1">${escapar(nivel.titulo)}</h2>
          <p class="entrada__pregunta">${escapar(nivel.pregunta)}</p>
          ${visual}
        </div>
        ${talon}
      </article>
    </div>

    <p class="mensaje" id="mensaje" role="status" aria-live="polite"></p>

    <div class="ayuda" id="ayuda">
      <button type="button" class="enlace" id="btn-pista">Necesito una pista</button>
      <p class="pista" id="pista" hidden><strong>Pista:</strong> ${escapar(nivel.pista)}</p>
    </div>

    <section class="recuerdo" id="recuerdo" aria-label="Recuerdo desbloqueado" hidden></section>
  `;
}

function renderNivel() {
  const nivel = LEVELS[estado.nivel];
  const contenedor = $("#nivel");
  renderProgreso();
  contenedor.innerHTML = plantillaNivel(nivel, estado.nivel);
  ajustarTalon($("#entrada"));

  if (nivel.tipo === "opciones") {
    contenedor.querySelectorAll(".opcion").forEach((b) => b.addEventListener("click", () => responderOpcion(b, nivel)));
  } else {
    $("#form-respuesta").addEventListener("submit", (e) => {
      e.preventDefault();
      responderTexto(nivel);
    });
  }
  $("#btn-pista").addEventListener("click", () => {
    $("#pista").hidden = false;
    $("#btn-pista").hidden = true;
  });

  $("#titulo-nivel").focus({ preventScroll: true });
  if (estado.resuelto) marcarResuelto(nivel, { animar: false });
}

function responderTexto(nivel) {
  const campo = $("#campo-respuesta");
  if (!normalizar(campo.value)) {
    campo.focus();
    return;
  }
  if (esCorrecta(nivel, campo.value)) acertar(nivel);
  else fallar();
}

function responderOpcion(boton, nivel) {
  const texto = boton.dataset.valor;
  if (esCorrecta(nivel, texto)) {
    boton.classList.add("opcion--bien");
    acertar(nivel);
  } else {
    boton.classList.add("opcion--mal");
    boton.disabled = true;
    const opcion = nivel.opciones.find((o) => o.texto === texto);
    fallar(opcion && opcion.mensaje);
  }
}

let ultimoFallo = -1;
function mensajeFallo() {
  let i;
  do {
    i = Math.floor(Math.random() * FALLOS.length);
  } while (i === ultimoFallo && FALLOS.length > 1);
  ultimoFallo = i;
  return FALLOS[i].replace(/\{nombre\}/g, CONFIG.nombre);
}

function fallar(mensajePropio) {
  const mensaje = $("#mensaje");
  mensaje.className = "mensaje mensaje--mal";
  mensaje.textContent = mensajePropio || mensajeFallo();

  const caja = $("#caja");
  caja.classList.remove("caja--sacude");
  void caja.offsetWidth; // fuerza reflow para poder repetir la animación
  caja.classList.add("caja--sacude");
  caja.addEventListener("animationend", () => caja.classList.remove("caja--sacude"), { once: true });
}

function acertar(nivel) {
  estado.resuelto = true;
  guardarEstado();
  renderProgreso();
  marcarResuelto(nivel, { animar: true });
  pasaUnGato();
}

function marcarResuelto(nivel, { animar }) {
  $("#entrada").classList.add("entrada--resuelta");
  $(".entrada__talon", $("#entrada")).innerHTML = `<p class="sello ${animar ? "" : "sello--quieto"}">Desbloqueado</p>`;

  const mensaje = $("#mensaje");
  mensaje.className = "mensaje mensaje--bien";
  mensaje.textContent = animar ? azar(ACIERTOS) : "";
  $("#ayuda").hidden = true;

  const esUltimo = estado.nivel === LEVELS.length - 1;
  const recuerdo = $("#recuerdo");
  recuerdo.innerHTML = `
    ${plantillaRecuerdo(nivel.recuerdo)}
    <button type="button" class="boton boton--seguir" id="btn-seguir">${esUltimo ? "Ir al final" : "Seguir"}</button>
  `;
  recuerdo.hidden = false;
  enlazarMedios(recuerdo);
  $("#btn-seguir").addEventListener("click", seguir);

  if (animar) {
    setTimeout(() => recuerdo.scrollIntoView({ behavior: reducirMovimiento() ? "auto" : "smooth", block: "start" }), 900);
  }
}

function plantillaRecuerdo(r) {
  const pie = r.pie ? escapar(r.pie) : "";
  if (r.tipo === "imagen") {
    return `<figure class="polaroid">
              <img src="${escapar(r.contenido)}" alt="${escapar(r.alt || "")}">
              <figcaption>${pie}</figcaption>
            </figure>`;
  }
  if (r.tipo === "audio") {
    return `<div class="reproductor">
              <audio controls preload="none" src="${escapar(r.contenido)}"></audio>
              <p class="reproductor__pie">${pie}</p>
            </div>`;
  }
  return `<blockquote class="nota"><p>${escapar(r.contenido)}</p>${pie ? `<footer>${pie}</footer>` : ""}</blockquote>`;
}

/* Si falta una foto o un audio, muestra un aviso con la ruta esperada
   (así sabés qué archivo falta en assets/) en vez de dejar un hueco roto. */
function enlazarMedios(raiz) {
  raiz.querySelectorAll("img, audio").forEach((medio) => {
    medio.addEventListener(
      "error",
      () => {
        const aviso = document.createElement("div");
        aviso.className = "aviso-vacio";
        aviso.textContent = `Falta el archivo: ${medio.getAttribute("src")}`;
        medio.replaceWith(aviso);
      },
      { once: true }
    );
  });
}

function seguir() {
  if (estado.nivel < LEVELS.length - 1) {
    estado.nivel += 1;
    estado.fase = "nivel";
    estado.resuelto = false;
    guardarEstado();
    render();
    scrollArriba();
  } else {
    estado.fase = "final";
    estado.resuelto = false;
    guardarEstado();
    render();
    scrollArriba();
    lanzarChispas();
  }
}

/* =============================================================
   6) PANTALLA FINAL
   ============================================================= */
function renderFinal() {
  $("#carta-cuerpo").innerHTML = CARTA.map(
    (p) => `<p class="carta__parrafo" data-revelar>${escapar(p)}</p>`
  ).join("");
  $("#carta-firma").textContent = `— ${CONFIG.firma}`;

  $("#resumen-datos").innerHTML = RESUMEN.map(plantillaDato).join("");
  renderVales();
  observarRevelados();
}

function plantillaDato(d) {
  const valor = typeof d.valor === "function" ? d.valor() : d.valor;
  const sufijo = d.sufijo || "";
  const mostrado = d.texto !== undefined ? escapar(d.texto) : `${Number(valor).toLocaleString("es-UY")}${escapar(sufijo)}`;
  const atributos = d.texto !== undefined ? "" : `data-valor="${valor}" data-sufijo="${escapar(sufijo)}" data-revelar`;
  return `
    <div class="col-12 ${d.grande ? "" : "col-md-6"}">
      <div class="dato ${d.grande ? "dato--grande" : ""}">
        <p class="dato__valor" ${atributos}>${mostrado}</p>
        <p class="dato__etiqueta">${escapar(d.etiqueta)}</p>
        <p class="dato__nota">${escapar(d.nota)}</p>
      </div>
    </div>`;
}

function animarContador(el) {
  const meta = Number(el.dataset.valor);
  const sufijo = el.dataset.sufijo || "";
  const duracion = 1600;
  const inicio = performance.now();
  const paso = (ahora) => {
    const p = Math.min(1, (ahora - inicio) / duracion);
    const suave = 1 - Math.pow(1 - p, 3);
    el.textContent = `${Math.round(meta * suave).toLocaleString("es-UY")}${sufijo}`;
    if (p < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}

/* Párrafos de la carta que aparecen al llegar a ellos y contadores que suben de 0 */
function observarRevelados() {
  const elementos = document.querySelectorAll("#final [data-revelar]");
  if (!("IntersectionObserver" in window) || reducirMovimiento()) {
    elementos.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  document.querySelectorAll(".dato__valor[data-valor]").forEach((el) => {
    el.textContent = `0${el.dataset.sufijo || ""}`;
  });
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        const el = entrada.target;
        el.classList.add("is-visible");
        if (el.matches(".dato__valor[data-valor]")) animarContador(el);
        observador.unobserve(el);
      });
    },
    { threshold: 0.25 }
  );
  elementos.forEach((el) => observador.observe(el));
}

function renderVales(idNuevo) {
  $("#vales-lista").innerHTML = VALES.map((v) => {
    const fecha = estado.vales[v.id];
    const canjeado = Boolean(fecha);
    const cuando = canjeado
      ? new Date(fecha).toLocaleDateString("es-UY", { day: "numeric", month: "long" })
      : "";
    return `
      <div class="col-12 col-md-6">
        <div class="caja">
          <article class="vale ${canjeado ? "vale--canjeado" : ""}">
            <div class="vale__cuerpo">
              <h4 class="vale__titulo">${escapar(v.titulo)}</h4>
              <p class="vale__detalle">${escapar(v.detalle)}</p>
              ${canjeado ? `<p class="vale__fecha">Canjeado el ${cuando}. Sacale captura y mandásela a ${escapar(CONFIG.firma)}.</p>` : ""}
            </div>
            <div class="vale__talon">
              ${
                canjeado
                  ? `<p class="sello ${v.id === idNuevo ? "" : "sello--quieto"}">Canjeado</p>`
                  : `<button type="button" class="boton" data-canjear="${escapar(v.id)}">Canjear</button>`
              }
            </div>
          </article>
        </div>
      </div>`;
  }).join("");

  document.querySelectorAll("[data-canjear]").forEach((boton) =>
    boton.addEventListener("click", () => {
      estado.vales[boton.dataset.canjear] = new Date().toISOString();
      guardarEstado();
      renderVales(boton.dataset.canjear);
    })
  );
}

/* =============================================================
   7) EXTRAS: gato que pasa y chispas del final
   ============================================================= */
/* /* Dibujo del gato. Cada variante cambia color y detalles:
   - rubia:   ámbar (el dibujo original)
   - paatpat: negro con hocico, panza y patas blancas
   - jojo:    negro con patas blancas y la punta de la cola blanca */
function svgGato({ variante }) {
  const paatpat = variante === "paatpat";
  const jojo = variante === "jojo";
  const zarpasBlancas = paatpat || jojo;

  // Cada pata es un grupo para que la zarpa blanca se mueva junto con la pata
  const pata = (x, tipo) => `
    <g class="gato__pata gato__pata--${tipo}">
      <rect x="${x}" y="44" width="7" height="22" rx="3.5"/>
      ${zarpasBlancas ? `<rect class="gato__blanco" x="${x}" y="57" width="7" height="9" rx="3.5"/>` : ""}
    </g>`;

  // La punta blanca es la misma curva de la cola, dibujada solo en el último 14%
  const punta = jojo
    ? `<path class="gato__punta" d="M26 36 C8 34 4 18 14 10" pathLength="100" fill="none"
             stroke-width="7" stroke-linecap="round" stroke-dasharray="14 200" stroke-dashoffset="-86"/>`
    : "";

  const panza = paatpat
    ? `<ellipse class="gato__blanco" cx="58" cy="47" rx="20" ry="7"/>`
    : "";

  const hocico = paatpat
    ? `<ellipse class="gato__blanco" cx="100" cy="33" rx="5.5" ry="4"/>
       <circle class="gato__nariz" cx="104.5" cy="31.5" r="1.2"/>`
    : "";

  return `
<svg viewBox="0 0 120 70" aria-hidden="true" focusable="false">
  <g class="gato__cola">
    <path d="M26 36 C8 34 4 18 14 10" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>
    ${punta}
  </g>
  ${pata(34, "a")}
  ${pata(46, "b")}
  ${pata(74, "b")}
  ${pata(84, "a")}
  <ellipse cx="58" cy="38" rx="34" ry="16"/>
  ${panza}
  <circle cx="94" cy="28" r="13"/>
  <polygon points="83,22 85,7 96,17"/>
  <polygon points="92,16 103,7 105,24"/>
  ${hocico}
  <circle class="gato__ojo" cx="99" cy="27" r="1.9"/>
</svg>`;
}

function pasaUnGato() {
  const capa = $("#capa-gato");
  capa.innerHTML = "";
  const elegido = azar(GATOS);
  const gato = document.createElement("div");
  gato.className = `gato gato--${elegido.variante}`;
  gato.innerHTML = svgGato(elegido);
  gato.addEventListener("animationend", (e) => {
    if (e.target === gato) gato.remove();
  });
  capa.appendChild(gato);
}

function lanzarChispas() {
  if (reducirMovimiento()) return;
  const capa = $("#capa-chispas");
  const fragmento = document.createDocumentFragment();
  for (let i = 0; i < 40; i++) {
    const chispa = document.createElement("span");
    chispa.className = `chispa chispa--${i % 3}`;
    chispa.style.left = `${Math.random() * 100}%`;
    chispa.style.setProperty("--tam", `${6 + Math.random() * 10}px`);
    chispa.style.setProperty("--dur", `${5 + Math.random() * 5}s`);
    chispa.style.setProperty("--delay", `${Math.random() * 1.5}s`);
    chispa.style.setProperty("--deriva", `${(Math.random() - 0.5) * 20}vw`);
    fragmento.appendChild(chispa);
  }
  capa.appendChild(fragmento);
  setTimeout(() => (capa.innerHTML = ""), 12000);
} 

/* =============================================================
   8) ARRANQUE
   ============================================================= */
function reiniciar() {
  if (!confirm("¿Empezar de nuevo? Se borra el progreso y los vales canjeados.")) return;
  estado = estadoNuevo();
  guardarEstado();
  render();
  scrollArriba();
}

/* Atajos para probar sin repetir todo el juego (podés borrar esta función):
   index.html?nivel=5  -> salta al nivel 5
   index.html?final    -> salta a la pantalla final */
function aplicarParametrosDePrueba() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("final")) {
    estado.fase = "final";
  } else if (params.has("nivel")) {
    const n = parseInt(params.get("nivel"), 10) - 1;
    if (n >= 0 && n < LEVELS.length) Object.assign(estado, { fase: "nivel", nivel: n, resuelto: false });
  }
}

function init() {
  document.querySelectorAll("[data-nombre]").forEach((el) => (el.textContent = CONFIG.nombre));
  document.querySelectorAll("[data-apodo]").forEach((el) => (el.textContent = CONFIG.apodo));

  $("#btn-empezar").addEventListener("click", () => {
    Object.assign(estado, { fase: "nivel", nivel: 0, resuelto: false });
    guardarEstado();
    render();
    scrollArriba();
  });
  $("#btn-reiniciar").addEventListener("click", reiniciar);

  aplicarParametrosDePrueba();
  render();
}

init();