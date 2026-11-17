// Textos do ecrã "Frases positivas" e da secção "As tuas frases" no
// "Estou com um gatilho", nas 10 línguas.

import type { Lang } from '../i18n/i18n';

type T = {
  all: string; favs: string; mine: string; another: string;
  fav: string; unfav: string; placeholder: string; add: string; remove: string;
  emptyFavs: string; emptyMine: string; yours: string; morePhrases: string;
};

const TXT: Record<Lang, T> = {
  pt: { all: 'Todas', favs: 'Favoritas', mine: 'As minhas', another: 'Outra frase', fav: 'Guardar nas favoritas', unfav: 'Tirar das favoritas', placeholder: 'Escreve uma frase que te ajude…', add: 'Adicionar', remove: 'Apagar frase', emptyFavs: 'Toca no coração de uma frase para a guardares aqui.', emptyMine: 'Escreve frases com as tuas palavras — as que te ajudam a ti.', yours: 'As tuas frases', morePhrases: 'Ver frases positivas' },
  'pt-BR': { all: 'Todas', favs: 'Favoritas', mine: 'Minhas', another: 'Outra frase', fav: 'Salvar nas favoritas', unfav: 'Tirar das favoritas', placeholder: 'Escreva uma frase que ajude você…', add: 'Adicionar', remove: 'Apagar frase', emptyFavs: 'Toque no coração de uma frase para salvá-la aqui.', emptyMine: 'Escreva frases com suas palavras — as que ajudam você.', yours: 'Suas frases', morePhrases: 'Ver frases positivas' },
  en: { all: 'All', favs: 'Favourites', mine: 'Mine', another: 'Another phrase', fav: 'Save to favourites', unfav: 'Remove from favourites', placeholder: 'Write a phrase that helps you…', add: 'Add', remove: 'Delete phrase', emptyFavs: 'Tap the heart on a phrase to keep it here.', emptyMine: 'Write phrases in your own words — the ones that help you.', yours: 'Your phrases', morePhrases: 'See positive phrases' },
  es: { all: 'Todas', favs: 'Favoritas', mine: 'Mías', another: 'Otra frase', fav: 'Guardar en favoritas', unfav: 'Quitar de favoritas', placeholder: 'Escribe una frase que te ayude…', add: 'Añadir', remove: 'Borrar frase', emptyFavs: 'Toca el corazón de una frase para guardarla aquí.', emptyMine: 'Escribe frases con tus palabras: las que te ayudan a ti.', yours: 'Tus frases', morePhrases: 'Ver frases positivas' },
  fr: { all: 'Toutes', favs: 'Favorites', mine: 'Les miennes', another: 'Une autre phrase', fav: 'Ajouter aux favorites', unfav: 'Retirer des favorites', placeholder: 'Écris une phrase qui t\'aide…', add: 'Ajouter', remove: 'Supprimer la phrase', emptyFavs: 'Touche le cœur d\'une phrase pour la garder ici.', emptyMine: 'Écris des phrases avec tes propres mots — celles qui t\'aident.', yours: 'Tes phrases', morePhrases: 'Voir les phrases positives' },
  de: { all: 'Alle', favs: 'Favoriten', mine: 'Meine', another: 'Anderer Satz', fav: 'Zu Favoriten', unfav: 'Aus Favoriten entfernen', placeholder: 'Schreib einen Satz, der dir hilft…', add: 'Hinzufügen', remove: 'Satz löschen', emptyFavs: 'Tippe auf das Herz eines Satzes, um ihn hier zu behalten.', emptyMine: 'Schreib Sätze in deinen eigenen Worten – die, die dir helfen.', yours: 'Deine Sätze', morePhrases: 'Positive Sätze ansehen' },
  it: { all: 'Tutte', favs: 'Preferite', mine: 'Le mie', another: "Un'altra frase", fav: 'Aggiungi alle preferite', unfav: 'Togli dalle preferite', placeholder: 'Scrivi una frase che ti aiuti…', add: 'Aggiungi', remove: 'Elimina frase', emptyFavs: 'Tocca il cuore di una frase per tenerla qui.', emptyMine: 'Scrivi frasi con parole tue: quelle che aiutano te.', yours: 'Le tue frasi', morePhrases: 'Vedi le frasi positive' },
  nl: { all: 'Alle', favs: 'Favorieten', mine: 'Mijn zinnen', another: 'Andere zin', fav: 'Bewaren als favoriet', unfav: 'Uit favorieten halen', placeholder: 'Schrijf een zin die je helpt…', add: 'Toevoegen', remove: 'Zin verwijderen', emptyFavs: 'Tik op het hartje van een zin om hem hier te bewaren.', emptyMine: 'Schrijf zinnen in je eigen woorden – de zinnen die jou helpen.', yours: 'Jouw zinnen', morePhrases: 'Positieve zinnen bekijken' },
  pl: { all: 'Wszystkie', favs: 'Ulubione', mine: 'Moje', another: 'Inne zdanie', fav: 'Dodaj do ulubionych', unfav: 'Usuń z ulubionych', placeholder: 'Napisz zdanie, które pomaga…', add: 'Dodaj', remove: 'Usuń zdanie', emptyFavs: 'Dotknij serca przy zdaniu, aby je tu zachować.', emptyMine: 'Pisz zdania własnymi słowami — takie, które pomagają.', yours: 'Twoje zdania', morePhrases: 'Zobacz pozytywne zdania' },
  ru: { all: 'Все', favs: 'Избранные', mine: 'Мои', another: 'Другая фраза', fav: 'В избранное', unfav: 'Убрать из избранного', placeholder: 'Напиши фразу, которая помогает…', add: 'Добавить', remove: 'Удалить фразу', emptyFavs: 'Нажми на сердечко у фразы, чтобы сохранить её здесь.', emptyMine: 'Пиши фразы своими словами — те, что помогают тебе.', yours: 'Твои фразы', morePhrases: 'Позитивные фразы' },
};

export function phrasesText(lang: Lang): T {
  return TXT[lang] ?? TXT.en;
}
export const PHRASES_LANGS = Object.keys(TXT) as Lang[];
