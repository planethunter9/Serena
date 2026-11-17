// Textos da Respiração e do Varrimento corporal (técnicas do separador Apoio),
// nas 10 línguas. Linguagem neutra em género em todas.

import type { Lang } from '../i18n/i18n';

// ------------------------------------------------------------------ Respiração
export type BreathPatternId = 'calm' | 'even' | 'box';
// Fases em segundos: inspirar, segurar (cheio), expirar, segurar (vazio).
export const BREATH_PATTERNS: Record<BreathPatternId, { inhale: number; hold1: number; exhale: number; hold2: number }> = {
  calm: { inhale: 4, hold1: 0, exhale: 6, hold2: 0 },   // 6 respirações/min, expiração mais longa
  even: { inhale: 5, hold1: 0, exhale: 5, hold2: 0 },
  box: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
};
export const BREATH_MINUTES = [1, 3, 5] as const;

type BreathTxt = {
  intro: string; pattern: string; duration: string; min: string; start: string; stop: string;
  inhale: string; hold: string; exhale: string; left: string;
  names: Record<BreathPatternId, string>; descs: Record<BreathPatternId, string>;
  doneTitle: string; doneBody: string; again: string; back: string; dizzy: string;
};

const BREATH: Record<Lang, BreathTxt> = {
  pt: {
    intro: 'Segue o círculo: cresce quando inspiras, encolhe quando expiras. O telemóvel vibra a cada mudança, por isso podes fechar os olhos.',
    pattern: 'Ritmo', duration: 'Duração', min: 'min', start: 'Começar', stop: 'Parar',
    inhale: 'Inspira', hold: 'Segura', exhale: 'Expira', left: 'em falta',
    names: { calm: 'Calma 4–6', even: 'Equilibrada 5–5', box: 'Quadrada 4–4–4–4' },
    descs: { calm: 'Expiração mais longa — a que mais acalma.', even: 'Inspirar e expirar ao mesmo ritmo.', box: 'Com pausas — ajuda a focar.' },
    doneTitle: 'Feito', doneBody: 'Repara em como está o teu corpo agora. Não tem de estar perfeito — só um pouco mais calmo.',
    again: 'Mais uma vez', back: 'Voltar', dizzy: 'Se sentires tonturas, volta a respirar normalmente.',
  },
  'pt-BR': {
    intro: 'Siga o círculo: ele cresce quando você inspira e encolhe quando expira. O celular vibra a cada mudança, então você pode fechar os olhos.',
    pattern: 'Ritmo', duration: 'Duração', min: 'min', start: 'Começar', stop: 'Parar',
    inhale: 'Inspire', hold: 'Segure', exhale: 'Expire', left: 'restantes',
    names: { calm: 'Calma 4–6', even: 'Equilibrada 5–5', box: 'Quadrada 4–4–4–4' },
    descs: { calm: 'Expiração mais longa — a que mais acalma.', even: 'Inspirar e expirar no mesmo ritmo.', box: 'Com pausas — ajuda a focar.' },
    doneTitle: 'Pronto', doneBody: 'Repare em como está seu corpo agora. Não precisa estar perfeito — só um pouco mais calmo.',
    again: 'Mais uma vez', back: 'Voltar', dizzy: 'Se sentir tontura, volte a respirar normalmente.',
  },
  en: {
    intro: 'Follow the circle: it grows as you breathe in and shrinks as you breathe out. Your phone vibrates at each change, so you can close your eyes.',
    pattern: 'Rhythm', duration: 'Duration', min: 'min', start: 'Start', stop: 'Stop',
    inhale: 'Breathe in', hold: 'Hold', exhale: 'Breathe out', left: 'left',
    names: { calm: 'Calm 4–6', even: 'Even 5–5', box: 'Box 4–4–4–4' },
    descs: { calm: 'Longer out-breath — the most calming.', even: 'Breathing in and out at the same pace.', box: 'With pauses — helps you focus.' },
    doneTitle: 'Done', doneBody: 'Notice how your body feels now. It does not need to be perfect — just a little calmer.',
    again: 'Once more', back: 'Back', dizzy: 'If you feel dizzy, go back to breathing normally.',
  },
  es: {
    intro: 'Sigue el círculo: crece cuando inhalas y se encoge cuando exhalas. El móvil vibra en cada cambio, así que puedes cerrar los ojos.',
    pattern: 'Ritmo', duration: 'Duración', min: 'min', start: 'Empezar', stop: 'Parar',
    inhale: 'Inhala', hold: 'Mantén', exhale: 'Exhala', left: 'restantes',
    names: { calm: 'Calma 4–6', even: 'Equilibrada 5–5', box: 'Cuadrada 4–4–4–4' },
    descs: { calm: 'Exhalación más larga: la que más calma.', even: 'Inhalar y exhalar al mismo ritmo.', box: 'Con pausas: ayuda a concentrarse.' },
    doneTitle: 'Hecho', doneBody: 'Fíjate en cómo está tu cuerpo ahora. No tiene que estar perfecto, solo un poco más tranquilo.',
    again: 'Otra vez', back: 'Volver', dizzy: 'Si notas mareo, vuelve a respirar con normalidad.',
  },
  fr: {
    intro: "Suis le cercle : il grandit quand tu inspires et rétrécit quand tu expires. Le téléphone vibre à chaque changement, tu peux donc fermer les yeux.",
    pattern: 'Rythme', duration: 'Durée', min: 'min', start: 'Commencer', stop: 'Arrêter',
    inhale: 'Inspire', hold: 'Retiens', exhale: 'Expire', left: 'restantes',
    names: { calm: 'Calme 4–6', even: 'Équilibrée 5–5', box: 'Carrée 4–4–4–4' },
    descs: { calm: "Expiration plus longue — la plus apaisante.", even: 'Inspirer et expirer au même rythme.', box: 'Avec des pauses — aide à se concentrer.' },
    doneTitle: 'Terminé', doneBody: "Remarque comment ton corps se sent maintenant. Pas besoin que ce soit parfait — juste un peu plus calme.",
    again: 'Encore une fois', back: 'Retour', dizzy: 'En cas de vertige, reviens à une respiration normale.',
  },
  de: {
    intro: 'Folge dem Kreis: Er wird größer, wenn du einatmest, und kleiner, wenn du ausatmest. Das Handy vibriert bei jedem Wechsel, du kannst also die Augen schließen.',
    pattern: 'Rhythmus', duration: 'Dauer', min: 'Min.', start: 'Starten', stop: 'Stopp',
    inhale: 'Einatmen', hold: 'Halten', exhale: 'Ausatmen', left: 'übrig',
    names: { calm: 'Ruhig 4–6', even: 'Gleichmäßig 5–5', box: 'Box 4–4–4–4' },
    descs: { calm: 'Längeres Ausatmen – beruhigt am meisten.', even: 'Gleich lang ein- und ausatmen.', box: 'Mit Pausen – hilft beim Fokussieren.' },
    doneTitle: 'Geschafft', doneBody: 'Spür nach, wie sich dein Körper jetzt anfühlt. Es muss nicht perfekt sein – nur ein bisschen ruhiger.',
    again: 'Noch einmal', back: 'Zurück', dizzy: 'Wenn dir schwindelig wird, atme wieder normal.',
  },
  it: {
    intro: "Segui il cerchio: si allarga quando inspiri e si restringe quando espiri. Il telefono vibra a ogni cambio, quindi puoi chiudere gli occhi.",
    pattern: 'Ritmo', duration: 'Durata', min: 'min', start: 'Inizia', stop: 'Ferma',
    inhale: 'Inspira', hold: 'Trattieni', exhale: 'Espira', left: 'rimanenti',
    names: { calm: 'Calma 4–6', even: 'Equilibrata 5–5', box: 'Quadrata 4–4–4–4' },
    descs: { calm: "Espirazione più lunga: la più calmante.", even: 'Inspirare ed espirare allo stesso ritmo.', box: 'Con pause: aiuta a concentrarsi.' },
    doneTitle: 'Fatto', doneBody: "Nota come sta il tuo corpo adesso. Non deve essere perfetto, solo un po' più calmo.",
    again: "Ancora una volta", back: 'Indietro', dizzy: 'Se senti dei capogiri, torna a respirare normalmente.',
  },
  nl: {
    intro: 'Volg de cirkel: hij groeit als je inademt en krimpt als je uitademt. Je telefoon trilt bij elke wissel, dus je kunt je ogen sluiten.',
    pattern: 'Ritme', duration: 'Duur', min: 'min', start: 'Starten', stop: 'Stoppen',
    inhale: 'Adem in', hold: 'Vasthouden', exhale: 'Adem uit', left: 'over',
    names: { calm: 'Rustig 4–6', even: 'Gelijkmatig 5–5', box: 'Vierkant 4–4–4–4' },
    descs: { calm: 'Langere uitademing – werkt het meest kalmerend.', even: 'Even lang in- en uitademen.', box: 'Met pauzes – helpt je focussen.' },
    doneTitle: 'Klaar', doneBody: 'Merk op hoe je lichaam nu voelt. Het hoeft niet perfect te zijn – alleen wat rustiger.',
    again: 'Nog een keer', back: 'Terug', dizzy: 'Word je duizelig, adem dan weer gewoon.',
  },
  pl: {
    intro: 'Podążaj za kołem: rośnie przy wdechu i maleje przy wydechu. Telefon wibruje przy każdej zmianie, więc można zamknąć oczy.',
    pattern: 'Rytm', duration: 'Czas', min: 'min', start: 'Rozpocznij', stop: 'Zatrzymaj',
    inhale: 'Wdech', hold: 'Zatrzymaj', exhale: 'Wydech', left: 'zostało',
    names: { calm: 'Spokojny 4–6', even: 'Równy 5–5', box: 'Kwadratowy 4–4–4–4' },
    descs: { calm: 'Dłuższy wydech — najbardziej uspokaja.', even: 'Wdech i wydech w tym samym tempie.', box: 'Z przerwami — pomaga się skupić.' },
    doneTitle: 'Gotowe', doneBody: 'Zauważ, jak teraz czuje się ciało. Nie musi być idealnie — wystarczy trochę spokojniej.',
    again: 'Jeszcze raz', back: 'Wróć', dizzy: 'Jeśli pojawią się zawroty głowy, wróć do zwykłego oddechu.',
  },
  ru: {
    intro: 'Следи за кругом: он растёт на вдохе и уменьшается на выдохе. Телефон вибрирует при каждой смене, так что можно закрыть глаза.',
    pattern: 'Ритм', duration: 'Длительность', min: 'мин', start: 'Начать', stop: 'Стоп',
    inhale: 'Вдох', hold: 'Задержка', exhale: 'Выдох', left: 'осталось',
    names: { calm: 'Спокойный 4–6', even: 'Ровный 5–5', box: 'Квадратный 4–4–4–4' },
    descs: { calm: 'Более длинный выдох — успокаивает сильнее всего.', even: 'Вдох и выдох в одном темпе.', box: 'С паузами — помогает сосредоточиться.' },
    doneTitle: 'Готово', doneBody: 'Обрати внимание, как сейчас чувствует себя тело. Не обязательно идеально — просто немного спокойнее.',
    again: 'Ещё раз', back: 'Назад', dizzy: 'Если кружится голова, вернись к обычному дыханию.',
  },
};
export function breathText(lang: Lang): BreathTxt {
  return BREATH[lang] ?? BREATH.en;
}

// ---------------------------------------------------------- Varrimento corporal
export const BODYSCAN_SECONDS = 20; // por zona, no modo guiado

type Area = { name: string; text: string };
type ScanTxt = {
  intro: string; manual: string; manualDesc: string; guided: string; guidedDesc: string; start: string;
  prev: string; next: string; pause: string; resume: string; finish: string;
  doneTitle: string; doneBody: string; again: string; back: string;
  areas: Area[];
};

const SCAN: Record<Lang, ScanTxt> = {
  pt: {
    intro: 'Vais passar a atenção pelo corpo, zona a zona. Não há nada para mudar nem para resolver — só reparar no que lá está.',
    manual: 'Ao meu ritmo', manualDesc: 'Avanças quando quiseres.', guided: 'Guiado', guidedDesc: '20 segundos por zona, com vibração.', start: 'Começar',
    prev: 'Anterior', next: 'Seguinte', pause: 'Pausa', resume: 'Continuar', finish: 'Terminar',
    doneTitle: 'Terminado', doneBody: 'Ficaste com o corpo tal como está, sem lutar contra ele. Isso é uma competência — e treina-se.',
    again: 'Repetir', back: 'Voltar',
    areas: [
      { name: 'Pés', text: 'Leva a atenção aos pés. Repara no contacto com o chão, na temperatura, no peso. Não precisas de mudar nada.' },
      { name: 'Pernas', text: 'Sobe para as pernas. Repara se estão tensas ou soltas. Deixa-as pesadas, apoiadas.' },
      { name: 'Barriga', text: 'Agora a barriga. Pode haver sensações — aperto, borboletas, calor. Repara nelas com curiosidade, sem as julgar e sem tentar que desapareçam. São sensações, não avisos.' },
      { name: 'Peito', text: 'Repara no peito a subir e a descer com a respiração. Deixa a expiração ser um pouco mais longa.' },
      { name: 'Mãos', text: 'Repara nas mãos. Se estiverem fechadas, abre-as devagar.' },
      { name: 'Braços', text: 'Sente o peso dos braços. Deixa-os cair, sem esforço.' },
      { name: 'Ombros', text: 'Os ombros guardam muita tensão. Deixa-os descer um pouco, para longe das orelhas.' },
      { name: 'Pescoço e maxilar', text: 'Solta o maxilar — os dentes podem afastar-se. Deixa o pescoço relaxar.' },
      { name: 'Rosto', text: 'Suaviza a testa e a zona à volta dos olhos. Deixa o rosto descansar.' },
      { name: 'Corpo inteiro', text: 'Agora sente o corpo inteiro de uma vez. Estás aqui, a respirar, e consegues ficar com o que sentes.' },
    ],
  },
  'pt-BR': {
    intro: 'Você vai passar a atenção pelo corpo, parte por parte. Não há nada para mudar nem resolver — só perceber o que está ali.',
    manual: 'No meu ritmo', manualDesc: 'Você avança quando quiser.', guided: 'Guiado', guidedDesc: '20 segundos por parte, com vibração.', start: 'Começar',
    prev: 'Anterior', next: 'Próximo', pause: 'Pausar', resume: 'Continuar', finish: 'Terminar',
    doneTitle: 'Pronto', doneBody: 'Você ficou com o corpo do jeito que ele está, sem lutar contra ele. Isso é uma habilidade — e se treina.',
    again: 'Repetir', back: 'Voltar',
    areas: [
      { name: 'Pés', text: 'Leve a atenção aos pés. Perceba o contato com o chão, a temperatura, o peso. Não precisa mudar nada.' },
      { name: 'Pernas', text: 'Suba para as pernas. Perceba se estão tensas ou soltas. Deixe-as pesadas, apoiadas.' },
      { name: 'Barriga', text: 'Agora a barriga. Pode haver sensações — aperto, frio na barriga, calor. Perceba-as com curiosidade, sem julgar e sem tentar fazê-las sumir. São sensações, não avisos.' },
      { name: 'Peito', text: 'Perceba o peito subindo e descendo com a respiração. Deixe a expiração um pouco mais longa.' },
      { name: 'Mãos', text: 'Perceba as mãos. Se estiverem fechadas, abra-as devagar.' },
      { name: 'Braços', text: 'Sinta o peso dos braços. Deixe-os cair, sem esforço.' },
      { name: 'Ombros', text: 'Os ombros guardam muita tensão. Deixe-os descer um pouco, longe das orelhas.' },
      { name: 'Pescoço e mandíbula', text: 'Solte a mandíbula — os dentes podem se afastar. Deixe o pescoço relaxar.' },
      { name: 'Rosto', text: 'Suavize a testa e a região dos olhos. Deixe o rosto descansar.' },
      { name: 'Corpo inteiro', text: 'Agora sinta o corpo inteiro de uma vez. Você está aqui, respirando, e consegue ficar com o que sente.' },
    ],
  },
  en: {
    intro: 'You will move your attention through your body, one area at a time. There is nothing to change or fix — just notice what is there.',
    manual: 'At my own pace', manualDesc: 'You move on when you want.', guided: 'Guided', guidedDesc: '20 seconds per area, with vibration.', start: 'Start',
    prev: 'Back', next: 'Next', pause: 'Pause', resume: 'Resume', finish: 'Finish',
    doneTitle: 'Finished', doneBody: 'You stayed with your body as it is, without fighting it. That is a skill — and it grows with practice.',
    again: 'Again', back: 'Back',
    areas: [
      { name: 'Feet', text: 'Bring your attention to your feet. Notice the contact with the floor, the temperature, the weight. You do not need to change anything.' },
      { name: 'Legs', text: 'Move up to your legs. Notice whether they are tense or loose. Let them be heavy and supported.' },
      { name: 'Belly', text: 'Now your belly. There may be sensations — tightness, butterflies, warmth. Notice them with curiosity, without judging them or trying to make them go away. They are sensations, not warnings.' },
      { name: 'Chest', text: 'Notice your chest rising and falling with your breath. Let the out-breath be a little longer.' },
      { name: 'Hands', text: 'Notice your hands. If they are clenched, open them slowly.' },
      { name: 'Arms', text: 'Feel the weight of your arms. Let them drop, without effort.' },
      { name: 'Shoulders', text: 'Shoulders hold a lot of tension. Let them drop a little, away from your ears.' },
      { name: 'Neck and jaw', text: 'Loosen your jaw — your teeth can part. Let your neck relax.' },
      { name: 'Face', text: 'Soften your forehead and the area around your eyes. Let your face rest.' },
      { name: 'Whole body', text: 'Now feel your whole body at once. You are here, breathing, and you can stay with what you feel.' },
    ],
  },
  es: {
    intro: 'Vas a pasar la atención por el cuerpo, zona a zona. No hay nada que cambiar ni que resolver: solo notar lo que hay.',
    manual: 'A mi ritmo', manualDesc: 'Avanzas cuando quieras.', guided: 'Guiado', guidedDesc: '20 segundos por zona, con vibración.', start: 'Empezar',
    prev: 'Anterior', next: 'Siguiente', pause: 'Pausa', resume: 'Seguir', finish: 'Terminar',
    doneTitle: 'Terminado', doneBody: 'Te has quedado con el cuerpo tal como está, sin luchar contra él. Eso es una habilidad, y se entrena.',
    again: 'Repetir', back: 'Volver',
    areas: [
      { name: 'Pies', text: 'Lleva la atención a los pies. Nota el contacto con el suelo, la temperatura, el peso. No hace falta cambiar nada.' },
      { name: 'Piernas', text: 'Sube a las piernas. Nota si están tensas o sueltas. Déjalas pesadas, apoyadas.' },
      { name: 'Tripa', text: 'Ahora la tripa. Puede haber sensaciones: presión, mariposas, calor. Obsérvalas con curiosidad, sin juzgarlas ni intentar que desaparezcan. Son sensaciones, no avisos.' },
      { name: 'Pecho', text: 'Nota cómo el pecho sube y baja con la respiración. Deja que la exhalación sea un poco más larga.' },
      { name: 'Manos', text: 'Nota las manos. Si están cerradas, ábrelas despacio.' },
      { name: 'Brazos', text: 'Siente el peso de los brazos. Déjalos caer, sin esfuerzo.' },
      { name: 'Hombros', text: 'Los hombros acumulan mucha tensión. Déjalos bajar un poco, lejos de las orejas.' },
      { name: 'Cuello y mandíbula', text: 'Suelta la mandíbula: los dientes pueden separarse. Deja que el cuello se relaje.' },
      { name: 'Cara', text: 'Suaviza la frente y la zona de los ojos. Deja que la cara descanse.' },
      { name: 'Todo el cuerpo', text: 'Ahora siente todo el cuerpo a la vez. Estás aquí, respirando, y puedes quedarte con lo que sientes.' },
    ],
  },
  fr: {
    intro: "Tu vas promener ton attention dans ton corps, zone par zone. Rien à changer ni à résoudre — juste remarquer ce qui est là.",
    manual: 'À mon rythme', manualDesc: 'Tu avances quand tu veux.', guided: 'Guidé', guidedDesc: '20 secondes par zone, avec vibration.', start: 'Commencer',
    prev: 'Précédent', next: 'Suivant', pause: 'Pause', resume: 'Reprendre', finish: 'Terminer',
    doneTitle: 'Terminé', doneBody: "Tu as accueilli ton corps tel qu'il est, sans lutter. C'est une compétence — et elle se travaille.",
    again: 'Recommencer', back: 'Retour',
    areas: [
      { name: 'Pieds', text: "Porte ton attention sur tes pieds. Remarque le contact avec le sol, la température, le poids. Tu n'as rien à changer." },
      { name: 'Jambes', text: 'Monte vers les jambes. Remarque si elles sont tendues ou relâchées. Laisse-les lourdes, posées.' },
      { name: 'Ventre', text: "Maintenant le ventre. Il peut y avoir des sensations — serrement, papillons, chaleur. Observe-les avec curiosité, sans les juger ni chercher à les faire disparaître. Ce sont des sensations, pas des alertes." },
      { name: 'Poitrine', text: "Remarque ta poitrine qui monte et descend avec la respiration. Laisse l'expiration être un peu plus longue." },
      { name: 'Mains', text: "Remarque tes mains. Si elles sont serrées, ouvre-les doucement." },
      { name: 'Bras', text: 'Sens le poids de tes bras. Laisse-les tomber, sans effort.' },
      { name: 'Épaules', text: 'Les épaules gardent beaucoup de tension. Laisse-les descendre un peu, loin des oreilles.' },
      { name: 'Cou et mâchoire', text: 'Relâche la mâchoire — les dents peuvent se séparer. Laisse le cou se détendre.' },
      { name: 'Visage', text: 'Adoucis le front et le tour des yeux. Laisse le visage se reposer.' },
      { name: 'Corps entier', text: "Maintenant, sens ton corps entier d'un coup. Tu es là, tu respires, et tu peux rester avec ce que tu ressens." },
    ],
  },
  de: {
    intro: 'Du wanderst mit deiner Aufmerksamkeit Bereich für Bereich durch den Körper. Es gibt nichts zu ändern oder zu lösen – nur wahrzunehmen, was da ist.',
    manual: 'In meinem Tempo', manualDesc: 'Du gehst weiter, wann du willst.', guided: 'Geführt', guidedDesc: '20 Sekunden pro Bereich, mit Vibration.', start: 'Starten',
    prev: 'Zurück', next: 'Weiter', pause: 'Pause', resume: 'Fortsetzen', finish: 'Beenden',
    doneTitle: 'Geschafft', doneBody: 'Du bist bei deinem Körper geblieben, so wie er ist, ohne gegen ihn anzukämpfen. Das ist eine Fähigkeit – und sie lässt sich üben.',
    again: 'Noch einmal', back: 'Zurück',
    areas: [
      { name: 'Füße', text: 'Richte die Aufmerksamkeit auf deine Füße. Spür den Kontakt zum Boden, die Temperatur, das Gewicht. Du musst nichts ändern.' },
      { name: 'Beine', text: 'Geh hinauf zu den Beinen. Spür, ob sie angespannt oder locker sind. Lass sie schwer und getragen sein.' },
      { name: 'Bauch', text: 'Jetzt der Bauch. Vielleicht gibt es Empfindungen – Enge, Kribbeln, Wärme. Nimm sie neugierig wahr, ohne sie zu bewerten oder wegmachen zu wollen. Es sind Empfindungen, keine Warnungen.' },
      { name: 'Brust', text: 'Spür, wie sich die Brust mit dem Atem hebt und senkt. Lass das Ausatmen etwas länger sein.' },
      { name: 'Hände', text: 'Spür deine Hände. Wenn sie zu Fäusten geballt sind, öffne sie langsam.' },
      { name: 'Arme', text: 'Spür das Gewicht deiner Arme. Lass sie mühelos sinken.' },
      { name: 'Schultern', text: 'Die Schultern halten viel Spannung. Lass sie ein wenig sinken, weg von den Ohren.' },
      { name: 'Nacken und Kiefer', text: 'Lockere den Kiefer – die Zähne dürfen sich lösen. Lass den Nacken entspannen.' },
      { name: 'Gesicht', text: 'Mach die Stirn und die Augenpartie weich. Lass das Gesicht ruhen.' },
      { name: 'Ganzer Körper', text: 'Spür jetzt den ganzen Körper auf einmal. Du bist hier, du atmest, und du kannst bei dem bleiben, was du spürst.' },
    ],
  },
  it: {
    intro: "Porterai l'attenzione nel corpo, una zona alla volta. Non c'è niente da cambiare o da risolvere: solo notare ciò che c'è.",
    manual: 'Al mio ritmo', manualDesc: 'Vai avanti quando vuoi.', guided: 'Guidato', guidedDesc: '20 secondi per zona, con vibrazione.', start: 'Inizia',
    prev: 'Indietro', next: 'Avanti', pause: 'Pausa', resume: 'Riprendi', finish: 'Termina',
    doneTitle: 'Finito', doneBody: "Hai accolto il corpo così com'è, senza lottare. È un'abilità, e si allena.",
    again: 'Ripeti', back: 'Indietro',
    areas: [
      { name: 'Piedi', text: "Porta l'attenzione ai piedi. Nota il contatto con il pavimento, la temperatura, il peso. Non devi cambiare nulla." },
      { name: 'Gambe', text: 'Sali alle gambe. Nota se sono tese o rilassate. Lasciale pesanti, appoggiate.' },
      { name: 'Pancia', text: "Ora la pancia. Potrebbero esserci sensazioni: stretta, farfalle, calore. Osservale con curiosità, senza giudicarle e senza cercare di farle sparire. Sono sensazioni, non avvertimenti." },
      { name: 'Petto', text: "Nota il petto che si alza e si abbassa con il respiro. Lascia che l'espirazione sia un po' più lunga." },
      { name: 'Mani', text: 'Nota le mani. Se sono chiuse, aprile lentamente.' },
      { name: 'Braccia', text: 'Senti il peso delle braccia. Lasciale cadere, senza sforzo.' },
      { name: 'Spalle', text: "Le spalle trattengono molta tensione. Lasciale scendere un po', lontano dalle orecchie." },
      { name: 'Collo e mascella', text: 'Rilassa la mascella: i denti possono staccarsi. Lascia che il collo si distenda.' },
      { name: 'Viso', text: 'Ammorbidisci la fronte e la zona intorno agli occhi. Lascia riposare il viso.' },
      { name: 'Tutto il corpo', text: 'Ora senti tutto il corpo insieme. Sei qui, respiri, e puoi restare con ciò che senti.' },
    ],
  },
  nl: {
    intro: 'Je brengt je aandacht stap voor stap door je lichaam. Er valt niets te veranderen of op te lossen – alleen opmerken wat er is.',
    manual: 'In mijn tempo', manualDesc: 'Je gaat verder wanneer je wilt.', guided: 'Begeleid', guidedDesc: '20 seconden per gebied, met trilling.', start: 'Starten',
    prev: 'Vorige', next: 'Volgende', pause: 'Pauze', resume: 'Doorgaan', finish: 'Afronden',
    doneTitle: 'Klaar', doneBody: 'Je bent bij je lichaam gebleven zoals het is, zonder ertegen te vechten. Dat is een vaardigheid – en die kun je oefenen.',
    again: 'Opnieuw', back: 'Terug',
    areas: [
      { name: 'Voeten', text: 'Breng je aandacht naar je voeten. Merk het contact met de vloer op, de temperatuur, het gewicht. Je hoeft niets te veranderen.' },
      { name: 'Benen', text: 'Ga omhoog naar je benen. Merk op of ze gespannen of los zijn. Laat ze zwaar en ondersteund zijn.' },
      { name: 'Buik', text: 'Nu je buik. Er kunnen sensaties zijn – een strak gevoel, vlinders, warmte. Merk ze nieuwsgierig op, zonder oordeel en zonder ze weg te willen hebben. Het zijn sensaties, geen waarschuwingen.' },
      { name: 'Borst', text: 'Merk op hoe je borst op en neer gaat met je adem. Laat de uitademing iets langer zijn.' },
      { name: 'Handen', text: 'Merk je handen op. Als ze gebald zijn, open ze dan langzaam.' },
      { name: 'Armen', text: 'Voel het gewicht van je armen. Laat ze moeiteloos zakken.' },
      { name: 'Schouders', text: 'Schouders houden veel spanning vast. Laat ze een beetje zakken, weg van je oren.' },
      { name: 'Nek en kaak', text: 'Ontspan je kaak – je tanden mogen van elkaar. Laat je nek ontspannen.' },
      { name: 'Gezicht', text: 'Maak je voorhoofd en de zone rond je ogen zacht. Laat je gezicht rusten.' },
      { name: 'Hele lichaam', text: 'Voel nu je hele lichaam tegelijk. Je bent hier, je ademt, en je kunt blijven bij wat je voelt.' },
    ],
  },
  pl: {
    intro: 'Uwaga przejdzie przez ciało, obszar po obszarze. Nie trzeba niczego zmieniać ani rozwiązywać — wystarczy zauważać, co jest.',
    manual: 'W moim tempie', manualDesc: 'Przejście dalej, kiedy chcesz.', guided: 'Z przewodnikiem', guidedDesc: '20 sekund na obszar, z wibracją.', start: 'Rozpocznij',
    prev: 'Wstecz', next: 'Dalej', pause: 'Pauza', resume: 'Wznów', finish: 'Zakończ',
    doneTitle: 'Zakończone', doneBody: 'Pozostanie z ciałem takim, jakie jest, bez walki z nim — to umiejętność, którą można ćwiczyć.',
    again: 'Powtórz', back: 'Wróć',
    areas: [
      { name: 'Stopy', text: 'Skieruj uwagę na stopy. Zauważ kontakt z podłogą, temperaturę, ciężar. Nie trzeba niczego zmieniać.' },
      { name: 'Nogi', text: 'Przejdź do nóg. Zauważ, czy są napięte, czy rozluźnione. Pozwól im być ciężkimi, opartymi.' },
      { name: 'Brzuch', text: 'Teraz brzuch. Mogą pojawić się odczucia — ucisk, motylki, ciepło. Obserwuj je z ciekawością, bez oceniania i bez prób ich usunięcia. To odczucia, nie ostrzeżenia.' },
      { name: 'Klatka piersiowa', text: 'Zauważ, jak klatka piersiowa unosi się i opada z oddechem. Niech wydech będzie trochę dłuższy.' },
      { name: 'Dłonie', text: 'Zauważ dłonie. Jeśli są zaciśnięte, otwórz je powoli.' },
      { name: 'Ramiona', text: 'Poczuj ciężar rąk. Pozwól im opaść, bez wysiłku.' },
      { name: 'Barki', text: 'Barki trzymają dużo napięcia. Pozwól im trochę opaść, z dala od uszu.' },
      { name: 'Szyja i szczęka', text: 'Rozluźnij szczękę — zęby mogą się rozchylić. Pozwól szyi się rozluźnić.' },
      { name: 'Twarz', text: 'Zmiękcz czoło i okolice oczu. Pozwól twarzy odpocząć.' },
      { name: 'Całe ciało', text: 'Teraz poczuj całe ciało naraz. Jesteś tutaj, oddychasz i możesz zostać z tym, co czujesz.' },
    ],
  },
  ru: {
    intro: 'Внимание будет двигаться по телу, часть за частью. Ничего не нужно менять или решать — только замечать, что есть.',
    manual: 'В своём темпе', manualDesc: 'Переход дальше — когда захочешь.', guided: 'С подсказками', guidedDesc: '20 секунд на часть тела, с вибрацией.', start: 'Начать',
    prev: 'Назад', next: 'Дальше', pause: 'Пауза', resume: 'Продолжить', finish: 'Завершить',
    doneTitle: 'Готово', doneBody: 'Получилось побыть с телом таким, какое оно есть, не борясь с ним. Это навык — и его можно тренировать.',
    again: 'Ещё раз', back: 'Назад',
    areas: [
      { name: 'Стопы', text: 'Направь внимание на стопы. Заметь контакт с полом, температуру, вес. Ничего не нужно менять.' },
      { name: 'Ноги', text: 'Поднимись к ногам. Заметь, напряжены они или расслаблены. Позволь им быть тяжёлыми, опирающимися.' },
      { name: 'Живот', text: 'Теперь живот. Могут быть ощущения — сжатие, «бабочки», тепло. Замечай их с любопытством, не оценивая и не пытаясь от них избавиться. Это ощущения, а не предупреждения.' },
      { name: 'Грудь', text: 'Заметь, как грудь поднимается и опускается с дыханием. Пусть выдох будет чуть длиннее.' },
      { name: 'Кисти рук', text: 'Заметь кисти рук. Если они сжаты, медленно раскрой их.' },
      { name: 'Руки', text: 'Почувствуй вес рук. Позволь им опуститься без усилия.' },
      { name: 'Плечи', text: 'В плечах много напряжения. Позволь им немного опуститься, подальше от ушей.' },
      { name: 'Шея и челюсть', text: 'Расслабь челюсть — зубы могут разомкнуться. Позволь шее расслабиться.' },
      { name: 'Лицо', text: 'Смягчи лоб и область вокруг глаз. Позволь лицу отдохнуть.' },
      { name: 'Всё тело', text: 'Теперь почувствуй всё тело сразу. Ты здесь, ты дышишь, и можно оставаться с тем, что чувствуешь.' },
    ],
  },
};
export function scanText(lang: Lang): ScanTxt {
  return SCAN[lang] ?? SCAN.en;
}

export const TECHNIQUE_LANGS = Object.keys(BREATH) as Lang[];
