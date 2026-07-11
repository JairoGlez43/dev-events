/**
 * Seed de eventos (sube las imágenes de public/images a Cloudinary).
 *
 * Uso:
 *   npx tsx scripts/seed.ts          -> inserta los eventos nuevos (mantiene los existentes)
 *   npx tsx scripts/seed.ts --wipe   -> borra TODOS los eventos y luego inserta los nuevos
 *
 * Cada evento apunta con `imageFile` a una imagen de `public/images/`. El seed la
 * sube a la carpeta `events/` de tu Cloudinary (con public_id fijo, así re-ejecutar
 * sobreescribe en vez de duplicar) y usa la URL resultante. Si Cloudinary no está
 * disponible, cae al respaldo.
 *
 * Lee MONGODB_URI y CLOUDINARY_URL desde .env.local (o .env como fallback).
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, basename, extname } from 'node:path';

// --- Cargar variables de entorno sin depender de dotenv ---------------------
function loadEnv(file: string) {
  try {
    const content = readFileSync(resolve(process.cwd(), file), 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      // .env.local tiene prioridad: no sobreescribir si ya existe
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // el archivo puede no existir; seguimos
  }
}

loadEnv('.env.local');
loadEnv('.env');

if (!process.env.MONGODB_URI) {
  console.error('❌ No se encontró MONGODB_URI en .env.local ni en .env');
  process.exit(1);
}

const PUBLIC_DIR = resolve(process.cwd(), 'public');

// Respaldo (ya en tu Cloudinary) por si la subida no está disponible.
const FALLBACK_IMAGES = [
  'https://res.cloudinary.com/dhgwjmzf7/image/upload/v1767838048/events/yx7okql2mdobpexqhjet.jpg',
  'https://res.cloudinary.com/dhgwjmzf7/image/upload/v1766000780/events/hymoyy91e7tewucmdlbq.png',
  'https://res.cloudinary.com/dhgwjmzf7/image/upload/v1767924293/events/c8xlt6nc4v843nftakxa.png',
  'https://res.cloudinary.com/dhgwjmzf7/image/upload/v1766000016/events/p3nzbwyavdfhmhegejkz.png',
  'https://res.cloudinary.com/dhgwjmzf7/image/upload/v1763928595/events/jogoncrzgbyqfm9kg9xf.png',
];

const fallback = (i: number) => FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];

// Las 6 imágenes de public/images se ciclan entre los 8 eventos.
const EVENTS = [
  {
    imageFile: 'images/event1.png',
    title: 'React Summit 2026',
    description:
      'La conferencia de referencia sobre React y el ecosistema frontend moderno, con charlas de mantenedores del core y casos reales de producción.',
    overview:
      'Dos días intensivos de React 19, Server Components, streaming SSR y patrones de rendimiento. Ideal para desarrolladores que quieren llevar sus apps al siguiente nivel.',
    venue: 'Palacio de Congresos',
    location: 'Madrid, España',
    date: '2026-09-15',
    time: '09:00',
    mode: 'Presencial',
    audience: 'Desarrolladores frontend',
    agenda: [
      'Keynote de apertura: el futuro de React',
      'Server Components en profundidad',
      'Optimización de rendimiento en apps reales',
      'Networking y cierre',
    ],
    organizer: 'GitNation',
    tags: ['React', 'Frontend', 'JavaScript'],
    capacity: 500,
  },
  {
    imageFile: 'images/event2.png',
    title: 'Next.js Conf',
    description:
      'El evento oficial de Next.js donde se anuncian las novedades del framework y se comparten mejores prácticas para apps full-stack.',
    overview:
      'Descubre App Router, caching, Partial Prerendering y despliegue en el edge. Charlas del equipo de Vercel y de la comunidad.',
    venue: 'Online',
    location: 'Evento virtual',
    date: '2026-10-22',
    time: '17:00',
    mode: 'Online',
    audience: 'Desarrolladores full-stack',
    agenda: [
      'Novedades de Next.js',
      'Estrategias de caching y PPR',
      'Despliegue en el edge',
      'Preguntas de la comunidad',
    ],
    organizer: 'Vercel',
    tags: ['Next.js', 'React', 'Full-stack'],
    capacity: 2000,
  },
  {
    imageFile: 'images/event3.png',
    title: 'TypeScript Barcelona Meetup',
    description:
      'Encuentro mensual de la comunidad TypeScript para compartir trucos de tipado avanzado, herramientas y experiencias de equipo.',
    overview:
      'Sesión práctica sobre generics, utility types y cómo escalar TypeScript en bases de código grandes.',
    venue: 'Aticco Bogatell',
    location: 'Barcelona, España',
    date: '2026-08-05',
    time: '18:30',
    mode: 'Presencial',
    audience: 'Desarrolladores de todos los niveles',
    agenda: [
      'Tipado avanzado en la práctica',
      'Herramientas del ecosistema',
      'Networking con pizza',
    ],
    organizer: 'TS Barcelona',
    tags: ['TypeScript', 'JavaScript'],
    capacity: 80,
  },
  {
    imageFile: 'images/event4.png',
    title: 'Node.js Performance Workshop',
    description:
      'Taller intensivo para diagnosticar y optimizar el rendimiento de aplicaciones Node.js en producción.',
    overview:
      'Profiling, event loop, streams, y estrategias de escalado. Traer portátil: será 100% hands-on.',
    venue: 'Campus Tech',
    location: 'Valencia, España',
    date: '2026-11-10',
    time: '10:00',
    mode: 'Presencial',
    audience: 'Backend developers',
    agenda: [
      'El event loop al detalle',
      'Profiling y flame graphs',
      'Streams y backpressure',
      'Escalado horizontal',
    ],
    organizer: 'Node Iberia',
    tags: ['Node.js', 'Backend', 'JavaScript'],
    capacity: 40,
  },
  {
    imageFile: 'images/event5.png',
    title: 'AI Engineering Day',
    description:
      'Una jornada dedicada a construir productos con LLMs: desde prompt engineering hasta pipelines RAG en producción.',
    overview:
      'Aprende a integrar modelos de IA en tus aplicaciones, evaluar resultados y controlar costes.',
    venue: 'Teatro Goya',
    location: 'Madrid, España',
    date: '2026-12-03',
    time: '09:30',
    mode: 'Híbrido',
    audience: 'Ingenieros de software y de datos',
    agenda: [
      'Fundamentos de LLMs',
      'Construyendo un pipeline RAG',
      'Evaluación y observabilidad',
      'Mesa redonda',
    ],
    organizer: 'AI Builders',
    tags: ['IA', 'Machine Learning', 'Backend'],
    capacity: 300,
  },
  {
    imageFile: 'images/event6.png',
    title: 'CSS & UI Design Conf',
    description:
      'Conferencia centrada en CSS moderno, accesibilidad y diseño de interfaces que enamoran.',
    overview:
      'Container queries, subgrid, layers y animaciones performantes. Diseño y desarrollo por fin en la misma sala.',
    venue: 'La Nave',
    location: 'Sevilla, España',
    date: '2026-09-28',
    time: '11:00',
    mode: 'Presencial',
    audience: 'Diseñadores y desarrolladores frontend',
    agenda: [
      'CSS moderno en 2026',
      'Accesibilidad sin excusas',
      'Animaciones performantes',
      'Portfolio review',
    ],
    organizer: 'Frontend Sevilla',
    tags: ['CSS', 'Frontend', 'Diseño'],
    capacity: 150,
  },
  {
    imageFile: 'images/event1.png',
    title: 'DevOps & Cloud Summit',
    description:
      'El punto de encuentro para equipos que despliegan en la nube: contenedores, CI/CD, observabilidad y coste-eficiencia.',
    overview:
      'Kubernetes, GitOps, infra as code y buenas prácticas de SRE con casos reales.',
    venue: 'Bilbao Exhibition Centre',
    location: 'Bilbao, España',
    date: '2026-10-08',
    time: '09:00',
    mode: 'Presencial',
    audience: 'DevOps y SRE',
    agenda: [
      'GitOps de principio a fin',
      'Observabilidad moderna',
      'Optimización de costes en cloud',
      'Panel de SRE',
    ],
    organizer: 'Cloud Native Spain',
    tags: ['DevOps', 'Cloud', 'Backend'],
    capacity: 400,
  },
  {
    imageFile: 'images/event2.png',
    title: 'Web Accessibility Bootcamp',
    description:
      'Bootcamp práctico para hacer que tus productos web sean usables por todo el mundo, cumpliendo WCAG.',
    overview:
      'Lectores de pantalla, navegación por teclado, contraste y ARIA. Auditorías en vivo de sitios reales.',
    venue: 'Impact Hub',
    location: 'Málaga, España',
    date: '2026-08-19',
    time: '10:00',
    mode: 'Online',
    audience: 'Desarrolladores y product managers',
    agenda: [
      'Principios WCAG',
      'ARIA sin romper nada',
      'Auditoría en vivo',
      'Plan de acción para tu equipo',
    ],
    organizer: 'A11y Community',
    tags: ['Accesibilidad', 'Frontend', 'Diseño'],
    capacity: 120,
  },
];

async function main() {
  const wipe = process.argv.includes('--wipe');

  const { connectToDatabase, mongoose } = await import('../lib/mongodb');
  const { default: Event } = await import('../database/event.model');

  // Cloudinary se auto-configura desde CLOUDINARY_URL. Lo importamos aquí (después
  // de cargar el .env) para asegurar que la variable ya esté disponible.
  const { v2: cloudinary } = await import('cloudinary');
  cloudinary.config({ secure: true });
  const canUpload = Boolean(process.env.CLOUDINARY_URL);
  if (!canUpload) {
    console.warn(
      '⚠️  No hay CLOUDINARY_URL: no se subirán imágenes, se usarán las de respaldo.\n'
    );
  }

  // Caché para no subir el mismo archivo más de una vez (las imágenes se ciclan).
  const uploadCache = new Map<string, string | null>();

  /** Sube public/<imageFile> a Cloudinary y devuelve su secure_url, o null. */
  async function uploadImage(imageFile: string): Promise<string | null> {
    if (!canUpload) return null;
    if (uploadCache.has(imageFile)) return uploadCache.get(imageFile)!;

    const localPath = resolve(PUBLIC_DIR, imageFile);
    if (!existsSync(localPath)) {
      console.warn(`  · No existe public/${imageFile}`);
      uploadCache.set(imageFile, null);
      return null;
    }
    try {
      const publicId = basename(imageFile, extname(imageFile)); // p.ej. "event1"
      const res = await cloudinary.uploader.upload(localPath, {
        folder: 'events',
        public_id: publicId, // id fijo => re-ejecutar sobreescribe, no duplica
        overwrite: true,
        invalidate: true,
        resource_type: 'image',
      });
      uploadCache.set(imageFile, res.secure_url);
      return res.secure_url;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`  · Falló la subida de ${imageFile}: ${message}`);
      uploadCache.set(imageFile, null);
      return null;
    }
  }

  await connectToDatabase();
  console.log('✅ Conectado a MongoDB');

  if (wipe) {
    const { deletedCount } = await Event.deleteMany({});
    console.log(`🗑️  Eventos borrados: ${deletedCount}`);
  }

  let created = 0;
  for (let i = 0; i < EVENTS.length; i++) {
    const { imageFile, ...event } = EVENTS[i];
    try {
      const uploadedUrl = await uploadImage(imageFile);
      const image = uploadedUrl ?? fallback(i);

      // .create() dispara el hook pre('save') que genera slug y normaliza fecha/hora.
      const doc = await Event.create({ ...event, image });
      created++;
      const source = uploadedUrl ? `⬆️  ${imageFile}` : 'respaldo';
      console.log(`  + ${doc.title}  (slug: ${doc.slug}) [${source}]`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`  ! Omitido "${event.title}": ${message}`);
    }
  }

  console.log(`\n🎉 Listo. Eventos insertados: ${created}/${EVENTS.length}`);
  await mongoose.connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error en el seed:', err);
  process.exit(1);
});
