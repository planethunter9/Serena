// Rótulos para leitores de ecrã (VoiceOver / TalkBack) dos botões só com ícone,
// nas 10 línguas da app.
import { Lang, useLang } from '../i18n/i18n';

type A11y = { back: string; delete: string; edit: string; save: string; settings: string; profile: string; close: string };

const A11Y: Record<Lang, A11y> = {
  pt: { back: 'Voltar', delete: 'Eliminar', edit: 'Editar', save: 'Guardar', settings: 'Definições', profile: 'Perfil', close: 'Fechar' },
  'pt-BR': { back: 'Voltar', delete: 'Excluir', edit: 'Editar', save: 'Salvar', settings: 'Configurações', profile: 'Perfil', close: 'Fechar' },
  en: { back: 'Back', delete: 'Delete', edit: 'Edit', save: 'Save', settings: 'Settings', profile: 'Profile', close: 'Close' },
  es: { back: 'Volver', delete: 'Eliminar', edit: 'Editar', save: 'Guardar', settings: 'Ajustes', profile: 'Perfil', close: 'Cerrar' },
  fr: { back: 'Retour', delete: 'Supprimer', edit: 'Modifier', save: 'Enregistrer', settings: 'Réglages', profile: 'Profil', close: 'Fermer' },
  de: { back: 'Zurück', delete: 'Löschen', edit: 'Bearbeiten', save: 'Speichern', settings: 'Einstellungen', profile: 'Profil', close: 'Schließen' },
  it: { back: 'Indietro', delete: 'Elimina', edit: 'Modifica', save: 'Salva', settings: 'Impostazioni', profile: 'Profilo', close: 'Chiudi' },
  nl: { back: 'Terug', delete: 'Verwijderen', edit: 'Bewerken', save: 'Opslaan', settings: 'Instellingen', profile: 'Profiel', close: 'Sluiten' },
  pl: { back: 'Wstecz', delete: 'Usuń', edit: 'Edytuj', save: 'Zapisz', settings: 'Ustawienia', profile: 'Profil', close: 'Zamknij' },
  ru: { back: 'Назад', delete: 'Удалить', edit: 'Изменить', save: 'Сохранить', settings: 'Настройки', profile: 'Профиль', close: 'Закрыть' },
};

export function useA11y(): A11y {
  const { lang } = useLang();
  return A11Y[lang] ?? A11Y.en;
}
