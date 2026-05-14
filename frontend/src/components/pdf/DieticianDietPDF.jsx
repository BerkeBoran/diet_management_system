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
  eyebrow: { fontSize: 8, letterSpacing: 2, color: '#1D4ED8', textTransform: 'uppercase', marginBottom: 6 },
  title: { fontSize: 26, color: '#1A2E1A', marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#888', marginBottom: 2 },
  meta: { fontSize: 9, color: '#999', marginTop: 4 },
  weekHeader: { backgroundColor: '#1D2E5A', padding: '8 12', borderRadius: 6, marginBottom: 12, marginTop: 16 },
  weekLabel: { fontSize: 11, color: '#EFF6FF', fontFamily: 'Roboto', fontWeight: 700 },
  daySection: { marginBottom: 14 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#EFF6FF', padding: '7 12', borderRadius: 6, marginBottom: 6 },
  dayLabel: { fontSize: 11, color: '#1D4ED8', fontFamily: 'Roboto', fontWeight: 700 },
  dayMeta: { fontSize: 9, color: '#3B82F6' },
  mealRow: { flexDirection: 'row', marginBottom: 5, backgroundColor: '#fff', borderRadius: 6, borderWidth: 1, borderColor: '#E5E2D9', padding: '9 12' },
  mealLeft: { width: 90 },
  mealType: { fontSize: 8, color: '#1D4ED8', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'Roboto', fontWeight: 700, marginBottom: 3 },
  mealTime: { fontSize: 9, color: '#999' },
  mealKcal: { fontSize: 9, color: '#888', marginTop: 3 },
  mealRight: { flex: 1 },
  itemRow: { flexDirection: 'row', gap: 0, marginBottom: 2 },
  itemDot: { width: 14, fontSize: 9, color: '#5A7A3A' },
  itemName: { flex: 1, fontSize: 10, color: '#3A3A2E' },
  itemAmount: { fontSize: 9, color: '#999', fontFamily: 'Roboto' },
  noItems: { fontSize: 10, color: '#999', fontStyle: 'italic' },
  footer: { position: 'absolute', bottom: 28, left: 44, right: 44, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: '#CCC' },
});

const DAY_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const DAY_LABELS = { Monday:'Pazartesi',Tuesday:'Salı',Wednesday:'Çarşamba',Thursday:'Perşembe',Friday:'Cuma',Saturday:'Cumartesi',Sunday:'Pazar' };
const MEAL_TIMES = { 'Kahvaltı':'08:00','Ara Öğün':'10:30','Öğle':'13:00','Öğle Yemeği':'13:00','İkindi':'16:30','Akşam':'19:30','Akşam Yemeği':'19:30' };

function buildWeekDays(dailyPlan, weekStartDate) {
  const byKey = {};
  (dailyPlan || []).forEach(d => { byKey[d.day] = d; });
  return DAY_ORDER.map((key, i) => {
    const bd = byKey[key];
    let dateLabel = '';
    if (weekStartDate) {
      const d = new Date(weekStartDate);
      d.setDate(d.getDate() + i);
      dateLabel = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    }
    const meals = (bd?.meals || []).map(m => ({
      type: m.meal_type,
      time: MEAL_TIMES[m.meal_type] || '',
      kcal: m.calories || 0,
      items: (m.items || []).map(it => ({ name: it.food_name, amount: it.amount, unit: it.unit })),
    }));
    return { label: DAY_LABELS[key] || key, date: dateLabel, kcal: meals.reduce((s, m) => s + m.kcal, 0), meals, hasPlan: !!bd };
  });
}

export default function DieticianDietPDF({ plan, planMeta }) {
  const weeks = plan?.weekly_plan || [];
  const target = plan?.daily_calories || 2000;
  const totalDays = weeks.length * 7;

  return (
    <Document title="Diyetisyen Diyet Planı">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Diyetisyen Diyet Planı</Text>
          <Text style={styles.title}>Diyet planım.</Text>
          <Text style={styles.subtitle}>{target.toLocaleString('tr-TR')} kcal/gün · {totalDays} günlük plan</Text>
          {planMeta && <Text style={styles.meta}>Tarih: {planMeta.start_date} → {planMeta.end_date}</Text>}
        </View>

        {weeks.map((week, wi) => {
          const days = buildWeekDays(week.daily_plan, week.start_date);
          return (
            <View key={wi}>
              <View style={styles.weekHeader}>
                <Text style={styles.weekLabel}>Hafta {wi + 1}</Text>
              </View>
              {days.map((day, di) => (
                <View key={di} style={styles.daySection} wrap={false}>
                  <View style={styles.dayHeader}>
                    <View>
                      <Text style={styles.dayLabel}>{day.label}</Text>
                      {day.date ? <Text style={styles.dayMeta}>{day.date}</Text> : null}
                    </View>
                    {day.kcal > 0 && <Text style={styles.dayMeta}>{day.kcal} kcal</Text>}
                  </View>
                  {!day.hasPlan ? (
                    <Text style={styles.noItems}>Bu gün için plan eklenmemiş.</Text>
                  ) : (
                    day.meals.map((m, mi) => (
                      <View key={mi} style={styles.mealRow}>
                        <View style={styles.mealLeft}>
                          <Text style={styles.mealType}>{m.type}</Text>
                          {m.time ? <Text style={styles.mealTime}>{m.time}</Text> : null}
                          {m.kcal > 0 && <Text style={styles.mealKcal}>{m.kcal} kcal</Text>}
                        </View>
                        <View style={styles.mealRight}>
                          {m.items.length === 0 ? (
                            <Text style={styles.noItems}>—</Text>
                          ) : (
                            m.items.map((it, ii) => (
                              <View key={ii} style={styles.itemRow}>
                                <Text style={styles.itemDot}>·</Text>
                                <Text style={styles.itemName}>{it.name}</Text>
                                <Text style={styles.itemAmount}>{it.amount}{it.unit}</Text>
                              </View>
                            ))
                          )}
                        </View>
                      </View>
                    ))
                  )}
                </View>
              ))}
            </View>
          );
        })}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Diyetisyen Diyet Planı</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
