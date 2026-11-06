// Modo acompanhante: um ecrã para a pessoa mostrar (ou partilhar com) alguém
// que vive com ela, a ensinar a ajudar do lado certo — sem dar tranquilização
// nem acomodar a fobia. Puxa os comportamentos que a pessoa está a largar, para
// o acompanhante saber o que NÃO deve facilitar.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { SAFETY_BEHAVIORS } from '../data/safety';
import { pick, useLang } from '../i18n/i18n';
import { loadSafety, SafetyItem } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, TopBackBar } from './ui';

type L = { pt: string; en: string };

const DOS: L[] = [
  { pt: 'Encorajar com calma a ficar com o desconforto ("tu aguentas, vai passar").', en: 'Gently encourage staying with the discomfort ("you can handle this, it will pass").' },
  { pt: 'Lembrar que não precisa de ter a certeza para estar bem.', en: 'Remind them they do not need certainty to be okay.' },
  { pt: 'Celebrar os pequenos passos, por mais pequenos que pareçam.', en: 'Celebrate small steps, however small they seem.' },
  { pt: 'Seguir o ritmo dela e combinar as mudanças em conjunto.', en: 'Follow their pace and agree on changes together.' },
  { pt: 'Manter a tua própria calma — a tua serenidade ajuda.', en: 'Keep your own calm — your steadiness helps.' },
];

const DONTS: L[] = [
  { pt: 'Responder "sim, estás bem" quando ela pergunta (é tranquilização).', en: 'Answer "yes, you\'re fine" when asked (that is reassurance).' },
  { pt: 'Verificar validades, cheirar a comida ou confirmar sintomas por ela.', en: 'Check expiry dates, smell food, or confirm symptoms for them.' },
  { pt: 'Deixá-la sair a correr de um sítio ou assumir as tarefas que a assustam.', en: 'Let them flee a place, or take over the tasks that scare them.' },
  { pt: 'Forçar, envergonhar ou apressar — isso piora.', en: 'Force, shame or rush them — that makes it worse.' },
  { pt: 'Evitar o tema ou esconder informação "para a proteger".', en: 'Avoid the topic or hide information "to protect them".' },
];

const SCRIPT: L[] = [
  { pt: '"Quando eu perguntar se estou bem, por favor não respondas — lembra-me só que não preciso de ter a certeza."', en: '"When I ask if I\'m okay, please don\'t answer — just remind me I don\'t need to be certain."' },
  { pt: '"Não confirmes validades nem cheires a comida por mim."', en: '"Don\'t check expiry dates or smell food for me."' },
  { pt: '"Se eu quiser sair a correr, encoraja-me a ficar mais um bocadinho."', en: '"If I want to rush out, encourage me to stay a little longer."' },
];

const MOMENT: L[] = [
  { pt: 'Fica calmo e presente; não entres em pânico com ela.', en: 'Stay calm and present; do not panic with them.' },
  { pt: 'Respira devagar ao lado dela, como âncora.', en: 'Breathe slowly beside them, as an anchor.' },
  { pt: 'Lembra: "isto é ansiedade, é desconfortável mas não é perigoso, vai passar".', en: 'Remind: "this is anxiety, uncomfortable but not dangerous, it will pass".' },
  { pt: 'Não corras a "resolver" — deixa a onda subir e descer.', en: 'Do not rush to "fix" it — let the wave rise and fall.' },
];

function Bullets({ items, color }: { items: L[]; color: string }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  return (
    <View style={{ gap: 8 }}>
      {items.map((it, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
          <Text style={{ color }} importantForAccessibility="no" accessibilityElementsHidden>•</Text>
          <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20, flex: 1 }}>{pick(it, lang)}</Text>
        </View>
      ))}
    </View>
  );
}

export default function CompanionScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const tt = (o: L) => pick(o, lang);

  const [dropping, setDropping] = useState<string[]>([]);

  useEffect(() => {
    loadSafety().then((stored: SafetyItem[]) => {
      const labels = stored
        .filter((s) => s.dropping)
        .map((s) => pick(SAFETY_BEHAVIORS.find((b) => b.id === s.id)?.label, lang) || s.label);
      setDropping(labels);
    });
  }, [lang]);

  function buildText(): string {
    const lines: string[] = [];
    lines.push(tt({ pt: 'COMO ME PODES AJUDAR (emetofobia)', en: 'HOW YOU CAN HELP ME (emetophobia)' }));
    lines.push('');
    lines.push(tt({ pt: 'A emetofobia é o medo de vomitar. Ajudar-me a sério é não alimentar o medo — a tranquilização e os "favores" aliviam no momento mas reforçam a fobia.', en: 'Emetophobia is the fear of vomiting. Really helping me means not feeding the fear — reassurance and "favours" soothe in the moment but reinforce the phobia.' }));
    lines.push('');
    lines.push(tt({ pt: 'FAZER:', en: 'DO:' }));
    DOS.forEach((d) => lines.push('• ' + tt(d)));
    lines.push('');
    lines.push(tt({ pt: 'NÃO FAZER:', en: "DON'T:" }));
    DONTS.forEach((d) => lines.push('• ' + tt(d)));
    lines.push('');
    lines.push(tt({ pt: 'NUM MOMENTO DIFÍCIL:', en: 'IN A HARD MOMENT:' }));
    MOMENT.forEach((d) => lines.push('• ' + tt(d)));
    if (dropping.length) {
      lines.push('');
      lines.push(tt({ pt: 'O QUE ESTOU A TENTAR LARGAR (por favor não ajudes a fazer):', en: "WHAT I'M TRYING TO DROP (please don't help me do these):" }));
      dropping.forEach((d) => lines.push('• ' + d));
    }
    return lines.join('\n');
  }

  function share() {
    Share.share({ message: buildText() }).catch(() => {});
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={tt({ pt: 'Modo acompanhante', en: 'Companion mode' })} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingBottom: 40 }}>
        <Card style={{ gap: 6, backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }}>
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>{tt({ pt: 'Para quem me acompanha', en: 'For the person supporting me' })}</Text>
          <Text style={{ color: colors.text, fontSize: 14, lineHeight: 21 }}>
            {tt({
              pt: 'A emetofobia é o medo de vomitar. Ajudar-me a sério é não alimentar o medo: a tranquilização e os "favores" aliviam no momento, mas reforçam a fobia a longo prazo.',
              en: 'Emetophobia is the fear of vomiting. Really helping me means not feeding the fear: reassurance and "favours" soothe in the moment but reinforce the phobia long-term.',
            })}
          </Text>
        </Card>

        <Card style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={{ color: colors.text, fontWeight: '700' }}>{tt({ pt: 'Fazer', en: 'Do' })}</Text>
          </View>
          <Bullets items={DOS} color={colors.success} />
        </Card>

        <Card style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="close-circle" size={18} color={colors.danger} />
            <Text style={{ color: colors.text, fontWeight: '700' }}>{tt({ pt: 'Não fazer', en: "Don't" })}</Text>
          </View>
          <Bullets items={DONTS} color={colors.danger} />
        </Card>

        <Card style={{ gap: 10 }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{tt({ pt: 'Guião rápido', en: 'Quick script' })}</Text>
          {SCRIPT.map((s, i) => (
            <View key={i} style={{ backgroundColor: colors.cardAlt, borderRadius: radius.md, padding: 10 }}>
              <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20, fontStyle: 'italic' }}>{tt(s)}</Text>
            </View>
          ))}
        </Card>

        <Card style={{ gap: 10 }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{tt({ pt: 'Num momento difícil', en: 'In a hard moment' })}</Text>
          <Bullets items={MOMENT} color={colors.primary} />
        </Card>

        {/* Personalizado: o que a pessoa está a largar */}
        {dropping.length > 0 && (
          <Card style={{ gap: 10 }}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>{tt({ pt: 'O que estou a tentar largar', en: "What I'm trying to drop" })}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>{tt({ pt: 'Por favor, não me ajudes a fazer isto:', en: "Please don't help me do these:" })}</Text>
            <View style={{ gap: 8 }}>
              {dropping.map((d, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
                  <Ionicons name="hand-left-outline" size={16} color={colors.primary} style={{ marginTop: 2 }} />
                  <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20, flex: 1 }}>{d}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        <Pressable onPress={share} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15, borderRadius: radius.md, backgroundColor: colors.primary, marginTop: 4 }}>
          <Ionicons name="share-outline" size={20} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>{tt({ pt: 'Partilhar', en: 'Share' })}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
