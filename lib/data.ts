// Contenido del sitio (v2 · "Bloque"). Todo lo editable vive aquí.

export const FRESHA_URL =
  "https://www.fresha.com/a/gitano-studio-merida-calle-principal-calle-31-circuito-colonias-cogcmbip/booking?menu=true&share=true&pId=3062487";
// Agenda propia (/reservar, en Cloudflare). Mientras no esté activa en producción, los botones siguen yendo a Fresha.
// Se prende con la variable NEXT_PUBLIC_RESERVAS=on (en .env.local y en el build de Cloudflare).
const OWN_BOOKING = process.env.NEXT_PUBLIC_RESERVAS === "on";
export const BOOK_URL = OWN_BOOKING ? "/reservar" : FRESHA_URL;
/** Props del link de agendar: la agenda propia abre en la misma pestaña, Fresha en otra. */
export const BOOK_LINK = OWN_BOOKING ? { href: BOOK_URL } : { href: BOOK_URL, target: "_blank", rel: "noopener" };
// Dirección pública del sitio (canonical, sitemap, schema, og:image). Cuando esté el dominio final,
// se define NEXT_PUBLIC_SITE_URL en el build y todo pasa a apuntar ahí.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://gitano2.vercel.app").replace(/\/$/, "");
export const INSTAGRAM_URL = "https://www.instagram.com/gitano.studio/";
export const PHONE = "999 453 3474";
export const WHATSAPP_URL = "https://wa.me/529994533474";

export const GEO = { lat: 20.9977016, lng: -89.6062469 };
export const MAPS_URL = "https://maps.app.goo.gl/CREfbusnP73FAvhz6";
export const MAPS_EMBED = `https://maps.google.com/maps?q=${GEO.lat},${GEO.lng}&z=17&hl=es&output=embed`;

export const ADDRESS = {
  line1: "Calle 31, Circuito Colonias",
  line2: "México Oriente, 97125 Mérida, Yuc.",
};


// Fotos de cortes: nombre de archivo descriptivo (SEO de imágenes).
const OBRA: Record<number, string> = {"1": "fade-con-textura-barberia-merida", "2": "mullet-con-barba-barberia-merida", "3": "taper-rizado-con-barba-barberia-merida", "4": "high-fade-con-barba-barberia-merida", "5": "crop-texturizado-barberia-merida", "6": "afro-esculpido-corte-mujer-merida"};
const obra = (n: number) => `/img/obra/${OBRA[n]}.webp`;

/** Cada foto existe en 480, 900 y su tamaño original (archivo sin sufijo): el navegador baja la que le alcanza. */
export const srcSet = (src: string, w: number) =>
  `${src.replace(".webp", "-480.webp")} 480w, ${src.replace(".webp", "-900.webp")} 900w, ${src} ${w}w`;
export const OBRA_W = 1328;
export const OBRA_H = 1760;

// Frase que define la marca: idéntica en el sitio, Google Business Profile, Fresha e Instagram.
export const ENTITY = "Gitano Studio es una barbería de autor en Mérida, Yucatán, fundada por el barbero Dayner, en la Calle 31, Circuito Colonias, colonia México Oriente.";

export type Service = { id: string; name: string; note?: string; price: number | null };
export type ServiceGroup = { title: string; items: Service[] };

// Precios en MXN. price: null = incluido.
export const SERVICES: ServiceGroup[] = [
  {
    title: "Corte",
    items: [
      { id: "corte", name: "Corte personalizado", note: "Asesoría, corte y acabado pensados para tu cabeza. Máquina, tijera o las dos.", price: 350 },
      { id: "tijera", name: "Corte especializado a tijera", note: "Todo a tijera, para quien busca textura, movimiento y un crecimiento que no se ve desaliñado.", price: 400 },
      { id: "femenino", name: "Corte corto femenino", note: "Cortes cortos de mujer con forma y textura, diseñados para ti y no para la foto de Pinterest.", price: 450 },
    ],
  },
  {
    title: "Barba",
    items: [
      { id: "barba", name: "Diseño y arreglo de barba", note: "Forma, perfilado a navaja y acabado. Tu barba, pero bien hecha.", price: 250 },
      { id: "ritual", name: "Ritual con toalla caliente", note: "Toalla caliente y navaja para un afeitado al ras y la piel tranquila.", price: 150 },
    ],
  },
  {
    title: "Completos",
    items: [
      { id: "corte-barba", name: "Corte y barba", note: "Cabello y barba en una sola cita. Sales completo.", price: 500 },
      { id: "experiencia", name: "Experiencia Gitano", note: "Corte, barba, toalla caliente y facial exprés. Para cuando sí te quieres consentir.", price: 650 },
    ],
  },
  {
    title: "Detalles",
    items: [
      { id: "facial", name: "Tratamiento facial exprés", note: "Un facial rápido para que la piel también salga fresca.", price: 180 },
      { id: "cejas", name: "Diseño de cejas", note: "Cejas definidas, sin que se note que te las arreglaste.", price: 80 },
      { id: "asesoria", name: "Asesoría de productos y peinado", note: "Te decimos cómo peinarte en casa y con qué.", price: null },
    ],
  },
];

// 0 = domingo … 6 = sábado. Horas en decimal.
export const HOURS: Record<number, [number, number] | null> = {
  0: [12, 18],
  1: null,
  2: [10, 19.5],
  3: [10, 19.5],
  4: [10, 19.5],
  5: [10, 19.5],
  6: [10, 19.5],
};

// TODO: Dayner puede sumar años de oficio, formación y una frase suya.
export const BIO = [
  "Dayner corta con la técnica de siempre, tijera y navaja, y con el ojo de ahora. Antes de tocar una sola hebra platica contigo: forma de la cabeza, tipo de cabello y cuánto tiempo le dedicas al espejo en la mañana (sin juzgar). Luego corta. Y al final te explica cómo peinarte en casa y qué producto sí vale la pena.",
  "Atiende con cita de martes a domingo en la Calle 31, Circuito Colonias, México Oriente. ¿Quieres todo el ritual? La Experiencia Gitano suma barba, toalla caliente y facial exprés.",
];

// Preguntas frecuentes: mismo texto para la sección visible y el schema FAQPage.
// TODO: que Dayner confirme formas de pago (efectivo, tarjeta, transferencia) y una referencia para llegar.
export type Faq = { q: string; a: string };
export const FAQS: Faq[] = [
  { q: "¿Cuánto cuesta un corte de cabello en Gitano Studio?", a: "Un corte personalizado en Gitano Studio cuesta $350 MXN y el corte especializado a tijera, $400 MXN. Corte y barba sale en $500 y la Experiencia Gitano completa, en $650. Pagas directo en el estudio." },
  { q: "¿Necesito cita o atienden sin cita?", a: "Gitano Studio atiende solo con cita, para que cada cliente tenga su tiempo completo, sin esperas. Agenda en línea o escríbenos por WhatsApp." },
  { q: "¿Qué horario tiene Gitano Studio?", a: "Gitano Studio abre de martes a sábado de 10:00 a 19:30 y los domingos de 12:00 a 18:00. Los lunes cerramos." },
  { q: "¿Dónde está la barbería?", a: "Gitano Studio está en la Calle 31, Circuito Colonias, colonia México Oriente, en Mérida, Yucatán." },
  { q: "¿Hacen cortes de mujer?", a: "Sí. Gitano Studio hace cortes cortos de mujer desde $450 MXN, como el afro esculpido, con el mismo trabajo de tijera y detalle que cualquier corte de la casa." },
  { q: "¿Qué incluye la Experiencia Gitano?", a: "La Experiencia Gitano incluye corte, arreglo de barba, toalla caliente y tratamiento facial exprés en una sola cita, por $650 MXN." },
  { q: "¿Cuánto dura una cita?", a: "Una cita en Gitano Studio dura entre 45 y 60 minutos, según el servicio. Un fade con textura o un crop texturizado toman unos 45 minutos; los servicios con barba, alrededor de una hora." },
  { q: "¿Hacen fades y degradados?", a: "Sí. El fade con textura, el high fade, el taper y el crop texturizado están entre los cortes que más se trabajan en Gitano Studio. Un corte personalizado con máquina y tijera cuesta $350 MXN." },
  { q: "¿Qué es una barbería de autor?", a: "Una barbería de autor es un estudio donde el barbero diseña cada corte según tu cabeza, tu tipo de cabello y tu estilo, en lugar de repetir cortes de catálogo. En Gitano Studio cada cita empieza con una asesoría con Dayner." },
  { q: "¿Cómo agendo una cita?", a: "Agenda en línea desde el botón “Aparta tu lugar” o mándanos un WhatsApp. Eliges servicio, día y hora, y ya quedó." },
  { q: "¿Qué formas de pago aceptan?", a: "El pago se hace en el estudio, al terminar." },
];

// Los mismos 6 cortes de la v1, ahora a color y sin numeración.
// pos: encuadre de la foto en los paneles (por defecto 50% 30%); más bajo el %, más se ve la parte de arriba del pelo.
export type Cut = { name: string; technique: string; time: string; line: string; img: string; alt: string; pos?: string };
export const CUTS: Cut[] = [
  { name: "Mullet + barba", technique: "Tijera + navaja", time: "60 min", line: "Corto adelante, actitud atrás. Con la barba a juego.", img: obra(2), alt: "Mullet con barba trabajado a tijera y navaja en Gitano Studio, Mérida, Yucatán" },
  { name: "Fade con textura", technique: "Máquina + tijera", time: "45 min", line: "Degradado limpio abajo, movimiento arriba. El que nunca falla.", img: obra(1), alt: "Fade con textura hecho con máquina y tijera en Gitano Studio, barbería en Mérida", pos: "50% 6%" },
  { name: "Taper rizado", technique: "Rizo natural + barba", time: "60 min", line: "Tu rizo se respeta: laterales limpios y la forma natural intacta.", img: obra(3), alt: "Taper en cabello rizado natural con barba, Gitano Studio Mérida", pos: "50% 6%" },
  { name: "High fade + barba", technique: "Perfilado a navaja", time: "60 min", line: "Fade alto y barba marcada a navaja. Líneas que se notan desde la otra banqueta.", img: obra(4), alt: "High fade con barba perfilada a navaja en una barbería de Mérida" },
  { name: "Crop texturizado", technique: "Fade + textura arriba", time: "45 min", line: "Corto, con textura y casi cero mantenimiento. Te levantas y ya quedó.", img: obra(5), alt: "Crop texturizado con fade, corte de hombre en Gitano Studio" },
  { name: "Afro esculpido", technique: "Tijera · corte de mujer", time: "60 min", line: "Volumen con forma. Corte corto de mujer trabajado a tijera, mechón por mechón.", img: obra(6), alt: "Afro esculpido, corte corto de mujer a tijera en Gitano Studio, Mérida" },
];

// Foto de portada a color (el mullet) y fotos del estudio a color.
// Portada en 4K: horizontal para escritorio (1280→3840) y un recorte vertical 3:4 centrado en la cabeza para celular.
const PORTADA = "/img/portada/mullet-con-barba-gitano-studio-barberia-merida";
export const COVER = {
  img: `${PORTADA}-1920.webp`,
  srcSet: [1280, 1920, 2560, 3840].map((w) => `${PORTADA}-${w}.webp ${w}w`).join(", "),
  w: 5504,
  h: 3072,
  mobile: [720, 1080, 1440].map((w) => `${PORTADA}-vertical-${w}.webp ${w}w`).join(", "),
  mobileImg: `${PORTADA}-vertical-1080.webp`,
  alt: "Mullet con barba y degradado trabajado a tijera y navaja en Gitano Studio, Mérida, Yucatán",
};
export const COLOR = {
  dayner: { img: "/img/color/dayner-barbero-gitano-studio-merida-retrato.webp", w: 1673, h: 2091, alt: "Retrato de Dayner, barbero y fundador de Gitano Studio" },
  sign: { img: "/img/color/gitano-studio-letrero-fachada-merida-color.webp", w: 618, h: 742, alt: "Dayner colgando el letrero de Gitano Studio en la fachada" },
  studio: { img: "/img/color/gitano-studio-barberia-interior-merida-color.webp", w: 1400, h: 1400, alt: "Interior de Gitano Studio: sillones de barbero y sala de espera en Calle 31, Mérida" },
};

// Reseñas de Google (selección; fragmentos textuales de cada reseña). Actualizar a mano cuando lleguen más.
export const RATING = { score: "5.0", count: 18, url: "https://maps.google.com/?cid=16033076348302109962" };
export type Review = { text: string; name: string; meta?: string };
export const REVIEWS: Review[] = [
  { text: "Tiene el poder de encontrar tu mejor look y guiarte en el mejor corte para ti.", name: "Karel D.", meta: "Cliente desde hace 2 años" },
  { text: "Si tú lo puedes imaginar, en este estudio te lo pueden hacer realidad.", name: "Geo P." },
  { text: "Buena opción para chavas que buscamos barbería friendly. Me siento súper cómoda siempre.", name: "Consuelo T." },
  { text: "Dayner es muy profesional, atento y cuidadoso con cada detalle.", name: "Neutro Apparel" },
  { text: "Se nota cuando a alguien le gusta lo que hace.", name: "Gabriela M." },
];
