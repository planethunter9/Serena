// Sons ambiente da Serena. Todos gerados por síntese (scripts/generate-sounds.py):
// não há gravações de terceiros, logo não há direitos de autor de ninguém.
// Loops de 90 s, perfeitos (sem corte ao recomeçar).
//
// "Acalmar": água e música lenta (associadas a menos ansiedade) e uma
// respiração guiada a 6 ciclos/minuto. "Dormir": música grave e lenta, ruído
// rosa/castanho (sons constantes que tapam ruídos súbitos), noite e lareira.

import type { Ionicons } from '@expo/vector-icons';
import type { Lang } from '../i18n/i18n';

type T = Record<Lang, string>;
export type BuiltinSound = {
  id: string;
  category: 'calm' | 'sleep';
  icon: keyof typeof Ionicons.glyphMap;
  source: number; // require(...) do ficheiro de áudio
  title: T;
  desc: T;
};

export const SOUNDS: BuiltinSound[] = [
  // ---------------------------------------------------------------- Acalmar
  {
    id: 'breathing', category: 'calm', icon: 'pulse-outline', source: require('../assets/sounds/breathing.m4a'),
    title: { pt: 'Respiração guiada', 'pt-BR': 'Respiração guiada', en: 'Guided breathing', es: 'Respiración guiada', fr: 'Respiration guidée', de: 'Geführtes Atmen', it: 'Respirazione guidata', nl: 'Begeleide ademhaling', pl: 'Oddech z przewodnikiem', ru: 'Дыхание с подсказкой' },
    desc: {
      pt: 'Inspira enquanto o som sobe (4 s), expira enquanto desce (6 s). 6 respirações por minuto.',
      'pt-BR': 'Inspire enquanto o som sobe (4 s), expire enquanto desce (6 s). 6 respirações por minuto.',
      en: 'Breathe in as the sound rises (4 s), out as it falls (6 s). 6 breaths a minute.',
      es: 'Inhala mientras el sonido sube (4 s) y exhala mientras baja (6 s). 6 respiraciones por minuto.',
      fr: 'Inspire quand le son monte (4 s), expire quand il descend (6 s). 6 respirations par minute.',
      de: 'Einatmen, während der Klang steigt (4 s), ausatmen, während er sinkt (6 s). 6 Atemzüge pro Minute.',
      it: 'Inspira mentre il suono sale (4 s), espira mentre scende (6 s). 6 respiri al minuto.',
      nl: 'Adem in terwijl het geluid stijgt (4 s), uit terwijl het daalt (6 s). 6 ademhalingen per minuut.',
      pl: 'Wdech, gdy dźwięk narasta (4 s), wydech, gdy opada (6 s). 6 oddechów na minutę.',
      ru: 'Вдох, пока звук нарастает (4 с), выдох, пока стихает (6 с). 6 вдохов в минуту.',
    },
  },
  {
    id: 'ocean', category: 'calm', icon: 'water-outline', source: require('../assets/sounds/ocean.m4a'),
    title: { pt: 'Ondas do mar', 'pt-BR': 'Ondas do mar', en: 'Ocean waves', es: 'Olas del mar', fr: 'Vagues', de: 'Meereswellen', it: 'Onde del mare', nl: 'Golven', pl: 'Fale morza', ru: 'Морские волны' },
    desc: {
      pt: 'Uma onda a cada 10 segundos — acompanha-a com a respiração.',
      'pt-BR': 'Uma onda a cada 10 segundos — acompanhe com a respiração.',
      en: 'One wave every 10 seconds — breathe along with it.',
      es: 'Una ola cada 10 segundos: acompáñala con la respiración.',
      fr: 'Une vague toutes les 10 secondes — respire à son rythme.',
      de: 'Alle 10 Sekunden eine Welle – atme mit ihr.',
      it: 'Un\'onda ogni 10 secondi: segui il suo ritmo con il respiro.',
      nl: 'Elke 10 seconden een golf – adem met haar mee.',
      pl: 'Jedna fala co 10 sekund — oddychaj w jej rytmie.',
      ru: 'Волна каждые 10 секунд — дыши в её ритме.',
    },
  },
  {
    id: 'rain', category: 'calm', icon: 'rainy-outline', source: require('../assets/sounds/rain.m4a'),
    title: { pt: 'Chuva', 'pt-BR': 'Chuva', en: 'Rain', es: 'Lluvia', fr: 'Pluie', de: 'Regen', it: 'Pioggia', nl: 'Regen', pl: 'Deszcz', ru: 'Дождь' },
    desc: {
      pt: 'Chuva constante, sem trovões.', 'pt-BR': 'Chuva constante, sem trovões.', en: 'Steady rain, no thunder.',
      es: 'Lluvia constante, sin truenos.', fr: 'Pluie régulière, sans tonnerre.', de: 'Gleichmäßiger Regen, ohne Donner.',
      it: 'Pioggia costante, senza tuoni.', nl: 'Gelijkmatige regen, zonder onweer.', pl: 'Równomierny deszcz, bez grzmotów.', ru: 'Ровный дождь, без грома.',
    },
  },
  {
    id: 'stream', category: 'calm', icon: 'leaf-outline', source: require('../assets/sounds/stream.m4a'),
    title: { pt: 'Riacho', 'pt-BR': 'Riacho', en: 'Stream', es: 'Arroyo', fr: 'Ruisseau', de: 'Bach', it: 'Ruscello', nl: 'Beekje', pl: 'Strumień', ru: 'Ручей' },
    desc: {
      pt: 'Água a correr devagar.', 'pt-BR': 'Água correndo devagar.', en: 'Gently running water.',
      es: 'Agua que corre despacio.', fr: 'Eau qui coule doucement.', de: 'Sanft fließendes Wasser.',
      it: 'Acqua che scorre piano.', nl: 'Zacht stromend water.', pl: 'Spokojnie płynąca woda.', ru: 'Тихо бегущая вода.',
    },
  },
  {
    id: 'calm_music', category: 'calm', icon: 'musical-notes-outline', source: require('../assets/sounds/calm_music.m4a'),
    title: { pt: 'Música calma', 'pt-BR': 'Música calma', en: 'Calm music', es: 'Música tranquila', fr: 'Musique douce', de: 'Ruhige Musik', it: 'Musica calma', nl: 'Rustige muziek', pl: 'Spokojna muzyka', ru: 'Спокойная музыка' },
    desc: {
      pt: 'Acordes lentos e notas soltas, a cerca de 60 batidas por minuto.',
      'pt-BR': 'Acordes lentos e notas soltas, a cerca de 60 batidas por minuto.',
      en: 'Slow chords and gentle notes, at about 60 beats a minute.',
      es: 'Acordes lentos y notas sueltas, a unos 60 pulsos por minuto.',
      fr: 'Accords lents et notes légères, environ 60 battements par minute.',
      de: 'Langsame Akkorde und einzelne Töne, etwa 60 Schläge pro Minute.',
      it: 'Accordi lenti e note leggere, a circa 60 battiti al minuto.',
      nl: 'Trage akkoorden en losse noten, ongeveer 60 tellen per minuut.',
      pl: 'Wolne akordy i pojedyncze dźwięki, około 60 uderzeń na minutę.',
      ru: 'Медленные аккорды и отдельные ноты, около 60 ударов в минуту.',
    },
  },
  // ---------------------------------------------------------------- Dormir
  {
    id: 'sleep_music', category: 'sleep', icon: 'moon-outline', source: require('../assets/sounds/sleep_music.m4a'),
    title: { pt: 'Música para dormir', 'pt-BR': 'Música para dormir', en: 'Sleep music', es: 'Música para dormir', fr: 'Musique pour dormir', de: 'Musik zum Einschlafen', it: 'Musica per dormire', nl: 'Slaapmuziek', pl: 'Muzyka do snu', ru: 'Музыка для сна' },
    desc: {
      pt: 'Mais grave e mais lenta, para abrandar antes de dormir.',
      'pt-BR': 'Mais grave e mais lenta, para desacelerar antes de dormir.',
      en: 'Deeper and slower, to wind down before sleep.',
      es: 'Más grave y más lenta, para bajar el ritmo antes de dormir.',
      fr: 'Plus grave et plus lente, pour ralentir avant de dormir.',
      de: 'Tiefer und langsamer, um vor dem Schlafen runterzukommen.',
      it: 'Più grave e più lenta, per rallentare prima di dormire.',
      nl: 'Lager en trager, om tot rust te komen voor het slapen.',
      pl: 'Niższa i wolniejsza, by wyciszyć się przed snem.',
      ru: 'Ниже и медленнее, чтобы замедлиться перед сном.',
    },
  },
  {
    id: 'pink', category: 'sleep', icon: 'radio-outline', source: require('../assets/sounds/pink.m4a'),
    title: { pt: 'Ruído rosa', 'pt-BR': 'Ruído rosa', en: 'Pink noise', es: 'Ruido rosa', fr: 'Bruit rose', de: 'Rosa Rauschen', it: 'Rumore rosa', nl: 'Roze ruis', pl: 'Szum różowy', ru: 'Розовый шум' },
    desc: {
      pt: 'Som constante e suave que tapa ruídos súbitos.', 'pt-BR': 'Som constante e suave que abafa ruídos repentinos.',
      en: 'A soft, steady sound that masks sudden noises.', es: 'Un sonido suave y constante que tapa los ruidos repentinos.',
      fr: 'Un son doux et continu qui masque les bruits soudains.', de: 'Ein sanftes, gleichmäßiges Geräusch, das plötzliche Geräusche überdeckt.',
      it: 'Un suono morbido e costante che copre i rumori improvvisi.', nl: 'Een zacht, constant geluid dat plotselinge geluiden maskeert.',
      pl: 'Łagodny, stały dźwięk, który zagłusza nagłe hałasy.', ru: 'Мягкий ровный звук, который заглушает внезапные шумы.',
    },
  },
  {
    id: 'brown', category: 'sleep', icon: 'radio-outline', source: require('../assets/sounds/brown.m4a'),
    title: { pt: 'Ruído castanho', 'pt-BR': 'Ruído marrom', en: 'Brown noise', es: 'Ruido marrón', fr: 'Bruit brun', de: 'Braunes Rauschen', it: 'Rumore marrone', nl: 'Bruine ruis', pl: 'Szum brązowy', ru: 'Коричневый шум' },
    desc: {
      pt: 'Mais grave que o rosa — lembra um vento distante.', 'pt-BR': 'Mais grave que o rosa — lembra um vento distante.',
      en: 'Deeper than pink — like distant wind.', es: 'Más grave que el rosa: recuerda a un viento lejano.',
      fr: 'Plus grave que le rose — comme un vent lointain.', de: 'Tiefer als Rosa – wie ferner Wind.',
      it: 'Più grave del rosa: ricorda un vento lontano.', nl: 'Lager dan roze – als verre wind.',
      pl: 'Niższy niż różowy — jak odległy wiatr.', ru: 'Ниже розового — как далёкий ветер.',
    },
  },
  {
    id: 'night', category: 'sleep', icon: 'cloudy-night-outline', source: require('../assets/sounds/night.m4a'),
    title: { pt: 'Noite de verão', 'pt-BR': 'Noite de verão', en: 'Summer night', es: 'Noche de verano', fr: 'Nuit d\'été', de: 'Sommernacht', it: 'Notte d\'estate', nl: 'Zomernacht', pl: 'Letnia noc', ru: 'Летняя ночь' },
    desc: {
      pt: 'Grilos e uma brisa leve.', 'pt-BR': 'Grilos e uma brisa leve.', en: 'Crickets and a light breeze.',
      es: 'Grillos y una brisa ligera.', fr: 'Grillons et une brise légère.', de: 'Grillen und eine leichte Brise.',
      it: 'Grilli e una brezza leggera.', nl: 'Krekels en een zachte bries.', pl: 'Świerszcze i lekki wiaterek.', ru: 'Сверчки и лёгкий ветерок.',
    },
  },
  {
    id: 'fire', category: 'sleep', icon: 'flame-outline', source: require('../assets/sounds/fire.m4a'),
    title: { pt: 'Lareira', 'pt-BR': 'Lareira', en: 'Fireplace', es: 'Chimenea', fr: 'Feu de cheminée', de: 'Kaminfeuer', it: 'Camino', nl: 'Haardvuur', pl: 'Kominek', ru: 'Камин' },
    desc: {
      pt: 'Lenha a estalar devagar.', 'pt-BR': 'Lenha estalando devagar.', en: 'Wood gently crackling.',
      es: 'Leña crepitando despacio.', fr: 'Bois qui crépite doucement.', de: 'Sanft knisterndes Holz.',
      it: 'Legna che scoppietta piano.', nl: 'Zacht knetterend hout.', pl: 'Cicho trzaskające drewno.', ru: 'Тихо потрескивают дрова.',
    },
  },
];

// Temporizador (sobretudo para dormir): desliga com fade-out.
export const TIMER_MINUTES = [15, 30, 60] as const;

type TimerText = { off: string; label: string; min: string; endsIn: string };
export const TIMER_TEXT: Record<Lang, TimerText> = {
  pt: { label: 'Desligar ao fim de', off: 'Não', min: 'min', endsIn: 'Desliga dentro de' },
  'pt-BR': { label: 'Desligar depois de', off: 'Não', min: 'min', endsIn: 'Desliga em' },
  en: { label: 'Turn off after', off: 'Off', min: 'min', endsIn: 'Turns off in' },
  es: { label: 'Apagar tras', off: 'No', min: 'min', endsIn: 'Se apaga en' },
  fr: { label: 'Arrêter après', off: 'Non', min: 'min', endsIn: 'Arrêt dans' },
  de: { label: 'Ausschalten nach', off: 'Aus', min: 'Min.', endsIn: 'Aus in' },
  it: { label: 'Spegni dopo', off: 'No', min: 'min', endsIn: 'Si spegne tra' },
  nl: { label: 'Uitzetten na', off: 'Uit', min: 'min', endsIn: 'Stopt over' },
  pl: { label: 'Wyłącz po', off: 'Nie', min: 'min', endsIn: 'Wyłączy się za' },
  ru: { label: 'Выключить через', off: 'Нет', min: 'мин', endsIn: 'Выключится через' },
};
