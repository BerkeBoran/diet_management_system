import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/Roboto-Bold.ttf',    fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: { padding: '36 44', fontFamily: 'Roboto', backgroundColor: '#FBFAF5' },
  header: { marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E5E2D9' },
  eyebrow: { fontSize: 8, letterSpacing: 2, color: '#5A7A3A', textTransform: 'uppercase', marginBottom: 6 },
  title: { fontSize: 26, color: '#1A2E1A', marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#888', marginBottom: 2 },
  meta: { fontSize: 9, color: '#999', marginTop: 4 },
  daySection: { marginBottom: 18 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2D5A27', padding: '8 12', borderRadius: 6, marginBottom: 8 },
  dayLabel: { fontSize: 12, color: '#FBFAF5', fontFamily: 'Roboto', fontWeight: 700 },
  dayKcal: { fontSize: 9, color: '#C4D9A0', fontFamily: 'Helvetica' },
  mealRow: { flexDirection: 'row', gap: 0, marginBottom: 6, backgroundColor: '#fff', borderRadius: 6, borderWidth: 1, borderColor: '#E5E2D9', padding: '10 12' },
  mealLeft: { width: 80 },
  mealType: { fontSize: 8, color: '#5A7A3A', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'Roboto', fontWeight: 700, marginBottom: 3 },
  mealTime: { fontSize: 9, color: '#999' },
  mealKcal: { fontSize: 9, color: '#888', marginTop: 3 },
  mealRight: { flex: 1 },
  mealContents: { fontSize: 10, color: '#3A3A2E', lineHeight: 1.5 },
  footer: { position: 'absolute', bottom: 28, left: 44, right: 44, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: '#CCC' },
});

function buildAIDays(meals) {
  const DAY_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const TR_TO_EN = { 'Pazartesi':'Monday','Salı':'Tuesday','Çarşamba':'Wednesday','Perşembe':'Thursday','Cuma':'Friday','Cumartesi':'Saturday','Pazar':'Sunday' };
  const DAY_LABELS = { Monday:'Pazartesi',Tuesday:'Salı',Wednesday:'Çarşamba',Thursday:'Perşembe',Friday:'Cuma',Saturday:'Cumartesi',Sunday:'Pazar' };
  const byDay = {};
  (meals || []).forEach(m => {
    const key = TR_TO_EN[m.day] || m.day;
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(m);
  });
  return DAY_ORDER.filter(d => byDay[d]).map(key => ({
    label: DAY_LABELS[key],
    kcal: (byDay[key] || []).reduce((s, m) => s + (m.calories || 0), 0),
    meals: (byDay[key] || []).map(m => ({ type: m.meal_type, kcal: m.calories || 0, contents: m.contents || '' })),
  }));
}

export default function AiDietPDF({ plan, planTitle }) {
  const days = buildAIDays(plan?.meals || []);
  const avgKcal = days.length > 0 ? Math.round(days.reduce((s, d) => s + d.kcal, 0) / days.length) : 0;
  const createdAt = plan?.created_at ? new Date(plan.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  return (
    <Document title={planTitle || 'AI Diyet Planı'}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Yapay Zeka Diyet Planı</Text>
          <Text style={styles.title}>{planTitle || plan?.summary || 'AI Diyet Planı'}</Text>
          <Text style={styles.subtitle}>{avgKcal > 0 ? `Ortalama ${avgKcal} kcal/gün` : ''} · {days.length} günlük plan</Text>
          {createdAt ? <Text style={styles.meta}>Oluşturulma tarihi: {createdAt}</Text> : null}
        </View>

        {days.map((day, i) => (
          <View key={i} style={styles.daySection} wrap={false}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayLabel}>{day.label}</Text>
              {day.kcal > 0 && <Text style={styles.dayKcal}>{day.kcal} kcal</Text>}
            </View>
            {day.meals.map((m, j) => (
              <View key={j} style={styles.mealRow}>
                <View style={styles.mealLeft}>
                  <Text style={styles.mealType}>{m.type}</Text>
                  {m.kcal > 0 && <Text style={styles.mealKcal}>{m.kcal} kcal</Text>}
                </View>
                <View style={styles.mealRight}>
                  <Text style={styles.mealContents}>{m.contents}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{planTitle || 'AI Diyet Planı'}</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
