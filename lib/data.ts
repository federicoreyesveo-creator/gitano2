// Contenido del sitio (v2 · "Bloque"). Todo lo editable vive aquí.

export const FRESHA_URL =
  "https://www.fresha.com/a/gitano-studio-merida-calle-principal-calle-31-circuito-colonias-cogcmbip/booking?menu=true&share=true&pId=3062487";
export const INSTAGRAM_URL = "https://www.instagram.com/gitano.studio/";
// TODO: número real de WhatsApp
export const WHATSAPP_URL = "https://wa.me/520000000000";

export const GEO = { lat: 20.9977016, lng: -89.6062469 };
export const MAPS_URL = "https://maps.app.goo.gl/CREfbusnP73FAvhz6";
export const MAPS_EMBED = `https://maps.google.com/maps?q=${GEO.lat},${GEO.lng}&z=17&hl=es&output=embed`;

export const ADDRESS = {
  line1: "Calle 31, Circuito Colonias",
  line2: "México Oriente, Mérida, Yuc.",
};


const obra = (n: number) => `/img/obra/gitano-corte-${n}.webp`;

export type Service = { id: string; name: string; note?: string; price: number };
export type ServiceGroup = { title: string; items: Service[] };

// Precios en MXN.
export const SERVICES: ServiceGroup[] = [
  {
    title: "Corte",
    items: [
      { id: "corte", name: "Corte personalizado", note: "Asesoría, técnica y acabado", price: 350 },
      { id: "tijera", name: "Corte especializado a tijera", note: "Control, textura y estilo", price: 400 },
      { id: "femenino", name: "Corte corto femenino", note: "Diseño y estilo personalizado", price: 450 },
    ],
  },
  {
    title: "Barba",
    items: [
      { id: "barba", name: "Diseño y arreglo de barba", note: "Perfilado, forma y acabado", price: 250 },
      { id: "ritual", name: "Ritual con toalla caliente", price: 150 },
    ],
  },
  {
    title: "Completos",
    items: [
      { id: "corte-barba", name: "Corte y barba", note: "Cabello y barba en una cita", price: 500 },
      { id: "experiencia", name: "Experiencia Gitano", note: "Corte, barba, toalla caliente y facial", price: 650 },
    ],
  },
  {
    title: "Detalles",
    items: [
      { id: "facial", name: "Tratamiento facial exprés", price: 180 },
      { id: "cejas", name: "Diseño de cejas", price: 80 },
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

// TODO: bio en borrador; que Dayner confirme datos.
export const BIO = [
  "Dayner es barbero y fundador de Gitano Studio, una barbería de autor en Mérida, Yucatán. Su trabajo une la técnica clásica de tijera y navaja con una lectura de estilo actual: cortes personalizados, corte especializado a tijera, diseño y arreglo de barba y corte corto femenino.",
  "Cada cita empieza con una asesoría: forma de la cabeza, tipo de cabello, rutina y lo que quieres proyectar. Con eso diseña un corte pensado para ti y te explica cómo peinarlo y qué productos usar en casa.",
  "El estudio está en la Calle 31, Circuito Colonias, en la colonia México Oriente. Atiende con cita de martes a domingo, y la Experiencia Gitano suma barba, toalla caliente y tratamiento facial al corte.",
];

// Preguntas frecuentes: mismo texto para la sección visible y el schema FAQPage.
// TODO: que Dayner confirme duración y formas de pago.
export type Faq = { q: string; a: string };
export const FAQS: Faq[] = [
  { q: "¿Cuánto cuesta un corte en Gitano Studio?", a: "El corte personalizado cuesta $350 MXN y el corte especializado a tijera, $400 MXN. Corte y barba juntos cuestan $500 MXN, y la Experiencia Gitano completa, $650 MXN. El pago es en el estudio." },
  { q: "¿Necesito cita o atienden sin cita?", a: "Gitano Studio atiende con cita, para dedicarle a cada cabeza el tiempo que necesita. Puedes reservar en línea por Fresha o escribir por WhatsApp." },
  { q: "¿Qué horario tienen?", a: "De martes a sábado, de 10:00 a 19:30. Los domingos, de 12:00 a 18:00. Los lunes está cerrado." },
  { q: "¿Dónde está la barbería?", a: "En la Calle 31, Circuito Colonias, colonia México Oriente, en Mérida, Yucatán." },
  { q: "¿Hacen cortes de mujer?", a: "Sí. El corte de cabello corto femenino incluye diseño y estilo personalizado y cuesta $450 MXN." },
  { q: "¿Qué incluye la Experiencia Gitano?", a: "Corte, arreglo de barba, toalla caliente y tratamiento facial, en una sola cita. Cuesta $650 MXN." },
  { q: "¿Cuánto dura una cita?", a: "Entre 45 y 60 minutos, según el servicio. Cada cita empieza con una asesoría sobre tu tipo de cabello, la forma de tu cabeza y el estilo que buscas." },
];

// Los mismos 6 cortes de la v1, ahora a color y sin numeración.
export type Cut = { name: string; technique: string; time: string; img: string; alt: string };
export const CUTS: Cut[] = [
  { name: "Mullet + barba", technique: "Tijera y navaja", time: "60 min", img: obra(2), alt: "Mullet con barba perfilada, Gitano Studio Mérida" },
  { name: "Fade con textura", technique: "Máquina y tijera", time: "45 min", img: obra(1), alt: "Fade con textura corta, corte de Gitano Studio en Mérida" },
  { name: "Taper rizado", technique: "Rizo natural y barba", time: "60 min", img: obra(3), alt: "Taper con rizo natural y barba, barbería Gitano Studio" },
  { name: "High fade + barba", technique: "Perfilado a navaja", time: "60 min", img: obra(4), alt: "High fade con barba larga perfilada a navaja, Gitano Studio" },
  { name: "Crop texturizado", technique: "Fade y textura arriba", time: "45 min", img: obra(5), alt: "Crop texturizado con fade, corte de autor en Mérida" },
  { name: "Afro esculpido", technique: "Tijera, corte de mujer", time: "60 min", img: obra(6), alt: "Afro esculpido, corte femenino en Gitano Studio Mérida" },
];

// Foto de portada a color (el mullet) y fotos del estudio a color.
export const COVER = { img: obra(2), w: 1200, h: 1600, alt: "Cliente con mullet y barba recién cortados en Gitano Studio, barbería en Mérida" };
export const COLOR = {
  dayner: { img: "/img/color/dayner-barbero-gitano-studio-merida-bn.webp", w: 960, h: 960, alt: "Dayner, barbero y fundador de Gitano Studio en Mérida, Yucatán" },
  sign: { img: "/img/color/gitano-studio-letrero-fachada-merida-color.webp", w: 618, h: 742, alt: "Dayner colgando el letrero de Gitano Studio en la fachada" },
  studio: { img: "/img/color/gitano-studio-barberia-interior-merida-color.webp", w: 1400, h: 1400, alt: "Interior de Gitano Studio: sillones de barbero y sala de espera en Calle 31, Mérida" },
};
