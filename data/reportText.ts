// Textos do "Resumo para a consulta" (PDF para levar a quem acompanha a pessoa),
// nas 10 línguas. Linguagem neutra em género (o relatório fala da pessoa em
// cabeçalhos/substantivos, sem formas verbais com género).

import type { Lang } from '../i18n/i18n';

export type ReportText = {
  // Ecrã
  screenTitle: string; screenIntro: string;
  period: string; p30: string; p90: string; pAll: string;
  includeName: string; includeNotes: string; journalNever: string;
  talkLabel: string; talkPlaceholder: string;
  generate: string; preview: string; privacyHint: string; error: string;
  // Documento
  docTitle: string; generated: string; periodLabel: string; allTime: string; name: string;
  overview: string; exposures: string; unplanned: string; thoughts: string; hard: string; exposureDays: string; practice: string;
  avgDrop: string; severity: string; profile: string; triggers: string; symptoms: string;
  date: string; step: string; bpa: string; ba: string; note: string;
  what: string; stayed: string; feared: string; happened: string; partly: string;
  type: string; anxiety: string; panic: string; behavior: string; reason: string; vomited: string;
  safety: string; inUse: string; dropping: string; dropped: string;
  thought: string; balanced: string;
  talk: string; none: string; yes: string; no: string; footer: string; notesHidden: string;
};

const PT: ReportText = {
  screenTitle: 'Resumo para a consulta',
  screenIntro: 'Cria um PDF com o teu progresso para mostrares ou enviares a quem te acompanha (psicologia, psiquiatria ou medicina). Ajuda a aproveitar melhor a consulta.',
  period: 'Período', p30: 'Últimos 30 dias', p90: 'Últimos 3 meses', pAll: 'Tudo',
  includeName: 'Incluir o meu nome', includeNotes: 'Incluir o que escrevi (notas, pensamentos, motivos)', journalNever: 'O diário nunca é incluído.',
  talkLabel: 'O que quero falar na consulta (opcional)', talkPlaceholder: 'Ex.: as situações que ainda evito, dúvidas sobre a medicação…',
  generate: 'Criar e partilhar PDF', preview: 'Pré-visualizar / imprimir', privacyHint: 'O PDF é criado no teu telemóvel e só sai dele se o partilhares.', error: 'Não foi possível criar o PDF. Tenta outra vez.',
  docTitle: 'Resumo de progresso', generated: 'Criado em', periodLabel: 'Período', allTime: 'Todos os registos', name: 'Nome',
  overview: 'Resumo', exposures: 'Exposições planeadas', unplanned: 'Exposições não planeadas', thoughts: 'Registos de pensamentos', hard: 'Momentos difíceis', exposureDays: 'Dias com exposição', practice: 'Outros exercícios',
  avgDrop: 'Desconforto médio nas exposições (antes → depois, 0–10)', severity: 'Gravidade sentida (0–5), início → fim do período', profile: 'Perfil inicial', triggers: 'Gatilhos', symptoms: 'Sintomas',
  date: 'Data', step: 'Passo', bpa: 'Antes / pico / depois', ba: 'Antes / depois', note: 'Nota',
  what: 'O que aconteceu', stayed: 'Permanência na situação', feared: 'Medo', happened: 'Aconteceu?', partly: 'Em parte',
  type: 'Tipo', anxiety: 'Ansiedade', panic: 'Pânico', behavior: 'Comportamento de segurança', reason: 'Motivo', vomited: 'Houve vómito?',
  safety: 'Comportamentos de segurança', inUse: 'Em uso', dropping: 'A largar', dropped: 'Largados',
  thought: 'Pensamento', balanced: 'Pensamento alternativo',
  talk: 'Para falar na consulta', none: 'Sem registos neste período.', yes: 'Sim', no: 'Não',
  footer: 'Criado com a Serena, uma app de apoio psicoeducativo para a emetofobia. Os valores são autorregistados e não constituem uma avaliação clínica.',
  notesHidden: 'Textos escritos não incluídos.',
};

const TXT: Record<Lang, ReportText> = {
  pt: PT,
  'pt-BR': {
    ...PT,
    screenIntro: 'Crie um PDF com seu progresso para mostrar ou enviar a quem acompanha você (psicologia, psiquiatria ou medicina). Ajuda a aproveitar melhor a consulta.',
    includeName: 'Incluir meu nome', includeNotes: 'Incluir o que escrevi (notas, pensamentos, motivos)',
    talkPlaceholder: 'Ex.: as situações que ainda evito, dúvidas sobre a medicação…',
    privacyHint: 'O PDF é criado no seu celular e só sai dele se você compartilhar.', generate: 'Criar e compartilhar PDF', preview: 'Pré-visualizar / imprimir', error: 'Não foi possível criar o PDF. Tente de novo.',
    stayed: 'Permanência na situação', vomited: 'Houve vômito?',
    footer: 'Criado com o Serena, um app de apoio psicoeducativo para a emetofobia. Os valores são autorregistrados e não constituem uma avaliação clínica.',
  },
  en: {
    screenTitle: 'Summary for your appointment',
    screenIntro: 'Create a PDF of your progress to show or send to the professional who supports you (psychology, psychiatry or medicine). It helps you get more out of the session.',
    period: 'Period', p30: 'Last 30 days', p90: 'Last 3 months', pAll: 'Everything',
    includeName: 'Include my name', includeNotes: 'Include what I wrote (notes, thoughts, reasons)', journalNever: 'The journal is never included.',
    talkLabel: 'What I want to talk about (optional)', talkPlaceholder: 'E.g. situations I still avoid, questions about medication…',
    generate: 'Create and share PDF', preview: 'Preview / print', privacyHint: 'The PDF is created on your phone and only leaves it if you share it.', error: 'Could not create the PDF. Please try again.',
    docTitle: 'Progress summary', generated: 'Created on', periodLabel: 'Period', allTime: 'All records', name: 'Name',
    overview: 'Overview', exposures: 'Planned exposures', unplanned: 'Unplanned exposures', thoughts: 'Thought records', hard: 'Hard moments', exposureDays: 'Days with exposure', practice: 'Other exercises',
    avgDrop: 'Average discomfort in exposures (before → after, 0–10)', severity: 'Perceived severity (0–5), start → end of period', profile: 'Initial profile', triggers: 'Triggers', symptoms: 'Symptoms',
    date: 'Date', step: 'Step', bpa: 'Before / peak / after', ba: 'Before / after', note: 'Note',
    what: 'What happened', stayed: 'Stayed in the situation', feared: 'Fear', happened: 'Did it happen?', partly: 'Partly',
    type: 'Type', anxiety: 'Anxiety', panic: 'Panic', behavior: 'Safety behaviour', reason: 'Reason', vomited: 'Vomiting?',
    safety: 'Safety behaviours', inUse: 'In use', dropping: 'Dropping', dropped: 'Dropped',
    thought: 'Thought', balanced: 'Balanced thought',
    talk: 'To discuss in the session', none: 'No records in this period.', yes: 'Yes', no: 'No',
    footer: 'Created with Serena, a psychoeducational support app for emetophobia. Values are self-reported and are not a clinical assessment.',
    notesHidden: 'Written text not included.',
  },
  es: {
    screenTitle: 'Resumen para la consulta',
    screenIntro: 'Crea un PDF con tu progreso para mostrarlo o enviarlo a quien te acompaña (psicología, psiquiatría o medicina). Ayuda a aprovechar mejor la consulta.',
    period: 'Período', p30: 'Últimos 30 días', p90: 'Últimos 3 meses', pAll: 'Todo',
    includeName: 'Incluir mi nombre', includeNotes: 'Incluir lo que escribí (notas, pensamientos, motivos)', journalNever: 'El diario nunca se incluye.',
    talkLabel: 'De qué quiero hablar en la consulta (opcional)', talkPlaceholder: 'P. ej.: situaciones que aún evito, dudas sobre la medicación…',
    generate: 'Crear y compartir PDF', preview: 'Vista previa / imprimir', privacyHint: 'El PDF se crea en tu móvil y solo sale de él si lo compartes.', error: 'No se pudo crear el PDF. Inténtalo de nuevo.',
    docTitle: 'Resumen de progreso', generated: 'Creado el', periodLabel: 'Período', allTime: 'Todos los registros', name: 'Nombre',
    overview: 'Resumen', exposures: 'Exposiciones planificadas', unplanned: 'Exposiciones no planificadas', thoughts: 'Registros de pensamientos', hard: 'Momentos difíciles', exposureDays: 'Días con exposición', practice: 'Otros ejercicios',
    avgDrop: 'Malestar medio en las exposiciones (antes → después, 0–10)', severity: 'Gravedad percibida (0–5), inicio → fin del período', profile: 'Perfil inicial', triggers: 'Detonantes', symptoms: 'Síntomas',
    date: 'Fecha', step: 'Paso', bpa: 'Antes / pico / después', ba: 'Antes / después', note: 'Nota',
    what: 'Qué pasó', stayed: 'Permanencia en la situación', feared: 'Miedo', happened: '¿Ocurrió?', partly: 'En parte',
    type: 'Tipo', anxiety: 'Ansiedad', panic: 'Pánico', behavior: 'Conducta de seguridad', reason: 'Motivo', vomited: '¿Hubo vómito?',
    safety: 'Conductas de seguridad', inUse: 'En uso', dropping: 'Dejándolas', dropped: 'Dejadas',
    thought: 'Pensamiento', balanced: 'Pensamiento alternativo',
    talk: 'Para hablar en la consulta', none: 'Sin registros en este período.', yes: 'Sí', no: 'No',
    footer: 'Creado con Serena, una app de apoyo psicoeducativo para la emetofobia. Los valores son autorregistrados y no constituyen una evaluación clínica.',
    notesHidden: 'Textos escritos no incluidos.',
  },
  fr: {
    screenTitle: 'Résumé pour la consultation',
    screenIntro: 'Crée un PDF de tes progrès à montrer ou à envoyer à la personne qui t\'accompagne (psychologie, psychiatrie ou médecine). Cela aide à mieux profiter de la séance.',
    period: 'Période', p30: '30 derniers jours', p90: '3 derniers mois', pAll: 'Tout',
    includeName: 'Inclure mon nom', includeNotes: 'Inclure ce que j\'ai écrit (notes, pensées, motifs)', journalNever: 'Le journal n\'est jamais inclus.',
    talkLabel: 'Ce dont je veux parler (facultatif)', talkPlaceholder: 'Ex. : les situations que j\'évite encore, des questions sur le traitement…',
    generate: 'Créer et partager le PDF', preview: 'Aperçu / imprimer', privacyHint: 'Le PDF est créé sur ton téléphone et n\'en sort que si tu le partages.', error: 'Impossible de créer le PDF. Réessaie.',
    docTitle: 'Résumé des progrès', generated: 'Créé le', periodLabel: 'Période', allTime: 'Tous les enregistrements', name: 'Nom',
    overview: 'Vue d\'ensemble', exposures: 'Expositions planifiées', unplanned: 'Expositions imprévues', thoughts: 'Registres de pensées', hard: 'Moments difficiles', exposureDays: 'Jours avec exposition', practice: 'Autres exercices',
    avgDrop: 'Malaise moyen pendant les expositions (avant → après, 0–10)', severity: 'Sévérité ressentie (0–5), début → fin de la période', profile: 'Profil initial', triggers: 'Déclencheurs', symptoms: 'Symptômes',
    date: 'Date', step: 'Étape', bpa: 'Avant / pic / après', ba: 'Avant / après', note: 'Note',
    what: 'Ce qui s\'est passé', stayed: 'Maintien dans la situation', feared: 'Peur', happened: 'Est-ce arrivé ?', partly: 'En partie',
    type: 'Type', anxiety: 'Anxiété', panic: 'Panique', behavior: 'Comportement de sécurité', reason: 'Motif', vomited: 'Vomissement ?',
    safety: 'Comportements de sécurité', inUse: 'Utilisés', dropping: 'En cours d\'abandon', dropped: 'Abandonnés',
    thought: 'Pensée', balanced: 'Pensée alternative',
    talk: 'À aborder en séance', none: 'Aucun enregistrement sur cette période.', yes: 'Oui', no: 'Non',
    footer: 'Créé avec Serena, une app de soutien psychoéducatif pour l\'émétophobie. Les valeurs sont auto-déclarées et ne constituent pas une évaluation clinique.',
    notesHidden: 'Textes écrits non inclus.',
  },
  de: {
    screenTitle: 'Zusammenfassung für den Termin',
    screenIntro: 'Erstelle ein PDF mit deinem Fortschritt, um es der Fachperson zu zeigen oder zu schicken, die dich begleitet (Psychologie, Psychiatrie oder Medizin). So holst du mehr aus der Sitzung heraus.',
    period: 'Zeitraum', p30: 'Letzte 30 Tage', p90: 'Letzte 3 Monate', pAll: 'Alles',
    includeName: 'Meinen Namen angeben', includeNotes: 'Meine Texte einschließen (Notizen, Gedanken, Gründe)', journalNever: 'Das Tagebuch wird nie eingeschlossen.',
    talkLabel: 'Worüber ich sprechen möchte (optional)', talkPlaceholder: 'Z. B. Situationen, die ich noch vermeide, Fragen zur Medikation…',
    generate: 'PDF erstellen und teilen', preview: 'Vorschau / drucken', privacyHint: 'Das PDF wird auf deinem Handy erstellt und verlässt es nur, wenn du es teilst.', error: 'Das PDF konnte nicht erstellt werden. Bitte versuch es erneut.',
    docTitle: 'Fortschrittsübersicht', generated: 'Erstellt am', periodLabel: 'Zeitraum', allTime: 'Alle Einträge', name: 'Name',
    overview: 'Übersicht', exposures: 'Geplante Expositionen', unplanned: 'Ungeplante Expositionen', thoughts: 'Gedankenprotokolle', hard: 'Schwere Momente', exposureDays: 'Tage mit Exposition', practice: 'Andere Übungen',
    avgDrop: 'Durchschnittliches Unbehagen bei Expositionen (vorher → nachher, 0–10)', severity: 'Empfundener Schweregrad (0–5), Beginn → Ende des Zeitraums', profile: 'Ausgangsprofil', triggers: 'Auslöser', symptoms: 'Symptome',
    date: 'Datum', step: 'Schritt', bpa: 'Vorher / Spitze / nachher', ba: 'Vorher / nachher', note: 'Notiz',
    what: 'Was passiert ist', stayed: 'In der Situation geblieben', feared: 'Befürchtung', happened: 'Eingetreten?', partly: 'Teilweise',
    type: 'Art', anxiety: 'Angst', panic: 'Panik', behavior: 'Sicherheitsverhalten', reason: 'Grund', vomited: 'Erbrechen?',
    safety: 'Sicherheitsverhalten', inUse: 'Aktuell', dropping: 'Wird abgebaut', dropped: 'Abgelegt',
    thought: 'Gedanke', balanced: 'Ausgewogener Gedanke',
    talk: 'Für die Sitzung', none: 'Keine Einträge in diesem Zeitraum.', yes: 'Ja', no: 'Nein',
    footer: 'Erstellt mit Serena, einer psychoedukativen App bei Emetophobie. Die Werte sind selbst erfasst und keine klinische Beurteilung.',
    notesHidden: 'Geschriebene Texte nicht enthalten.',
  },
  it: {
    screenTitle: 'Riepilogo per la visita',
    screenIntro: 'Crea un PDF con i tuoi progressi da mostrare o inviare a chi ti segue (psicologia, psichiatria o medicina). Aiuta a sfruttare meglio la seduta.',
    period: 'Periodo', p30: 'Ultimi 30 giorni', p90: 'Ultimi 3 mesi', pAll: 'Tutto',
    includeName: 'Includi il mio nome', includeNotes: 'Includi ciò che ho scritto (note, pensieri, motivi)', journalNever: 'Il diario non viene mai incluso.',
    talkLabel: 'Di cosa voglio parlare (facoltativo)', talkPlaceholder: 'Es.: situazioni che evito ancora, dubbi sui farmaci…',
    generate: 'Crea e condividi PDF', preview: 'Anteprima / stampa', privacyHint: 'Il PDF viene creato sul tuo telefono e ne esce solo se lo condividi.', error: 'Impossibile creare il PDF. Riprova.',
    docTitle: 'Riepilogo dei progressi', generated: 'Creato il', periodLabel: 'Periodo', allTime: 'Tutte le registrazioni', name: 'Nome',
    overview: 'Panoramica', exposures: 'Esposizioni pianificate', unplanned: 'Esposizioni impreviste', thoughts: 'Registri dei pensieri', hard: 'Momenti difficili', exposureDays: 'Giorni con esposizione', practice: 'Altri esercizi',
    avgDrop: 'Disagio medio nelle esposizioni (prima → dopo, 0–10)', severity: 'Gravità percepita (0–5), inizio → fine del periodo', profile: 'Profilo iniziale', triggers: 'Fattori scatenanti', symptoms: 'Sintomi',
    date: 'Data', step: 'Passo', bpa: 'Prima / picco / dopo', ba: 'Prima / dopo', note: 'Nota',
    what: 'Cosa è successo', stayed: 'Permanenza nella situazione', feared: 'Paura', happened: 'È successo?', partly: 'In parte',
    type: 'Tipo', anxiety: 'Ansia', panic: 'Panico', behavior: 'Comportamento protettivo', reason: 'Motivo', vomited: 'Vomito?',
    safety: 'Comportamenti protettivi', inUse: 'In uso', dropping: 'In abbandono', dropped: 'Abbandonati',
    thought: 'Pensiero', balanced: 'Pensiero alternativo',
    talk: 'Da discutere in seduta', none: 'Nessuna registrazione in questo periodo.', yes: 'Sì', no: 'No',
    footer: 'Creato con Serena, un\'app di supporto psicoeducativo per l\'emetofobia. I valori sono autoriferiti e non costituiscono una valutazione clinica.',
    notesHidden: 'Testi scritti non inclusi.',
  },
  nl: {
    screenTitle: 'Samenvatting voor de afspraak',
    screenIntro: 'Maak een pdf van je voortgang om te laten zien of te sturen naar wie je begeleidt (psychologie, psychiatrie of geneeskunde). Zo haal je meer uit de sessie.',
    period: 'Periode', p30: 'Laatste 30 dagen', p90: 'Laatste 3 maanden', pAll: 'Alles',
    includeName: 'Mijn naam vermelden', includeNotes: 'Wat ik schreef meenemen (notities, gedachten, redenen)', journalNever: 'Het dagboek wordt nooit meegenomen.',
    talkLabel: 'Waar ik over wil praten (optioneel)', talkPlaceholder: 'Bijv. situaties die ik nog vermijd, vragen over medicatie…',
    generate: 'Pdf maken en delen', preview: 'Voorbeeld / afdrukken', privacyHint: 'De pdf wordt op je telefoon gemaakt en verlaat die alleen als je hem deelt.', error: 'De pdf kon niet worden gemaakt. Probeer het opnieuw.',
    docTitle: 'Voortgangsoverzicht', generated: 'Gemaakt op', periodLabel: 'Periode', allTime: 'Alle registraties', name: 'Naam',
    overview: 'Overzicht', exposures: 'Geplande blootstellingen', unplanned: 'Onverwachte blootstellingen', thoughts: 'Gedachtenschema\'s', hard: 'Moeilijke momenten', exposureDays: 'Dagen met blootstelling', practice: 'Andere oefeningen',
    avgDrop: 'Gemiddeld ongemak bij blootstellingen (voor → na, 0–10)', severity: 'Ervaren ernst (0–5), begin → einde van de periode', profile: 'Beginprofiel', triggers: 'Triggers', symptoms: 'Symptomen',
    date: 'Datum', step: 'Stap', bpa: 'Voor / piek / na', ba: 'Voor / na', note: 'Notitie',
    what: 'Wat er gebeurde', stayed: 'In de situatie gebleven', feared: 'Angst', happened: 'Gebeurd?', partly: 'Deels',
    type: 'Soort', anxiety: 'Angst', panic: 'Paniek', behavior: 'Veiligheidsgedrag', reason: 'Reden', vomited: 'Overgeven?',
    safety: 'Veiligheidsgedrag', inUse: 'In gebruik', dropping: 'Aan het afbouwen', dropped: 'Losgelaten',
    thought: 'Gedachte', balanced: 'Alternatieve gedachte',
    talk: 'Te bespreken in de sessie', none: 'Geen registraties in deze periode.', yes: 'Ja', no: 'Nee',
    footer: 'Gemaakt met Serena, een psycho-educatieve app bij emetofobie. De waarden zijn zelfgerapporteerd en geen klinische beoordeling.',
    notesHidden: 'Geschreven tekst niet opgenomen.',
  },
  pl: {
    screenTitle: 'Podsumowanie na wizytę',
    screenIntro: 'Utwórz PDF z postępami, aby pokazać go lub wysłać osobie, która prowadzi terapię (psychologia, psychiatria lub medycyna). Pomaga lepiej wykorzystać wizytę.',
    period: 'Okres', p30: 'Ostatnie 30 dni', p90: 'Ostatnie 3 miesiące', pAll: 'Wszystko',
    includeName: 'Dołącz imię', includeNotes: 'Dołącz zapisane teksty (notatki, myśli, powody)', journalNever: 'Dziennik nigdy nie jest dołączany.',
    talkLabel: 'Tematy do omówienia (opcjonalnie)', talkPlaceholder: 'Np. sytuacje, których wciąż unikam, pytania o leki…',
    generate: 'Utwórz i udostępnij PDF', preview: 'Podgląd / drukuj', privacyHint: 'PDF powstaje na telefonie i opuszcza go tylko po udostępnieniu.', error: 'Nie udało się utworzyć PDF. Spróbuj ponownie.',
    docTitle: 'Podsumowanie postępów', generated: 'Utworzono', periodLabel: 'Okres', allTime: 'Wszystkie wpisy', name: 'Imię',
    overview: 'Przegląd', exposures: 'Zaplanowane ekspozycje', unplanned: 'Nieplanowane ekspozycje', thoughts: 'Zapisy myśli', hard: 'Trudne chwile', exposureDays: 'Dni z ekspozycją', practice: 'Inne ćwiczenia',
    avgDrop: 'Średni dyskomfort podczas ekspozycji (przed → po, 0–10)', severity: 'Odczuwane nasilenie (0–5), początek → koniec okresu', profile: 'Profil początkowy', triggers: 'Wyzwalacze', symptoms: 'Objawy',
    date: 'Data', step: 'Krok', bpa: 'Przed / szczyt / po', ba: 'Przed / po', note: 'Notatka',
    what: 'Co się wydarzyło', stayed: 'Pozostanie w sytuacji', feared: 'Obawa', happened: 'Czy to nastąpiło?', partly: 'Częściowo',
    type: 'Rodzaj', anxiety: 'Lęk', panic: 'Panika', behavior: 'Zachowanie zabezpieczające', reason: 'Powód', vomited: 'Wymioty?',
    safety: 'Zachowania zabezpieczające', inUse: 'Stosowane', dropping: 'Ograniczane', dropped: 'Porzucone',
    thought: 'Myśl', balanced: 'Myśl alternatywna',
    talk: 'Do omówienia na wizycie', none: 'Brak wpisów w tym okresie.', yes: 'Tak', no: 'Nie',
    footer: 'Utworzono w aplikacji Serena – wsparciu psychoedukacyjnym przy emetofobii. Wartości pochodzą z samoobserwacji i nie stanowią oceny klinicznej.',
    notesHidden: 'Zapisane teksty nie zostały dołączone.',
  },
  ru: {
    screenTitle: 'Сводка для приёма',
    screenIntro: 'Создайте PDF с прогрессом, чтобы показать или отправить специалисту, который вас сопровождает (психология, психиатрия или медицина). Так приём пройдёт продуктивнее.',
    period: 'Период', p30: 'Последние 30 дней', p90: 'Последние 3 месяца', pAll: 'Всё',
    includeName: 'Указать моё имя', includeNotes: 'Включить мои записи (заметки, мысли, причины)', journalNever: 'Дневник никогда не включается.',
    talkLabel: 'О чём хочется поговорить (необязательно)', talkPlaceholder: 'Напр.: ситуации, которых всё ещё избегаю, вопросы о лекарствах…',
    generate: 'Создать PDF и поделиться', preview: 'Просмотр / печать', privacyHint: 'PDF создаётся на телефоне и покидает его, только если вы им поделитесь.', error: 'Не удалось создать PDF. Попробуйте ещё раз.',
    docTitle: 'Сводка прогресса', generated: 'Создано', periodLabel: 'Период', allTime: 'Все записи', name: 'Имя',
    overview: 'Обзор', exposures: 'Запланированные экспозиции', unplanned: 'Незапланированные экспозиции', thoughts: 'Записи мыслей', hard: 'Трудные моменты', exposureDays: 'Дни с экспозицией', practice: 'Другие упражнения',
    avgDrop: 'Средний дискомфорт при экспозициях (до → после, 0–10)', severity: 'Ощущаемая тяжесть (0–5), начало → конец периода', profile: 'Исходный профиль', triggers: 'Триггеры', symptoms: 'Симптомы',
    date: 'Дата', step: 'Шаг', bpa: 'До / пик / после', ba: 'До / после', note: 'Заметка',
    what: 'Что произошло', stayed: 'Остаться в ситуации', feared: 'Страх', happened: 'Это случилось?', partly: 'Частично',
    type: 'Тип', anxiety: 'Тревога', panic: 'Паника', behavior: 'Защитное поведение', reason: 'Причина', vomited: 'Была рвота?',
    safety: 'Защитное поведение', inUse: 'Используется', dropping: 'Отказ в процессе', dropped: 'Оставлено',
    thought: 'Мысль', balanced: 'Альтернативная мысль',
    talk: 'Обсудить на приёме', none: 'Нет записей за этот период.', yes: 'Да', no: 'Нет',
    footer: 'Создано в Serena — приложении психообразовательной поддержки при эметофобии. Значения указаны самостоятельно и не являются клинической оценкой.',
    notesHidden: 'Записанные тексты не включены.',
  },
};

export function reportText(lang: Lang): ReportText {
  return TXT[lang] ?? TXT.en;
}

export const REPORT_LANGS = Object.keys(TXT) as Lang[];
