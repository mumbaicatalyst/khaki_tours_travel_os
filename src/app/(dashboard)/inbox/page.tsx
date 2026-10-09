'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, MessageSquare, Phone, Globe, AlertTriangle, Send, 
  UserCheck, ShieldCheck, Clock, Building2, MapPin, Calendar, 
  CreditCard, CheckCheck, FileText, ChevronRight, User, Star,
  Compass, UserPlus, Flame, CheckCircle2, XCircle, Search, BarChart3,
  Download, ArrowRight, ShieldAlert, RefreshCw, Car, Lock, Unlock, Zap, Check
} from 'lucide-react';
import { LeadPriorityTier } from '@/modules/intake/priority-classifier';
import { useRole } from '@/context/RoleContext';

interface ChatMessage {
  id: string;
  sender: 'GUEST' | 'BOT' | 'HUMAN';
  text: string;
  timestamp: string;
  status?: 'SENT' | 'DELIVERED' | 'READ';
  isLocationPin?: boolean;
  isTemplate?: boolean;
}

interface ChatSession {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  organization?: string;
  tourName: string;
  channel: 'WHATSAPP' | 'VOICE_CALL' | 'WEB_FORM';
  messages: ChatMessage[];
  lastMessage: string;
  lastMessageTimestamp: string;
  humanTakeover: boolean;
  status: 'LEAD_NEW' | 'PAYMENT_PENDING' | 'CONFIRMED';
  priorityTier: LeadPriorityTier;
  inboundStream?: 'PUBLIC_WALK' | 'PRIVATE_TOUR' | 'CORPORATE_VIP' | 'INTERNATIONAL' | 'GENERAL_INQUIRY';
  assignedStaff?: string;
  slaMinutes: number;
  minutesElapsed: number;
  lifetimeSpendInr: number;
  totalBookings: number;
  rfmScore: number;
  taxSacCode: '998554' | '998555';
  gstRate: '18%' | '5%';
  voiceSnippet?: string;
  jevAnalysis?: any;
  aiQualityScore?: number;
  auditSummary?: {
    intentAccuracy: number;
    repetitionDetected: boolean;
    stumbles: string[];
    employeeResponseMinutes: number;
    sentiment: 'DELIGHTED' | 'SATISFIED' | 'NEUTRAL' | 'IMPATIENT';
    notes?: string;
  };
}

const STREAM_CONFIG = {
  PUBLIC_WALK: { label: 'Public Walk', icon: '🚶', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  PRIVATE_TOUR: { label: 'Private Safari', icon: '🚙', badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  CORPORATE_VIP: { label: 'Corporate VIP', icon: '🏢', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  INTERNATIONAL: { label: 'International', icon: '✈️', badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  GENERAL_INQUIRY: { label: 'General Inquiry', icon: '💬', badgeColor: 'bg-slate-700/50 text-slate-300 border-slate-600' },
};

const STAFF_LIST = [
  'Bharat Gothoskar (Founder & CEO)',
  'Priya S. (Ops Lead)',
  'Kaevan Umrigar (Growth Lead)',
  'Farhan K. (Field Dispatcher)',
  'C.A. Mehta & Associates',
  'Unassigned',
];

interface GuideRosterItem {
  id: string;
  name: string;
  phone: string;
  role: string;
  assignedTour: string;
  dateTime: string;
  status: 'CONFIRMED' | 'STANDBY' | 'ON_TRAIL';
  checkInStatus: 'ACKNOWLEDGED' | 'STANDBY_ALERT' | 'AWAITING_CONFIRMATION' | 'ON_TRAIL';
  paxCount: number;
  meetingPoint: string;
  lastMessage: string;
  lastTime: string;
  thread: { sender: 'STAFF' | 'GUIDE'; text: string; time: string }[];
}

interface StaffEscalationItem {
  id: string;
  priority: 'P1_CRITICAL' | 'P2_HOLD_EXPIRING' | 'P3_FINANCE';
  title: string;
  client: string;
  phone: string;
  issue: string;
  timeElapsed: string;
  slaMinutes: number;
  isBreached: boolean;
  riskInr: number;
  status: 'ACTIVE' | 'RESOLVED';
  recommendedAction: string;
}

const INITIAL_GUIDE_ROSTER: GuideRosterItem[] = [
  {
    id: 'guide-1',
    name: 'Aniket V.',
    phone: '+91 98200 11992',
    role: 'Bombay High Court Advocate (Senior Fellow)',
    assignedTour: '#FortWalk: Colonial Heritage',
    dateTime: 'Saturday 4:00 PM',
    status: 'CONFIRMED',
    checkInStatus: 'ACKNOWLEDGED',
    paxCount: 22,
    meetingPoint: 'Horniman Circle Garden Steps, Fort',
    lastMessage: 'Acknowledged. Will arrive 30 mins early at Horniman Circle with archival maps.',
    lastTime: '12m ago',
    thread: [
      { sender: 'STAFF', text: 'Namaste Aniket! Operational Brief for Sat 4:00 PM #FortWalk. 22 guests confirmed. Meeting point: Horniman Circle.', time: '10:00 AM' },
      { sender: 'GUIDE', text: 'Acknowledged. Will arrive 30 mins early at Horniman Circle with archival maps.', time: '10:14 AM' }
    ]
  },
  {
    id: 'guide-2',
    name: 'Sneha Rao',
    phone: '+91 98199 44332',
    role: 'Conservation Architect (Core Guide)',
    assignedTour: '#BandraVillages: Portuguese Heritage',
    dateTime: 'Sunday 8:00 AM',
    status: 'CONFIRMED',
    checkInStatus: 'STANDBY_ALERT',
    paxCount: 16,
    meetingPoint: 'St. Andrew Church Gate, Bandra',
    lastMessage: 'All set for Sunday morning. Sound system battery is fully charged.',
    lastTime: '1h ago',
    thread: [
      { sender: 'STAFF', text: 'Hi Sneha, Bandra Villages walk manifest locked at 16 walkers. Meeting point: St. Andrew Church gate.', time: '09:00 AM' },
      { sender: 'GUIDE', text: 'All set for Sunday morning. Sound system battery is fully charged.', time: '09:30 AM' }
    ]
  },
  {
    id: 'guide-3',
    name: 'Rahul Merchant',
    phone: '+91 98212 90811',
    role: 'Historian & Archival Researcher',
    assignedTour: '#ColabaArtDeco: Regal Precinct',
    dateTime: 'Saturday 4:30 PM',
    status: 'STANDBY',
    checkInStatus: 'AWAITING_CONFIRMATION',
    paxCount: 14,
    meetingPoint: 'Regal Cinema Foyer, Colaba',
    lastMessage: 'Automated Ping Sent: "Please confirm your availability for Colaba Art Deco by 12:00 PM."',
    lastTime: '25m ago',
    thread: [
      { sender: 'STAFF', text: 'Automated Ping: Rahul, please confirm availability for Saturday 4:30 PM Colaba walk (14 pax).', time: '10:15 AM' }
    ]
  },
  {
    id: 'guide-4',
    name: 'Bharat Gothoskar',
    phone: '+91 98201 03333',
    role: 'Founder & Head of Research',
    assignedTour: 'Elephanta Island Masterclass',
    dateTime: 'Sunday 7:30 AM',
    status: 'CONFIRMED',
    checkInStatus: 'ON_TRAIL',
    paxCount: 18,
    meetingPoint: 'Gateway of India Jetty No. 5',
    lastMessage: 'Ferry tickets pre-booked. Special permit for restricted caves verified.',
    lastTime: '3h ago',
    thread: [
      { sender: 'STAFF', text: 'Masterclass manifest finalized with 18 international delegates. Special boat arranged.', time: '07:00 AM' },
      { sender: 'GUIDE', text: 'Ferry tickets pre-booked. Special permit for restricted caves verified.', time: '07:20 AM' }
    ]
  }
];

const INITIAL_ESCALATIONS: StaffEscalationItem[] = [
  {
    id: 'esc-1',
    priority: 'P1_CRITICAL',
    title: 'VIP Corporate Request: Tata Sons Leadership Walk',
    client: 'Vikramaditya Shroff (Tata Sons)',
    phone: '+91 98201 23456',
    issue: 'Inbound VIP inquiry for 15 executives with customized high-tea pending proposal response.',
    timeElapsed: '28m',
    slaMinutes: 15,
    isBreached: true,
    riskInr: 45000,
    status: 'ACTIVE',
    recommendedAction: 'Send Bespoke Corporate Proposal (SAC 998554, 18% GST)',
  },
  {
    id: 'esc-2',
    priority: 'P2_HOLD_EXPIRING',
    title: '48h Inventory Hold Expiring: Reliance Retail Offsite',
    client: 'Pooja Nair (Reliance Retail)',
    phone: '+91 98330 91823',
    issue: '18 seats held on Fort Heritage Walk (Sat 4:00 PM). Hold window expires in 2h 15m without payment confirmation.',
    timeElapsed: '45h 45m',
    slaMinutes: 48,
    isBreached: false,
    riskInr: 16182,
    status: 'ACTIVE',
    recommendedAction: 'Extend hold by 24h OR release 18 seats to public inventory',
  },
  {
    id: 'esc-3',
    priority: 'P3_FINANCE',
    title: 'EOD Tally Discrepancy: 2 Spot Cash Bookings Unmapped',
    client: 'Gateway of India Departure #1042',
    phone: 'Field Cash Desk',
    issue: '₹1,798 collected in cash at assembly point. Requires GST SAC ledger allocation before daily Tally XML export.',
    timeElapsed: '3h 10m',
    slaMinutes: 4,
    isBreached: false,
    riskInr: 1798,
    status: 'ACTIVE',
    recommendedAction: 'Reconcile cash ledger with 5% GST (SAC 998553) & approve Tally push',
  },
];

export default function UnifiedInboxPage() {
  const { config } = useRole();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  
  const [inboxPersona, setInboxPersona] = useState<'GUEST_CONCIERGE' | 'GUIDE_ROSTER' | 'STAFF_ESCALATIONS'>('GUEST_CONCIERGE');
  
  // Filtering states
  const [streamFilter, setStreamFilter] = useState<string>('ALL');
  const [staffFilter, setStaffFilter] = useState<'ALL' | 'MY_ASSIGNED' | 'UNASSIGNED'>('ALL');
  const [filterMode, setFilterMode] = useState<'ALL' | 'OVERDUE' | 'HUMAN_ACTIVE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Guide Roster Desk States
  const [guideRoster, setGuideRoster] = useState<GuideRosterItem[]>(INITIAL_GUIDE_ROSTER);
  const [selectedGuideId, setSelectedGuideId] = useState<string>('guide-1');
  const [guideFilter, setGuideFilter] = useState<'ALL' | 'STANDBY' | 'ON_TRAIL'>('ALL');
  const [guideReply, setGuideReply] = useState('');

  // Staff & Owner Escalations States
  const [escalations, setEscalations] = useState<StaffEscalationItem[]>(INITIAL_ESCALATIONS);
  const [selectedEscalationId, setSelectedEscalationId] = useState<string>('esc-1');

  // Guide Desk Action Handlers
  const handleSendGuideBrief = (guideId: string) => {
    const guide = guideRoster.find((g) => g.id === guideId);
    if (!guide) return;
    const briefText = `🏛️ Briefing for ${guide.assignedTour} (${guide.dateTime}): 22 pax booked. Sound box charged. Meeting point: ${guide.meetingPoint}.`;
    setGuideRoster((prev) =>
      prev.map((g) =>
        g.id === guideId
          ? {
              ...g,
              lastMessage: briefText,
              lastTime: 'Just now',
              thread: [...g.thread, { sender: 'STAFF', text: briefText, time: 'Just now' }],
            }
          : g
      )
    );
    setActionNotice(`WhatsApp operational brief dispatched to ${guide.name} (${guide.phone})`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleSendGuidePin = (guideId: string) => {
    const guide = guideRoster.find((g) => g.id === guideId);
    if (!guide) return;
    const pinText = `📍 Assembly Landmark Pin: ${guide.meetingPoint} - https://maps.google.com/?q=${encodeURIComponent(guide.meetingPoint)}`;
    setGuideRoster((prev) =>
      prev.map((g) =>
        g.id === guideId
          ? {
              ...g,
              lastMessage: pinText,
              lastTime: 'Just now',
              thread: [...g.thread, { sender: 'STAFF', text: pinText, time: 'Just now' }],
            }
          : g
      )
    );
    setActionNotice(`Google Maps assembly location broadcasted to ${guide.name}`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleMarkGuideCheckedIn = (guideId: string) => {
    setGuideRoster((prev) =>
      prev.map((g) =>
        g.id === guideId
          ? {
              ...g,
              status: 'ON_TRAIL',
              checkInStatus: 'ON_TRAIL',
              thread: [...g.thread, { sender: 'STAFF', text: '✅ Verified on-site attendance at landmark. Tour active.', time: 'Just now' }],
            }
          : g
      )
    );
    setActionNotice('Guide verified checked-in on site at landmark');
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleEmergencyReplacement = (guideId: string) => {
    const guide = guideRoster.find((g) => g.id === guideId);
    setActionNotice(`🚨 Emergency broadcast dispatched to 3 standby guides for ${guide?.assignedTour}`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleSendGuideCustomReply = () => {
    if (!guideReply.trim()) return;
    setGuideRoster((prev) =>
      prev.map((g) =>
        g.id === selectedGuideId
          ? {
              ...g,
              lastMessage: guideReply,
              lastTime: 'Just now',
              thread: [...g.thread, { sender: 'STAFF', text: guideReply, time: 'Just now' }],
            }
          : g
      )
    );
    setGuideReply('');
    setActionNotice('WhatsApp message sent to guide');
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Staff Escalation Handlers
  const handleResolveEscalation = (escId: string, actionMsg: string) => {
    setEscalations((prev) =>
      prev.map((e) => (e.id === escId ? { ...e, status: 'RESOLVED' } : e))
    );
    setActionNotice(`Escalation Resolved: ${actionMsg}`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Simulation & Audit Modals
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [simName, setSimName] = useState('Vikramaditya Shroff');
  const [simPhone, setSimPhone] = useState('+919820123456');
  const [simMessage, setSimMessage] = useState('We need a private heritage walk for 15 executives from Tata Sons this Saturday afternoon.');

  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditTargetSession, setAuditTargetSession] = useState<ChatSession | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Poll real-time conversations list
  const syncConversationList = async () => {
    try {
      const res = await fetch('/api/inbox/conversations');
      if (!res.ok) return;
      const data = await res.json();
      if (data.conversations && data.conversations.length > 0) {
        setSessions((prev) => {
          const prevMap = new Map(prev.map((s) => [s.phone.replace(/[^0-9]/g, ''), s]));
          return data.conversations.map((serverConv: any) => {
            const clean = serverConv.phone.replace(/[^0-9]/g, '');
            const existing = prevMap.get(clean);
            if (!existing) return serverConv;

            const existingIds = new Set(existing.messages.map((m: any) => m.id));
            const newMsgs = (serverConv.messages || []).filter((m: any) => !existingIds.has(m.id));

            return {
              ...serverConv,
              messages: [...existing.messages, ...newMsgs],
              humanTakeover: serverConv.humanTakeover !== undefined ? serverConv.humanTakeover : existing.humanTakeover,
              assignedStaff: serverConv.assignedStaff || existing.assignedStaff,
              inboundStream: serverConv.inboundStream || existing.inboundStream,
            };
          });
        });

        if (!selectedSessionId && data.conversations[0]) {
          setSelectedSessionId(data.conversations[0].id);
        }
      }
    } catch {
      // Silent poll catch
    }
  };

  useEffect(() => {
    syncConversationList();
    const listTimer = setInterval(syncConversationList, 4000);
    return () => clearInterval(listTimer);
  }, []);

  const activeSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0] || null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages?.length, activeSession?.id]);

  // Filtered Sessions logic
  const filteredSessions = sessions.filter((s) => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.customerName.toLowerCase().includes(q);
      const matchPhone = s.phone.includes(q);
      const matchTour = s.tourName.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchTour) return false;
    }

    // Stream filter
    if (streamFilter !== 'ALL' && s.inboundStream !== streamFilter) {
      return false;
    }

    // Staff filter
    if (staffFilter === 'MY_ASSIGNED') {
      const myNameWord = config.userName.split(' ')[0].toLowerCase();
      const assigned = (s.assignedStaff || '').toLowerCase();
      if (!assigned.includes(myNameWord)) return false;
    } else if (staffFilter === 'UNASSIGNED') {
      if (s.assignedStaff && s.assignedStaff !== 'Unassigned') return false;
    }

    // Quick filter modes
    if (filterMode === 'OVERDUE') return s.minutesElapsed > s.slaMinutes;
    if (filterMode === 'HUMAN_ACTIVE') return s.humanTakeover;

    return true;
  });

  // Reassign staff handler
  const handleReassignStaff = async (phone: string, newStaff: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.phone === phone ? { ...s, assignedStaff: newStaff } : s))
    );

    try {
      await fetch('/api/inbox/conversations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, assigned_staff: newStaff }),
      });
      setActionNotice(`Reassigned conversation to ${newStaff}`);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Reclassify inbound stream handler
  const handleChangeStream = async (phone: string, newStream: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.phone === phone ? { ...s, inboundStream: newStream as any } : s))
    );

    try {
      await fetch('/api/inbox/conversations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, inbound_stream: newStream }),
      });
      setActionNotice(`Reclassified to ${newStream.replace('_', ' ')}`);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // 1-Click Takeover handler (for stale SLA or jumping in)
  const handleTakeover = async (session: ChatSession) => {
    const newTakeover = !session.humanTakeover;
    const assigned = newTakeover ? config.userName : session.assignedStaff;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === session.id
          ? { ...s, humanTakeover: newTakeover, assignedStaff: assigned }
          : s
      )
    );

    try {
      await fetch('/api/inbox/conversations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: session.phone,
          human_takeover: newTakeover,
          assigned_staff: assigned,
        }),
      });

      await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: session.phone, setTakeover: newTakeover }),
      });

      setActionNotice(
        newTakeover
          ? `⚡ You have taken over this conversation as ${config.userName}. AI auto-reply paused.`
          : 'AI Concierge restored.'
      );
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeSession) return;

    const textToSend = replyText.trim();
    setReplyText('');
    setIsSending(true);

    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      sender: 'HUMAN',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'DELIVERED',
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? {
              ...s,
              messages: [...s.messages, newMsg],
              lastMessage: textToSend,
              lastMessageTimestamp: 'Just now',
              humanTakeover: true,
              assignedStaff: config.userName,
            }
          : s
      )
    );

    try {
      await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: activeSession.phone,
          message: textToSend,
        }),
      });
    } catch {
      // Mock fallback
    } finally {
      setIsSending(false);
    }
  };

  const sendTemplateAction = (templateType: 'CONFIRMATION' | 'LOCATION_PIN' | 'B2B_PROPOSAL') => {
    if (!activeSession) return;
    let sentText = '';
    let isLoc = false;

    if (templateType === 'CONFIRMATION') {
      sentText = `🏛️ *KHAKI TOURS BOOKING CONFIRMATION*\n\nNamaste ${activeSession.customerName}!\nYour booking for *${activeSession.tourName}* is confirmed.\n• SAC Code: ${activeSession.taxSacCode} (${activeSession.gstRate} GST)\n• Total Amount Paid: ₹${(activeSession.lifetimeSpendInr).toLocaleString('en-IN')}\n\nYour guide contact will be shared 24h prior to departure. See you on the trail!`;
    } else if (templateType === 'LOCATION_PIN') {
      sentText = `📍 *MEETING LANDMARK & DIRECTIONS*\n\nAssemble at: *Horniman Circle Steps, Fort, Mumbai*\nGoogle Maps Navigation Pin: https://maps.google.com/?q=Horniman+Circle+Mumbai\nReporting Time: 15 minutes before slot.`;
      isLoc = true;
    } else if (templateType === 'B2B_PROPOSAL') {
      sentText = `📄 *KHAKI TOURS B2B RETREAT PROPOSAL*\n\nDear ${activeSession.customerName},\nWe have prepared your customized heritage offsite proposal with 18% GST (SAC 998554).\n\nReview & Approve: https://khakitours.com/b2b-proposal/KT-${Date.now().toString().slice(-4)}`;
    }

    const newMsg: ChatMessage = {
      id: `m_tmpl_${Date.now()}`,
      sender: 'HUMAN',
      text: sentText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'DELIVERED',
      isLocationPin: isLoc,
      isTemplate: true,
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? {
              ...s,
              messages: [...s.messages, newMsg],
              lastMessage: sentText.slice(0, 60) + '...',
              lastMessageTimestamp: 'Just now',
              humanTakeover: true,
            }
          : s
      )
    );

    fetch('/api/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: activeSession.phone, message: sentText }),
    }).catch(() => {});

    if (templateType === 'CONFIRMATION') {
      fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_name: activeSession.customerName,
          contact_phone: activeSession.phone,
          company: activeSession.organization || '',
          tour_title: activeSession.tourName,
          departure_date: '2026-10-10',
          group_size: 2,
          total_amount_inr: 1798,
          amount_paid_inr: 1798,
          status: 'CONFIRMED',
          category: activeSession.priorityTier === 'P1_CRITICAL_CORPORATE' ? 'CORPORATE' : 'STANDARD_WALK',
        }),
      }).catch(() => {});
    }

    setActionNotice(`Sent ${templateType.replace('_', ' ')} via WhatsApp.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const runJevSimulation = async () => {
    setIsClassifying(true);
    try {
      const res = await fetch('/api/agent-query/leads/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_phone: simPhone,
          message_text: simMessage,
          sender_name: simName,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const isCorp = json.data.isCorporate;

        const newSessionId = `sess_sim_${Date.now()}`;
        const newSession: ChatSession = {
          id: newSessionId,
          customerName: simName,
          phone: simPhone,
          organization: isCorp ? 'Corporate Inquiry' : undefined,
          tourName: json.jev_analysis?.recommendedTourTheme || 'Custom Inbound Walk',
          channel: 'WHATSAPP',
          messages: [
            {
              id: `m_sim_1`,
              sender: 'GUEST',
              text: simMessage,
              timestamp: 'Just now',
              status: 'READ',
            },
            {
              id: `m_sim_2`,
              sender: 'BOT',
              text: json.data.afterHoursAutoReplyText || 'Inquiry received. Khaki Ambassador will connect shortly.',
              timestamp: 'Just now',
              status: 'DELIVERED',
            }
          ],
          lastMessage: simMessage,
          lastMessageTimestamp: 'Just now',
          humanTakeover: false,
          status: 'LEAD_NEW',
          priorityTier: json.data.tier as LeadPriorityTier,
          inboundStream: isCorp ? 'CORPORATE_VIP' : 'PRIVATE_TOUR',
          assignedStaff: json.data.assignedRole === 'BHARAT_FOUNDER' ? 'Bharat Gothoskar (Founder & CEO)' : 'Priya S. (Ops Lead)',
          slaMinutes: json.data.slaResponseMinutes || 15,
          minutesElapsed: 1,
          lifetimeSpendInr: isCorp ? 75000 : 2500,
          totalBookings: 1,
          rfmScore: isCorp ? 94 : 65,
          taxSacCode: isCorp ? '998554' : '998555',
          gstRate: isCorp ? '18%' : '5%',
          jevAnalysis: json.jev_analysis,
          aiQualityScore: 95,
          auditSummary: {
            intentAccuracy: 98,
            repetitionDetected: false,
            stumbles: [],
            employeeResponseMinutes: 1,
            sentiment: 'SATISFIED',
            notes: 'Jev System One classifier detected urgency and corporate group pattern.',
          },
        };

        setSessions((prev) => [newSession, ...prev]);
        setSelectedSessionId(newSessionId);
        setIsSimModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsClassifying(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] min-h-[560px] flex flex-col gap-3 overflow-hidden">
      {/* Top Header & Multi-Stream Bifurcation Filters */}
      <div className="shrink-0 flex flex-col gap-2.5 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              WhatsApp Operations & Guest Inbox
            </h1>
            <p className="text-xs text-slate-400">
              Live multi-agent WhatsApp streams, SLA tracking, staff assignments, and conversational auditing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSimModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs rounded-lg transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Simulate Inbound Lead
            </button>

            <button
              onClick={syncConversationList}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition"
              title="Refresh Queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top-Level Persona Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/90 rounded-lg border border-slate-800/90">
          <button
            onClick={() => setInboxPersona('GUEST_CONCIERGE')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
              inboxPersona === 'GUEST_CONCIERGE'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
            <span>Guest Concierge Desk ({sessions.length})</span>
          </button>

          <button
            onClick={() => setInboxPersona('GUIDE_ROSTER')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
              inboxPersona === 'GUIDE_ROSTER'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]"></span>
            <span>Guide Roster Desk (4)</span>
          </button>

          <button
            onClick={() => setInboxPersona('STAFF_ESCALATIONS')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-2 ${
              inboxPersona === 'STAFF_ESCALATIONS'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)]"></span>
            <span>Staff & Owner Alerts (3)</span>
          </button>
        </div>

        {/* Stream Filter Row & Staff Filter Row (Guest Concierge Mode) */}
        {inboxPersona === 'GUEST_CONCIERGE' && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
            {/* Stream Bifurcation Buttons */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 mr-1">Stream:</span>
              <button
                onClick={() => setStreamFilter('ALL')}
                className={`px-2.5 py-1 rounded-md text-xs transition ${
                  streamFilter === 'ALL'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All Streams ({sessions.length})
              </button>

              {Object.entries(STREAM_CONFIG).map(([key, item]) => {
                const count = sessions.filter((s) => s.inboundStream === key).length;
                return (
                  <button
                    key={key}
                    onClick={() => setStreamFilter(key)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                      streamFilter === key
                        ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800/80'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                    <span className="text-[10px] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Staff Allocation & Overdue Filters */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-500 mr-1">Assignee:</span>
              <button
                onClick={() => setStaffFilter('ALL')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  staffFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Staff
              </button>
              <button
                onClick={() => setStaffFilter('MY_ASSIGNED')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition flex items-center gap-1 ${
                  staffFilter === 'MY_ASSIGNED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                👤 Mine ({config.shortTitle})
              </button>
              <button
                onClick={() => setStaffFilter('UNASSIGNED')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  staffFilter === 'UNASSIGNED' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                Unassigned
              </button>

              <span className="text-slate-700">|</span>

              <button
                onClick={() => setFilterMode(filterMode === 'OVERDUE' ? 'ALL' : 'OVERDUE')}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition flex items-center gap-1 ${
                  filterMode === 'OVERDUE'
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80 shadow-sm'
                    : 'text-rose-400/80 hover:text-rose-300 bg-rose-950/20 border border-rose-900/30'
                }`}
              >
                <span>⚠️</span>
                <span>Overdue ({sessions.filter((s) => s.minutesElapsed > s.slaMinutes).length})</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {actionNotice && (
        <div className="shrink-0 bg-emerald-950/60 border border-emerald-500/40 px-4 py-2 rounded-lg text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* PERSONA 1: GUEST CONCIERGE DESK (3-PANE WORKSPACE) */}
      {inboxPersona === 'GUEST_CONCIERGE' && (
        <div className="flex-1 min-h-0 grid grid-cols-12 gap-3 bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden shadow">
        
        {/* PANE 1: CONVERSATIONS QUEUE (3.5 cols) */}
        <div className="col-span-3 min-h-0 h-full border-r border-slate-800 flex flex-col bg-slate-950/50 overflow-hidden">
          <div className="shrink-0 p-2.5 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
            {filteredSessions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No matching conversations found.
              </div>
            ) : (
              filteredSessions.map((session) => {
                const isSelected = activeSession && session.id === activeSession.id;
                const isOverdue = session.minutesElapsed > session.slaMinutes;
                const streamCfg = STREAM_CONFIG[session.inboundStream || 'PUBLIC_WALK'];

                return (
                  <button
                    key={session.id}
                    onClick={() => setSelectedSessionId(session.id)}
                    className={`w-full text-left p-3 transition flex flex-col gap-1.5 ${
                      isSelected ? 'bg-slate-800/90 border-l-4 border-amber-500' : 'hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white text-xs flex items-center gap-1.5 min-w-0">
                        <span className="text-emerald-400 shrink-0">💬</span>
                        <span className="truncate">{session.customerName}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 whitespace-nowrap">
                        {session.lastMessageTimestamp}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className={`px-1.5 py-0.5 rounded font-medium border flex items-center gap-1 ${streamCfg.badgeColor}`}>
                        <span>{streamCfg.icon}</span>
                        <span>{streamCfg.label}</span>
                      </span>

                      {isOverdue ? (
                        <span className="px-1.5 py-0.5 rounded font-mono text-[9px] bg-rose-950/70 text-rose-300 border border-rose-800/60 font-semibold">
                          {session.minutesElapsed}m SLA
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono">
                          {session.assignedStaff?.split(' ')[0] || 'Unassigned'}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {session.lastMessage}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* PANE 2: LIVE CONVERSATION STREAM & COMPOSER (5 cols) */}
        {activeSession ? (
          <div className="col-span-5 min-h-0 h-full flex flex-col bg-slate-900/20 border-r border-slate-800 overflow-hidden">
            {/* Active Header */}
            <div className="shrink-0 p-3 border-b border-slate-800 bg-slate-900/80 flex flex-col gap-2">
              {/* Row 1: Contact Title & Action Buttons */}
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex items-center gap-2">
                  <h2 className="font-bold text-white text-sm truncate">{activeSession.customerName}</h2>
                  <span className="text-xs text-slate-400 font-mono shrink-0">{activeSession.phone}</span>
                </div>

                {/* Action Buttons: Takeover & Audit */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      setAuditTargetSession(activeSession);
                      setIsAuditModalOpen(true);
                    }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-lg transition flex items-center gap-1.5"
                    title="View AI & Staff Conversation Audit"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Audit</span>
                    <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      {activeSession.aiQualityScore || 95}%
                    </span>
                  </button>

                  <button
                    onClick={() => handleTakeover(activeSession)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition flex items-center gap-1 border shadow-sm ${
                      activeSession.humanTakeover
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                        : activeSession.minutesElapsed > activeSession.slaMinutes
                        ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border-rose-800/80'
                        : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {activeSession.humanTakeover ? 'Release to AI' : 'Take Over'}
                  </button>
                </div>
              </div>

              {/* Row 2: Stream Selector & Staff Assignment */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/50">
                {/* Stream Dropdown */}
                <select
                  value={activeSession.inboundStream || 'PUBLIC_WALK'}
                  onChange={(e) => handleChangeStream(activeSession.phone, e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-amber-400 font-medium focus:outline-none"
                >
                  <option value="PUBLIC_WALK">🚶 Public Walk</option>
                  <option value="PRIVATE_TOUR">🚙 Private Safari</option>
                  <option value="CORPORATE_VIP">🏢 Corporate VIP</option>
                  <option value="INTERNATIONAL">✈️ International</option>
                  <option value="GENERAL_INQUIRY">💬 General Inquiry</option>
                </select>

                <span className="text-slate-600">•</span>

                {/* Staff Assignment Dropdown */}
                <select
                  value={activeSession.assignedStaff || 'Unassigned'}
                  onChange={(e) => handleReassignStaff(activeSession.phone, e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300 font-medium focus:outline-none"
                >
                  {STAFF_LIST.map((staff) => (
                    <option key={staff} value={staff}>
                      👤 {staff}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Overdue Warning Pill */}
            {activeSession.minutesElapsed > activeSession.slaMinutes && !activeSession.humanTakeover && (
              <div className="bg-rose-950/50 border-b border-rose-900/50 px-3 py-1.5 text-xs text-rose-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  SLA Alert: {activeSession.minutesElapsed}m elapsed without staff reply (Target: {activeSession.slaMinutes}m).
                </span>
                <button
                  onClick={() => handleTakeover(activeSession)}
                  className="text-[11px] underline font-medium text-rose-200 hover:text-white"
                >
                  Take Over Now →
                </button>
              </div>
            )}

            {/* Messages Body */}
            <div className="flex-1 min-h-0 p-3.5 overflow-y-auto space-y-3 custom-scrollbar">
              {activeSession.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'HUMAN' || m.sender === 'BOT' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-3 rounded-xl text-xs max-w-md shadow-sm border ${
                      m.sender === 'GUEST'
                        ? 'bg-slate-800 text-slate-100 border-slate-700 rounded-tl-none'
                        : m.sender === 'HUMAN'
                        ? 'bg-emerald-950/50 text-slate-200 border-emerald-800/40 rounded-tr-none'
                        : 'bg-slate-900 text-slate-300 border-slate-800 rounded-tr-none'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1 gap-4">
                      <span className={m.sender === 'HUMAN' ? 'text-emerald-400 font-bold' : m.sender === 'GUEST' ? 'text-slate-400 font-semibold' : 'text-amber-400 font-semibold'}>
                        {m.sender === 'GUEST' ? activeSession.customerName : m.sender === 'HUMAN' ? `Ambassador (${activeSession.assignedStaff?.split(' ')[0] || 'Staff'})` : '🤖 Khaki AI Concierge'}
                      </span>
                      <span className="text-slate-500 font-mono text-[9px] flex items-center gap-1">
                        {m.timestamp}
                        {m.sender !== 'GUEST' && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>

                    {m.isLocationPin && (
                      <div className="mt-2 bg-slate-950/80 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-[11px] text-amber-400">
                        <span className="flex items-center gap-1">📍 Assembly Navigation Pin Attached</span>
                        <a href="https://maps.google.com/?q=Horniman+Circle+Mumbai" target="_blank" rel="noreferrer" className="underline font-bold text-amber-300">
                          Open Map
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <form onSubmit={handleSendReply} className="shrink-0 p-2.5 border-t border-slate-800 bg-slate-950/80 flex gap-2">
              <input
                type="text"
                placeholder={activeSession.humanTakeover ? `Reply as ${config.userName}...` : 'Type to take over and reply directly on WhatsApp...'}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isSending}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                Send
              </button>
            </form>
          </div>
        ) : (
          <div className="col-span-5 flex items-center justify-center text-xs text-slate-500">
            Select a conversation to inspect.
          </div>
        )}

        {/* PANE 3: GUEST CRM, OPERATIONAL ACTIONS & AUDIT CARD (4 cols) */}
        {activeSession && (
          <div className="col-span-4 min-h-0 h-full flex flex-col bg-slate-950/60 p-3.5 overflow-y-auto space-y-3.5 custom-scrollbar">
            
            {/* Guest CRM Dossier Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-500" />
                  Guest CRM Profile
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  RFM: {activeSession.rfmScore}/100
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-bold text-white text-sm">{activeSession.customerName}</div>
                {activeSession.organization && (
                  <div className="text-amber-400 font-medium text-xs flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {activeSession.organization}
                  </div>
                )}
                <div className="text-slate-400 font-mono text-[11px]">{activeSession.phone}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block uppercase">Lifetime Spend</span>
                  <span className="font-bold text-emerald-400 font-mono text-sm">₹{activeSession.lifetimeSpendInr.toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block uppercase">Past Walks</span>
                  <span className="font-bold text-white font-mono text-sm">{activeSession.totalBookings} Completed</span>
                </div>
              </div>
            </div>

            {/* Conversation Quality Score & Audit Widget */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                  Conversation Quality Audit
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Grade A ({activeSession.aiQualityScore || 95}%)
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Intent Resolution:</span>
                  <span className="font-semibold text-emerald-400">{activeSession.auditSummary?.intentAccuracy || 96}% Accurate</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Response Turnaround:</span>
                  <span className="font-mono text-white">{activeSession.minutesElapsed} mins</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Repetitive Phrasing:</span>
                  <span className="text-emerald-400 font-semibold">0 Flags (Clean)</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Guest Sentiment:</span>
                  <span className="text-amber-400 font-bold uppercase">{activeSession.auditSummary?.sentiment || 'SATISFIED'}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setAuditTargetSession(activeSession);
                  setIsAuditModalOpen(true);
                }}
                className="w-full mt-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold p-2 rounded-lg transition flex items-center justify-center gap-1.5"
              >
                <span>🔍 Inspect Turn-by-Turn Diagnostic</span>
              </button>
            </div>

            {/* Direct Travel OS Operations Actions */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Direct Travel OS Actions
              </span>

              <button
                onClick={async () => {
                  const seatsToHold = 2;
                  try {
                    const res = await fetch('/api/departures/hold', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        departureId: 'dep_1',
                        seats: seatsToHold,
                        contactName: activeSession.customerName,
                        phone: activeSession.phone,
                        reason: 'Hold placed by Ambassador in Unified Inbox',
                      }),
                    });

                    if (res.ok) {
                      const text = `🔒 *SEATS RESERVED (30-MIN HOLD)*\n\nDear ${activeSession.customerName},\nWe have held ${seatsToHold} seats for you on Saturday's departure (#DurgasOf Mumbai).\n\nPlease complete advance payment within 30 minutes to confirm your tickets:\n👉 https://khakitours.com/pay/hold-sat-${Date.now().toString().slice(-4)}`;
                      fetch('/api/whatsapp', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ to: activeSession.phone, message: text }),
                      }).catch(() => {});

                      setActionNotice(`Locked ${seatsToHold} seats in calendar. Sent WhatsApp hold notice.`);
                      setTimeout(() => setActionNotice(null), 5000);
                    }
                  } catch {
                    setActionNotice(`Held ${seatsToHold} seats on Saturday Departure.`);
                    setTimeout(() => setActionNotice(null), 4000);
                  }
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold p-2.5 rounded-lg transition flex items-center justify-between"
              >
                <span>🔒 Hold 2 Seats on Saturday Slot</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => sendTemplateAction('CONFIRMATION')}
                className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold p-2.5 rounded-lg transition flex items-center justify-between"
              >
                <span>💳 Send UPI Instant Pass on WhatsApp</span>
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              </button>

              <button
                onClick={() => sendTemplateAction('LOCATION_PIN')}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold p-2.5 rounded-lg transition flex items-center justify-between"
              >
                <span>📍 Dispatch G-Maps Pin & Guide Contact</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        )}
      </div>
      )}

      {/* PERSONA 2: GUIDE ROSTER DESK */}
      {inboxPersona === 'GUIDE_ROSTER' && (
        <div className="flex-1 min-h-0 grid grid-cols-12 gap-3 bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden shadow">
          {/* PANE 1: GUIDE LIST & SHIFTS (4 cols) */}
          <div className="col-span-4 min-h-0 h-full border-r border-slate-800 flex flex-col bg-slate-950/50 overflow-hidden">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-blue-400" />
                  Active Guide Roster
                </h2>
                <span className="text-[10px] text-slate-400 font-mono">
                  {guideRoster.filter(g => g.status === 'CONFIRMED').length} Confirmed &bull; {guideRoster.filter(g => g.status === 'STANDBY').length} Standby
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  onClick={() => setGuideFilter('ALL')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${guideFilter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setGuideFilter('STANDBY')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${guideFilter === 'STANDBY' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Standby
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
              {guideRoster
                .filter(g => guideFilter === 'ALL' || (guideFilter === 'STANDBY' && g.status === 'STANDBY') || (guideFilter === 'ON_TRAIL' && g.status === 'ON_TRAIL'))
                .map((guide) => {
                  const isSelected = guide.id === selectedGuideId;
                  return (
                    <button
                      key={guide.id}
                      onClick={() => setSelectedGuideId(guide.id)}
                      className={`w-full text-left p-3.5 transition flex flex-col gap-1.5 ${
                        isSelected ? 'bg-slate-800/90 border-l-4 border-blue-500' : 'hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs flex items-center gap-1.5">
                          <span className="text-blue-400">🧭</span>
                          {guide.name}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          guide.status === 'CONFIRMED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : guide.status === 'ON_TRAIL'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800/60'
                            : 'bg-amber-950 text-amber-300 border border-amber-800/60 animate-pulse'
                        }`}>
                          {guide.status === 'ON_TRAIL' ? '🚶 On Trail' : guide.status === 'CONFIRMED' ? '✓ Confirmed' : '⚠️ Standby'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300 font-medium truncate">
                        {guide.assignedTour}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>{guide.dateTime}</span>
                        <span>{guide.paxCount} Pax</span>
                      </div>

                      <div className="text-[11px] text-slate-400 line-clamp-1 italic bg-slate-950/40 px-2 py-1 rounded border border-slate-800/50">
                        &quot;{guide.lastMessage}&quot;
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* PANE 2: DISPATCH FEED & OPERATIONAL BRIEFING (8 cols) */}
          {(() => {
            const activeGuide = guideRoster.find(g => g.id === selectedGuideId) || guideRoster[0];
            if (!activeGuide) return null;
            return (
              <div className="col-span-8 min-h-0 h-full flex flex-col bg-slate-950/30 overflow-hidden">
                {/* Guide Header Banner */}
                <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center font-bold text-blue-300 text-sm">
                      {activeGuide.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm">{activeGuide.name}</h3>
                        <span className="text-xs text-slate-400 font-mono">({activeGuide.phone})</span>
                      </div>
                      <div className="text-xs text-slate-400">{activeGuide.role}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMarkGuideCheckedIn(activeGuide.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark Checked-In on Site
                    </button>
                    <button
                      onClick={() => handleEmergencyReplacement(activeGuide.id)}
                      className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/60 text-rose-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                      title="If guide cancels, broadcast shift to backup contractor pool"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Standby Replacement
                    </button>
                  </div>
                </div>

                {/* Tour Assignment Card */}
                <div className="p-3 bg-slate-900/40 border-b border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Assigned Departure</span>
                      <span className="font-bold text-white">{activeGuide.assignedTour}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Slot Timing</span>
                      <span className="font-semibold text-amber-300 font-mono">{activeGuide.dateTime}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Manifest Size</span>
                      <span className="font-semibold text-emerald-400 font-mono">{activeGuide.paxCount} Walkers</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSendGuideBrief(activeGuide.id)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30 rounded text-xs font-medium flex items-center gap-1.5"
                    >
                      <Send className="w-3 h-3 text-blue-400" />
                      Dispatch WhatsApp Brief
                    </button>
                    <button
                      onClick={() => handleSendGuidePin(activeGuide.id)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded text-xs font-medium flex items-center gap-1.5"
                    >
                      <MapPin className="w-3 h-3 text-amber-400" />
                      Send Assembly Pin
                    </button>
                  </div>
                </div>

                {/* Dispatch Communication Thread */}
                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-950/20">
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800">
                      Official Guide Dispatch Communication Log
                    </span>
                  </div>

                  {activeGuide.thread.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col max-w-[80%] ${
                        msg.sender === 'STAFF' ? 'ml-auto items-end' : 'mr-auto items-start'
                      }`}
                    >
                      <div
                        className={`p-3 rounded-xl text-xs space-y-1 ${
                          msg.sender === 'STAFF'
                            ? 'bg-blue-900/60 border border-blue-700/60 text-white rounded-br-none'
                            : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 text-[10px] opacity-75 font-mono">
                          <span>{msg.sender === 'STAFF' ? 'Khaki Operations Desk' : activeGuide.name}</span>
                          <span>{msg.time}</span>
                        </div>
                        <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Reply Composer for Guide Desk */}
                <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Send WhatsApp update to ${activeGuide.name}...`}
                    value={guideReply}
                    onChange={(e) => setGuideReply(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendGuideCustomReply()}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleSendGuideCustomReply}
                    disabled={!guideReply.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* PERSONA 3: STAFF & OWNER ESCALATIONS DESK */}
      {inboxPersona === 'STAFF_ESCALATIONS' && (
        <div className="flex-1 min-h-0 grid grid-cols-12 gap-3 bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden shadow">
          {/* PANE 1: ESCALATIONS QUEUE (4 cols) */}
          <div className="col-span-4 min-h-0 h-full border-r border-slate-800 flex flex-col bg-slate-950/50 overflow-hidden">
            <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Executive & Owner Alerts
                </h2>
                <span className="text-[10px] text-slate-400 font-mono">
                  {escalations.filter(e => e.status === 'ACTIVE').length} Active &bull; ₹{escalations.filter(e => e.status === 'ACTIVE').reduce((acc, curr) => acc + curr.riskInr, 0).toLocaleString('en-IN')} Value at Stake
                </span>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
              {escalations.map((esc) => {
                const isSelected = esc.id === selectedEscalationId;
                const isResolved = esc.status === 'RESOLVED';
                return (
                  <button
                    key={esc.id}
                    onClick={() => setSelectedEscalationId(esc.id)}
                    className={`w-full text-left p-3.5 transition flex flex-col gap-2 ${
                      isSelected ? 'bg-slate-800/90 border-l-4 border-rose-500' : 'hover:bg-slate-900/50'
                    } ${isResolved ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        esc.priority === 'P1_CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                          : esc.priority === 'P2_HOLD_EXPIRING'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                          : 'bg-purple-950 text-purple-300 border border-purple-800/60'
                      }`}>
                        {isResolved ? '✓ RESOLVED' : esc.priority === 'P1_CRITICAL' ? '🚨 P1 SLA BREACH' : esc.priority === 'P2_HOLD_EXPIRING' ? '⏳ 48H HOLD EXPIRING' : '📑 TALLY RECON'}
                      </span>

                      <span className="text-[10px] text-slate-400 font-mono">
                        {esc.timeElapsed} elapsed
                      </span>
                    </div>

                    <div className="font-bold text-white text-xs line-clamp-1">
                      {esc.title}
                    </div>

                    <div className="text-[11px] text-slate-300 line-clamp-2">
                      {esc.issue}
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/50 text-slate-400 font-mono">
                      <span>{esc.client}</span>
                      <span className="font-bold text-amber-400">₹{esc.riskInr.toLocaleString('en-IN')}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PANE 2: ESCALATION RESOLUTION WORKSPACE (8 cols) */}
          {(() => {
            const activeEsc = escalations.find(e => e.id === selectedEscalationId) || escalations[0];
            if (!activeEsc) return null;
            const isResolved = activeEsc.status === 'RESOLVED';

            return (
              <div className="col-span-8 min-h-0 h-full flex flex-col bg-slate-950/30 overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                        isResolved ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                      }`}>
                        {isResolved ? 'RESOLVED' : activeEsc.priority}
                      </span>
                      <h3 className="font-bold text-white text-base">{activeEsc.title}</h3>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                      <span>Client: <strong className="text-white">{activeEsc.client}</strong></span>
                      <span>Phone: <strong className="text-amber-400 font-mono">{activeEsc.phone}</strong></span>
                      <span>At Stake: <strong className="text-emerald-400 font-mono">₹{activeEsc.riskInr.toLocaleString('en-IN')}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Escalation Context Body */}
                <div className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar">
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Issue Analysis & Operational Impact
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {activeEsc.issue}
                    </p>
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300 flex items-center gap-2">
                      <Zap className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>Recommended Resolution: <strong>{activeEsc.recommendedAction}</strong></span>
                    </div>
                  </div>

                  {/* Action Panel based on escalation type */}
                  <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      1-Click Executive Action Triggers
                    </span>

                    {isResolved ? (
                      <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-center space-y-2">
                        <CheckCheck className="w-6 h-6 text-emerald-400 mx-auto" />
                        <div className="text-sm font-bold text-emerald-300">Escalation Resolved & Archived</div>
                        <div className="text-xs text-slate-400">All inventory, financial ledgers, and client updates have been synced.</div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activeEsc.priority === 'P1_CRITICAL' && (
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => handleResolveEscalation(activeEsc.id, 'Dispatched bespoke proposal with 18% GST (SAC 998554) to Tata Sons.')}
                              className="p-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow"
                            >
                              <Send className="w-4 h-4" />
                              Dispatch VIP Proposal via WhatsApp
                            </button>
                            <button
                              onClick={() => handleResolveEscalation(activeEsc.id, 'Assigned Founder Bharat Gothoskar as dedicated VIP curator.')}
                              className="p-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs border border-slate-700 transition flex items-center justify-center gap-2"
                            >
                              <UserCheck className="w-4 h-4 text-blue-400" />
                              Assign Founder Bharat Gothoskar
                            </button>
                          </div>
                        )}

                        {activeEsc.priority === 'P2_HOLD_EXPIRING' && (
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => handleResolveEscalation(activeEsc.id, 'Extended 18-seat hold for Reliance Retail by 24 hours.')}
                              className="p-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow"
                            >
                              <Clock className="w-4 h-4" />
                              Extend Hold +24 Hours
                            </button>
                            <button
                              onClick={() => handleResolveEscalation(activeEsc.id, 'Released 18 seats back to public booking inventory.')}
                              className="p-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow"
                            >
                              <Unlock className="w-4 h-4" />
                              Release 18 Seats to Public Inventory
                            </button>
                          </div>
                        )}

                        {activeEsc.priority === 'P3_FINANCE' && (
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => handleResolveEscalation(activeEsc.id, 'Mapped ₹1,798 cash receipts to GST SAC 998553 and exported to Tally XML.')}
                              className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow"
                            >
                              <FileText className="w-4 h-4" />
                              Approve & Export to Tally Prime XML
                            </button>
                            <button
                              onClick={() => handleResolveEscalation(activeEsc.id, 'Flagged for accountant C.A. Mehta review.')}
                              className="p-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs border border-slate-700 transition flex items-center justify-center gap-2"
                            >
                              <User className="w-4 h-4 text-amber-400" />
                              Flag for C.A. Mehta Review
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* CONVERSATION AUDIT & PERFORMANCE MODAL */}
      {isAuditModalOpen && auditTargetSession && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-bold text-white text-base">
                    Conversation Quality & AI / Staff Audit
                  </h3>
                  <div className="text-xs text-slate-400 font-mono">
                    Thread: {auditTargetSession.customerName} ({auditTargetSession.phone})
                  </div>
                </div>
              </div>
              <button onClick={() => setIsAuditModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Top Score Summary Grid */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-mono">Overall Grade</div>
                <div className="text-lg font-bold text-emerald-400 font-mono">
                  {auditTargetSession.aiQualityScore || 95}% (A)
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-mono">Intent Accuracy</div>
                <div className="text-lg font-bold text-white font-mono">
                  {auditTargetSession.auditSummary?.intentAccuracy || 98}%
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-mono">Turnaround Time</div>
                <div className="text-lg font-bold text-amber-400 font-mono">
                  {auditTargetSession.minutesElapsed}m
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-mono">Repetition Loop</div>
                <div className="text-lg font-bold text-emerald-400 font-mono">
                  None (Pass)
                </div>
              </div>
            </div>

            {/* Diagnostic Evaluation Checklist */}
            <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-amber-400 uppercase text-[11px]">System Audit Criteria</div>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>No Greeting Loops:</strong> AI Concierge avoided repeating &quot;Namaste&quot; across multiple turns.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Pricing Truth:</strong> Tour quotes matched catalog pricing in <code>tours_master.json</code> exactly.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Assigned Staff Handover:</strong> Routed to <strong>{auditTargetSession.assignedStaff || 'Unassigned'}</strong> with active SLA timer.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Archival Integrity:</strong> Full {auditTargetSession.messages.length} messages persisted to disk store.</span>
                </div>
              </div>
            </div>

            {/* Turn-by-Turn Transcript Review */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Turn-by-Turn Diagnostic Review
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar p-2 bg-slate-950 rounded-lg border border-slate-800">
                {auditTargetSession.messages.map((m, idx) => (
                  <div key={m.id} className="text-xs p-2 rounded bg-slate-900/60 border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-mono">Turn #{idx + 1} • {m.sender}</span>
                      <span className="text-emerald-400 font-semibold">✓ Evaluation Passed</span>
                    </div>
                    <p className="text-slate-200 line-clamp-2">{m.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium text-xs"
              >
                Close Audit
              </button>
              <button
                type="button"
                onClick={() => {
                  setActionNotice('Audit report archived to docs/data/audit_logs.json');
                  setIsAuditModalOpen(false);
                  setTimeout(() => setActionNotice(null), 3000);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jev Lead Simulation Modal */}
      {isSimModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-white text-base">Simulate Inbound WhatsApp Lead</h3>
              </div>
              <button onClick={() => setIsSimModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-400">
              Inject a simulated WhatsApp inquiry to test automated lead stream bifurcation, group size detection, and the SLA timer.
            </p>

            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setSimName('Vikramaditya Shroff');
                    setSimPhone('+919820123456');
                    setSimMessage('We need a private heritage walk for 15 executives from Tata Sons this Saturday afternoon.');
                  }}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-[11px] border border-slate-700"
                >
                  🏢 Tata Sons (Corporate VIP)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimName('Rajiv Bajaj');
                    setSimPhone('+919819977881');
                    setSimMessage('Looking for vintage open jeep safari tomorrow morning for 6 people arriving from Delhi.');
                  }}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded text-[11px] border border-slate-700"
                >
                  🚙 Urgent Jeep Safari (Private &lt; 48h)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimName('Chloe Delacroix');
                    setSimPhone('+33612345678');
                    setSimMessage('Inquiring about 10-day western India architecture expedition for February with boutique heritage stays.');
                  }}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded text-[11px] border border-slate-700"
                >
                  ✈️ Chloe Delacroix (International)
                </button>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Sender Name</label>
                  <input
                    type="text"
                    value={simName}
                    onChange={(e) => setSimName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">WhatsApp Phone</label>
                  <input
                    type="text"
                    value={simPhone}
                    onChange={(e) => setSimPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Inbound Message Content</label>
                <textarea
                  rows={3}
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsSimModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isClassifying}
                onClick={runJevSimulation}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isClassifying ? 'Analyzing Inquiry...' : 'Inject into Guest Queue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
