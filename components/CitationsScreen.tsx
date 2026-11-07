// Citações / fontes: as fontes fidedignas usadas no conteúdo da app.
// Cada cartão abre o link no navegador.

import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { pick, useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { TopBackBar } from './ui';

type L = { pt: string; en: string };
type Source = { title: string; publisher: string; desc: L; url: string };

export const SOURCES: Source[] = [
  {
    title: 'David Veale — Treating a specific phobia of vomiting (SPOV): protocolo de CBT',
    publisher: 'The Cognitive Behaviour Therapist (2009)',
    desc: { pt: 'Protocolo de terapia cognitivo-comportamental para a fobia de vomitar.', en: 'Cognitive-behavioural therapy protocol for the fear of vomiting.' },
    url: 'https://www.veale.co.uk/wp-content/uploads/2010/10/71-Treating-SPOV-tCBT.pdf',
  },
  {
    title: "A clinician's quick guide to evidence-based approaches: emetophobia",
    publisher: 'Clinical Psychologist (2023)',
    desc: { pt: 'Guia clínico de abordagens com evidência para a emetofobia.', en: 'Clinician guide to evidence-based approaches for emetophobia.' },
    url: 'https://doi.org/10.1080/13284207.2023.2295276',
  },
  {
    title: 'Understanding Emetophobia & Breaking the Cycle: A CBT & ERP Guide',
    publisher: 'Home-Based Talking Therapy',
    desc: { pt: 'Guia de auto-ajuda CBT/ERP: ciclo de manutenção e exposição.', en: 'CBT/ERP self-help guide: maintenance cycle and exposure.' },
    url: 'https://homebasedtalkingtherapy.com/self-help-guide-emetophobia/',
  },
  {
    title: 'Moving Through Emetophobia: Rewiring Your Brain',
    publisher: 'Anxiety & Depression Association of America (ADAA)',
    desc: { pt: 'Como a recuperação retreina (molda) o cérebro.', en: 'How recovery retrains (reshapes) the brain.' },
    url: 'https://adaa.org/learn-from-us/from-the-experts/blog-posts/consumer/moving-through-emetophobia',
  },
  {
    title: 'Common Missteps When Starting ERP for Emetophobia',
    publisher: 'Center for Anxiety & Behavior Therapy',
    desc: { pt: 'A ansiedade faz parte da ERP; erros comuns a evitar.', en: 'Anxiety is part of ERP; common mistakes to avoid.' },
    url: 'https://www.centerabt.com/new-blog/2025/1/2/common-missteps-when-starting-erp-for-emetophobia',
  },
  {
    title: 'The Inhibitory-Learning Approach to Exposure and Response Prevention',
    publisher: 'International OCD Foundation (IOCDF)',
    desc: { pt: 'Como a exposição funciona (aprendizagem inibitória).', en: 'How exposure works (inhibitory learning).' },
    url: 'https://iocdf.org/expert-opinions/the-inhibitory-learning-approach-to-exposure-and-response-prevention/',
  },
  {
    title: 'Norovirus',
    publisher: 'NHS (UK)',
    desc: { pt: 'Factos sobre o norovírus: sintomas, duração, recuperação.', en: 'Facts about norovirus: symptoms, duration, recovery.' },
    url: 'https://www.nhs.uk/conditions/norovirus/',
  },
  {
    title: 'Cyclic Vomiting Syndrome',
    publisher: 'Cleveland Clinic',
    desc: { pt: 'Os sinais que costumam preceder o vómito (prodromo).', en: 'The signs that usually precede vomiting (the prodrome).' },
    url: 'https://my.clevelandclinic.org/health/diseases/14894-cyclic-vomiting-syndrome',
  },
  {
    title: 'Globus pharyngeus: feeling like something is stuck in the throat',
    publisher: 'Medical News Today',
    desc: { pt: 'O "nó" na garganta (globus): comum e inofensivo.', en: 'The "lump" in the throat (globus): common and harmless.' },
    url: 'https://www.medicalnewstoday.com/articles/318633',
  },
  {
    title: 'Anxiety Shaking: Why It Happens and How to Stop It',
    publisher: 'PsychCentral',
    desc: { pt: 'Porque trememos com ansiedade (adrenalina) e o que ajuda.', en: 'Why anxiety makes us shake (adrenaline) and what helps.' },
    url: 'https://psychcentral.com/anxiety/anxiety-shaking',
  },
  {
    title: 'Emetophobia',
    publisher: 'Wikipedia',
    desc: { pt: 'Visão geral: origens, sintomas e tratamento.', en: 'Overview: origins, symptoms and treatment.' },
    url: 'https://en.wikipedia.org/wiki/Emetophobia',
  },
];

export default function CitationsScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();

  const open = (url: string) => Linking.openURL(url).catch(() => {});

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('resources.citations')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingBottom: 40 }}>
        <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>
          {lang === 'pt'
            ? 'O conteúdo desta app baseia-se em fontes clínicas fidedignas. Toca numa fonte para a abrir. Isto é apoio psicoeducativo e não substitui um profissional de saúde.'
            : 'This app\'s content is based on reliable clinical sources. Tap a source to open it. This is psychoeducational support and does not replace a health professional.'}
        </Text>

        {SOURCES.map((s, i) => (
          <Pressable
            key={i}
            onPress={() => open(s.url)}
            style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: 4 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', flex: 1, lineHeight: 20 }}>{s.title}</Text>
              <Ionicons name="open-outline" size={18} color={colors.primary} style={{ marginTop: 2 }} />
            </View>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>{s.publisher}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18 }}>{pick(s.desc, lang)}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
