import Image from 'next/image';

/**
 * Avatar do titular. Quando o primeiro nome está nas listas abaixo, usa a
 * foto correspondente; qualquer nome fora delas (apelidos, nomes
 * estrangeiros, nomes unissex, razão social) cai no avatar de iniciais,
 * que é determinístico e funciona para qualquer entrada.
 */

const FEMININE = new Set([
  'ana', 'adriana', 'agatha', 'alice', 'aline', 'amanda', 'analu', 'andreia',
  'angela', 'antonia', 'aurora', 'beatriz', 'bianca', 'bruna', 'camila',
  'carla', 'carolina', 'catarina', 'cecilia', 'celia', 'clara', 'claudia',
  'cristina', 'daniela', 'debora', 'denise', 'edna', 'elaine', 'eliane',
  'elisa', 'eloa', 'emanuelly', 'esther', 'fabiana', 'fernanda', 'flavia',
  'francisca', 'gabriela', 'giovanna', 'heloisa', 'helena', 'ines', 'isabel',
  'isabela', 'isadora', 'jessica', 'joana', 'julia', 'juliana', 'karina',
  'kelly', 'lara', 'larissa', 'laura', 'leticia', 'lidia', 'livia', 'lorena',
  'luana', 'luciana', 'luiza', 'manuela', 'marcia', 'margarida', 'maria',
  'mariana', 'marina', 'marta', 'melissa', 'michele', 'milena', 'monica',
  'natalia', 'nicole', 'olivia', 'patricia', 'paula', 'priscila', 'rafaela',
  'raquel', 'rebeca', 'regina', 'renata', 'roberta', 'rosa', 'sabrina',
  'sandra', 'sara', 'sarah', 'silvia', 'simone', 'sofia', 'solange', 'sonia',
  'tatiane', 'tereza', 'valentina', 'vanessa', 'vera', 'veronica', 'viviane',
  'yasmin',
]);

const MASCULINE = new Set([
  'adriano', 'alexandre', 'anderson', 'andre', 'antonio', 'arthur', 'artur',
  'benjamin', 'bernardo', 'bruno', 'caio', 'carlos', 'cesar', 'claudio',
  'daniel', 'davi', 'david', 'diego', 'douglas', 'eduardo', 'edson', 'elias',
  'emerson', 'enzo', 'fabio', 'felipe', 'fernando', 'filipe', 'flavio',
  'francisco', 'gabriel', 'geraldo', 'gilberto', 'guilherme', 'gustavo',
  'heitor', 'henrique', 'igor', 'isaac', 'ivan', 'jefferson', 'joao', 'joaquim',
  'jonas', 'jorge', 'jose', 'juliano', 'leandro', 'leonardo', 'levi',
  'lorenzo', 'lucas', 'luciano', 'luis', 'luiz', 'manoel', 'manuel', 'marcelo',
  'marcio', 'marcos', 'mario', 'mateus', 'matheus', 'mauricio', 'miguel',
  'murilo', 'nelson', 'nicolas', 'otavio', 'paulo', 'pedro', 'rafael',
  'raimundo', 'renan', 'renato', 'ricardo', 'roberto', 'rodrigo', 'ronaldo',
  'samuel', 'sebastiao', 'sergio', 'silvio', 'theo', 'thiago', 'tiago',
  'valdir', 'vicente', 'victor', 'vinicius', 'vitor', 'wagner', 'wellington',
  'wesley', 'william', 'yuri',
]);

/*
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ AJUSTE DO ZOOM DAS FOTOS — mexa só nos números `zoom` abaixo.   │
 * │                                                                 │
 * │   1.0  = enquadramento original do arquivo (mais distante)      │
 * │   1.4  = aproxima 40% no rosto                                  │
 * │   2.0  = bem fechado no rosto                                   │
 * │                                                                 │
 * │ `offsetY` sobe (valor negativo) ou desce (positivo) o recorte,  │
 * │ em % da altura — útil se a cabeça ficar alta ou baixa demais.   │
 * │                                                                 │
 * │ Salvou o arquivo? O dev server já reflete. Não precisa mexer    │
 * │ nas imagens nem limpar cache — o zoom é CSS.                    │
 * └─────────────────────────────────────────────────────────────────┘
 */
const PHOTOS = {
  feminine: { src: '/avatar-feminino.jpg', zoom: 1.2, offsetY: 5 },
  masculine: { src: '/avatar-masculino.jpg', zoom: 1.2, offsetY: 5 },
} as const;

const INITIALS_VARIANTS = [
  'bg-lime text-dark',
  'bg-dark text-lime',
  'bg-surface-2 text-accent ring-1 ring-dark/15',
] as const;

const SIZES = {
  sm: { box: 'h-9 w-9', text: 'text-xs' },
  md: { box: 'h-12 w-12', text: 'text-sm' },
  lg: { box: 'h-16 w-16', text: 'text-lg' },
} as const;

/** minúsculas e sem acento, para casar "José" com "jose" */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function photoFor(name: string): (typeof PHOTOS)[keyof typeof PHOTOS] | null {
  const firstName = normalize(name.trim().split(/\s+/)[0] ?? '');
  if (FEMININE.has(firstName)) return PHOTOS.feminine;
  if (MASCULINE.has(firstName)) return PHOTOS.masculine;
  return null;
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function initialsVariantOf(name: string): string {
  let hash = 0;
  for (const char of name) {
    hash = (hash + char.codePointAt(0)!) % 997;
  }
  return INITIALS_VARIANTS[hash % INITIALS_VARIANTS.length];
}

interface AvatarProps {
  name: string;
  size?: keyof typeof SIZES;
}

export function Avatar({ name, size = 'md' }: AvatarProps) {
  const { box, text } = SIZES[size];
  const photo = photoFor(name);

  if (photo) {
    return (
      <span
        className={`relative block shrink-0 overflow-hidden rounded-full ring-2 ring-dark/10 ${box}`}
      >
        <Image
          src={photo.src}
          alt=""
          fill
          // Servidas sem o otimizador: são só dois arquivos de 640×640 (~80 KB),
          // reusados em toda a lista e cacheados pelo navegador. Otimizar
          // geraria versões pequenas demais para o `scale` acima, saindo borradas.
          unoptimized
          className="object-cover"
          style={{
            transform: `scale(${photo.zoom}) translateY(${photo.offsetY}%)`,
          }}
        />
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold tracking-wide ${box} ${text} ${initialsVariantOf(name)}`}
    >
      {initialsOf(name)}
    </span>
  );
}
