import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Importando Ionicons
import { COLORS, SHADOWS } from './src/styles/theme';

// Componente para os itens do Menu Lateral
const NavItem = ({ icon, label, active, badge }) => (
  <TouchableOpacity style={[styles.navItem, active && styles.navItemActive]}>
    <Ionicons name={icon} size={18} color={active ? COLORS.white : 'rgba(255,255,255,0.6)'} style={styles.navIcon} />
    <Text style={[styles.navText, active && styles.navTextActive]}>{label}</Text>
    {badge && (
      <View style={styles.navBadge}>
        <Text style={styles.navBadgeText}>{badge}</Text>
      </View>
    )}
  </TouchableOpacity>
);

// Componente para os Cards de Estatística (convertido do HTML)
const StatCard = ({ label, value, icon, iconBg, sub, subColor }) => (
  <View style={[styles.statCard, SHADOWS.sm]}>
    <View style={styles.statHeader}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={[styles.statIconContainer, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={COLORS.teal} />
      </View>
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statSub}>
      <Text style={{ color: subColor, fontWeight: '600' }}>{sub.split(' ')[0]}</Text> {sub.split(' ').slice(1).join(' ')}
    </Text>
  </View>
);

export default function App() {
  const [activeView, setActiveView] = useState('Dashboard');

  return (
    <View style={styles.app}>
      
      {/* ===== SIDEBAR (Menu Lateral) ===== */}
      <View style={styles.sidebar}>
        <View style={styles.sidebarLogo}>
          <View style={styles.logoIcon}><Text style={{fontSize: 20}}>🏥</Text></View>
          <Text style={styles.logoText}>Med<Text style={{color: COLORS.tealLight}}>Agenda</Text></Text>
        </View>

        <ScrollView style={styles.sidebarNav}>
          <Text style={styles.navLabel}>Principal</Text>
          <NavItem icon="bar-chart-outline" label="Dashboard" active={activeView === 'Dashboard'} />
          <NavItem icon="calendar-outline" label="Agenda" badge="3" />
          <NavItem icon="people-outline" label="Pacientes" />
          <NavItem icon="pulse-outline" label="Médicos" />

          <Text style={styles.navLabel}>Clínica</Text>
          <NavItem icon="cash-outline" label="Financeiro" />
          <NavItem icon="document-text-outline" label="Prontuários" />
        </ScrollView>

        {/* Informações do Usuário */}
        <View style={styles.sidebarUser}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>DR</Text>
          </View>
          <View>
            <Text style={styles.userName}>Dr. Roberto Silva</Text>
            <Text style={styles.userRole}>Clínico Geral</Text>
          </View>
        </View>
      </View>

      {/* ===== MAIN CONTENT (Área Principal) ===== */}
      <View style={styles.main}>
        
        {/* TOPBAR */}
        <View style={[styles.topbar, SHADOWS.sm]}>
          <Text style={styles.topbarTitle}>{activeView}</Text>
          
          {/* Busca (Ícone de lupa Ionicons) */}
          <View style={styles.topbarSearch}>
            <Ionicons name="search-outline" size={16} color={COLORS.muted} />
            <TextInput placeholder="Buscar paciente, consulta..." style={styles.searchInput} placeholderTextColor={COLORS.muted} />
          </View>

          {/* Botões da Topbar */}
          <TouchableOpacity style={styles.topbarIconBtn}>
            <Ionicons name="notifications-outline" size={18} color={COLORS.text} />
            <View style={styles.notifDot} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.topbarBtn}>
            <Ionicons name="add-outline" size={18} color={COLORS.white} />
            <Text style={styles.topbarBtnText}>Nova Consulta</Text>
          </TouchableOpacity>
        </View>

        {/* CONTEÚDO DO DASHBOARD */}
        <ScrollView style={styles.content}>
          
          {/* Quick Stats Chips */}
          <View style={styles.quickRow}>
            <View style={styles.quickChip}>
              <View style={[styles.dot, {backgroundColor: COLORS.green}]} />
              <Text style={styles.quickChipText}>5 confirmadas hoje</Text>
            </View>
            <View style={styles.quickChip}>
              <View style={[styles.dot, {backgroundColor: COLORS.orange}]} />
              <Text style={styles.quickChipText}>2 aguardando</Text>
            </View>
            <View style={styles.quickChip}>
              <View style={[styles.dot, {backgroundColor: COLORS.red}]} />
              <Text style={styles.quickChipText}>1 cancelada</Text>
            </View>
            <View style={styles.quickChip}>
              <View style={[styles.dot, {backgroundColor: COLORS.purple}]} />
              <Text style={styles.quickChipText}>1 em atendimento</Text>
            </View>
          </View>

          {/* Grid de Estatísticas */}
          <View style={styles.statsGrid}>
            <StatCard 
              label="Consultas Hoje" 
              value="12" 
              icon="calendar-outline" 
              iconBg="rgba(10,126,164,0.1)" 
              sub="↑ 8% vs semana passada" 
              subColor={COLORS.green} 
            />
            
            <StatCard 
              label="Pacientes Ativos" 
              value="847" 
              icon="people-outline" 
              iconBg="rgba(16,185,129,0.1)" 
              sub="↑ 23 este mês" 
              subColor={COLORS.green} 
            />
            
            <StatCard 
              label="Faturamento Mês" 
              value="R$ 24.8k" 
              icon="cash-outline" 
              iconBg="rgba(245,158,11,0.1)" 
              sub="↑ 12% vs mês anterior" 
              subColor={COLORS.green} 
            />

            <StatCard 
              label="Taxa de Retorno" 
              value="73%" 
              icon="refresh-outline" 
              iconBg="rgba(124,58,237,0.1)" 
              sub="↓ 2% vs mês anterior" 
              subColor={COLORS.red} 
            />
          </View>

          {/* Layout em Colunas (Grid 3:1) */}
          <View style={styles.gridContainer}>
            
            {/* COLUNA DA ESQUERDA (Principal) */}
            <View style={styles.leftColumn}>
              
              {/* Card: Consultas de Hoje */}
              <View style={[styles.card, SHADOWS.sm, { marginBottom: 20 }]}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cardTitle}>Consultas de Hoje</Text>
                    <Text style={styles.cardSub}>Quarta, 25 de março de 2026</Text>
                  </View>
                  <TouchableOpacity onPress={() => setActiveView('Agenda')}>
                    <Text style={styles.cardAction}>Ver agenda completa</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.cardBody}>
                  <AppointmentItem time="09:00" patient="Ana Costa" type="Consulta de Rotina" statusColor={COLORS.green} />
                  <AppointmentItem time="10:30" patient="Carlos Lima" type="Retorno" statusColor={COLORS.orange} />
                  <AppointmentItem time="14:00" patient="Beatriz Soares" type="Avaliação" statusColor={COLORS.purple} isLast={true} />
                </View>
              </View>

              {/* Card: Receita Semanal */}
              <View style={[styles.card, SHADOWS.sm]}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cardTitle}>Receita Semanal</Text>
                    <Text style={styles.cardSub}>Últimas 7 semanas (R$)</Text>
                  </View>
                  <TouchableOpacity><Text style={styles.cardAction}>Ver detalhes</Text></TouchableOpacity>
                </View>
                <View style={[styles.cardBody, { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 20, paddingHorizontal: 30 }]}>
                  <ChartBar height="40%" label="S1" />
                  <ChartBar height="65%" label="S2" />
                  <ChartBar height="50%" label="S3" />
                  <ChartBar height="85%" label="S4" active={true} />
                  <ChartBar height="60%" label="S5" />
                  <ChartBar height="90%" label="S6" />
                  <ChartBar height="75%" label="S7" />
                </View>
              </View>
            </View>

            {/* COLUNA DA DIREITA (Lateral) */}
            <View style={styles.rightColumn}>
              
              {/* Card: Mini Calendário */}
              <View style={[styles.card, SHADOWS.sm, { marginBottom: 16 }]}>
                <View style={styles.miniCalHeader}>
                  <TouchableOpacity><Ionicons name="chevron-back" size={16} color={COLORS.navy} /></TouchableOpacity>
                  <Text style={styles.calMonthText}>Março 2026</Text>
                  <TouchableOpacity><Ionicons name="chevron-forward" size={16} color={COLORS.navy} /></TouchableOpacity>
                </View>
                <View style={[styles.cardBody, { padding: 15 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                    {['D','S','T','Q','Q','S','S'].map(d => <Text key={d} style={styles.calDayHead}>{d}</Text>)}
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {Array.from({length: 31}, (_, i) => (
                      <View key={i} style={[styles.calDayNum, i+1 === 25 && styles.calDayActive]}>
                        <Text style={[styles.calDayText, i+1 === 25 && {color: COLORS.white}]}>{i+1}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* Card: Próximas Consultas */}
              <View style={[styles.card, SHADOWS.sm]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Próximas Consultas</Text>
                </View>
                <View style={styles.cardBody}>
                  <AppointmentItem time="26/03" patient="João Mendes" type="Exame" statusColor={COLORS.teal} />
                  <AppointmentItem time="27/03" patient="Paula Souza" type="Consulta" statusColor={COLORS.teal} isLast={true} />
                </View>
              </View>
              
            </View>
          </View>

        </ScrollView>
      </View>
    </View>
  );
}

// ===== ESTILOS (Recriando o CSS do HTML) =====
const styles = StyleSheet.create({
  app: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.mist, minHeight: '100vh' },
  
  // Sidebar
  sidebar: { width: 240, backgroundColor: COLORS.navy, display: 'flex', flexDirection: 'column' },
  sidebarLogo: { padding: 24, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  logoIcon: { width: 36, height: 36, backgroundColor: COLORS.teal, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontFamily: 'DM Serif Display, serif', fontSize: 18, color: COLORS.white, marginLeft: 10 },
  
  sidebarNav: { flex: 1, padding: 16 },
  navLabel: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1.2, paddingVertical: 10 },
  navItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, marginBottom: 2 },
  navItemActive: { backgroundColor: COLORS.teal },
  navIcon: { marginRight: 10 },
  navText: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
  navTextActive: { color: COLORS.white },
  navBadge: { marginLeft: 'auto', backgroundColor: COLORS.red, paddingHorizontal: 6, borderRadius: 20 },
  navBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  
  sidebarUser: { padding: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)', flexDirection: 'row', alignItems: 'center' },
  userAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.teal, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  userAvatarText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
  userName: { fontSize: 12, fontWeight: '600', color: COLORS.white },
  userRole: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },

  // Main & Topbar
  main: { flex: 1, flexDirection: 'column' },
  topbar: { height: 64, backgroundColor: COLORS.white, paddingHorizontal: 28, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border, zIndex: 50 },
  topbarTitle: { fontSize: 18, fontWeight: '700', color: COLORS.navy, flex: 1 },
  topbarSearch: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.mist, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, width: 240, marginRight: 16 },
  searchInput: { flex: 1, fontSize: 13, color: COLORS.text, marginLeft: 8, outlineStyle: 'none' },
  topbarIconBtn: { width: 36, height: 36, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 16, position: 'relative' },
  notifDot: { position: 'absolute', top: 6, right: 6, width: 7, height: 7, backgroundColor: COLORS.red, borderRadius: 3.5, borderWidth: 1.5, borderColor: COLORS.white },
  topbarBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.teal, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 8 },
  topbarBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '600', marginLeft: 6 },

  // Content & Grid
  content: { flex: 1, padding: 28 },
  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  quickChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  quickChipText: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 7 },
  
  statsGrid: { 
    flexDirection: 'row', 
    gap: 16, 
    marginBottom: 24,
    flexWrap: 'wrap', // Permite que os cards quebrem linha se não houver espaço
  },
  statCard: { 
    flex: 1, 
    minWidth: 200, // Garante um tamanho legível para cada card
    backgroundColor: COLORS.white, 
    borderRadius: 12, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: COLORS.border 
},
  statHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  statLabel: { fontSize: 12, color: COLORS.muted, fontWeight: '500' },
  statIconContainer: { width: 36, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 28, fontWeight: '700', color: COLORS.navy, letterSpacing: -1, marginBottom: 4 },
  statSub: { fontSize: 12, color: COLORS.muted },

  // Cards genéricos
  card: { backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  cardHeader: { padding: 18, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.navy },
  cardAction: { fontSize: 12, color: COLORS.teal, fontWeight: '600' },
  cardBody: { padding: 18 },

  // Mini Calendário

  gridContainer: { 
    flexDirection: 'row', 
    gap: 20, 
    flexWrap: 'wrap' // Permite que a coluna lateral desça no mobile
  },
  leftColumn: { 
    flex: 3, // Ocupa 3 partes do espaço (Equivalente ao grid 3-1)
    minWidth: 350 
  },
  rightColumn: { 
    flex: 1, // Ocupa 1 parte do espaço
    minWidth: 280 
  },
  cardSub: { 
    fontSize: 12, 
    color: COLORS.muted, 
    marginTop: 2 
  },
  placeholderText: { 
    color: COLORS.muted, 
    textAlign: 'center', 
    padding: 20, 
    fontSize: 13 
  },
  chartPlaceholder: { 
    height: 150, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: COLORS.mist, 
    borderStyle: 'dashed', 
    borderRadius: 8 
  },
  miniCalHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.border 
  },
  calMonthText: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: COLORS.navy 
  },
});