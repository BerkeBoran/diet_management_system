const Ico = ({ d, size = 18, fill = "none", stroke = "currentColor", sw = 1.6, children, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {d && <path d={d} />}
    {children}
  </svg>
);

const Icons = {
  Sparkle:     (p) => <Ico {...p}><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6zM19 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z"/></Ico>,
  Leaf:        (p) => <Ico {...p}><path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 9-9h6v6c0 5-4 9-9 9zM4 20l11-11"/></Ico>,
  Stethoscope: (p) => <Ico {...p}><path d="M4 4v5a4 4 0 0 0 8 0V4M8 13v3a5 5 0 0 0 10 0v-1"/><circle cx="18" cy="11" r="2"/></Ico>,
  Chat:        (p) => <Ico {...p}><path d="M21 12a8 8 0 1 1-3.4-6.5L21 4l-1.5 3.4A8 8 0 0 1 21 12z"/><circle cx="9" cy="12" r=".5" fill="currentColor"/><circle cx="13" cy="12" r=".5" fill="currentColor"/><circle cx="17" cy="12" r=".5" fill="currentColor"/></Ico>,
  Calendar:    (p) => <Ico {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></Ico>,
  ArrowRight:  (p) => <Ico {...p}><path d="M5 12h14M13 6l6 6-6 6"/></Ico>,
  ArrowUpRight:(p) => <Ico {...p}><path d="M7 17 17 7M9 7h8v8"/></Ico>,
  Plus:        (p) => <Ico {...p}><path d="M12 5v14M5 12h14"/></Ico>,
  Minus:       (p) => <Ico {...p}><path d="M5 12h14"/></Ico>,
  Check:       (p) => <Ico {...p}><path d="M5 12l5 5L20 7"/></Ico>,
  Bolt:        (p) => <Ico {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/></Ico>,
  Heart:       (p) => <Ico {...p}><path d="M12 21s-7-4.5-9.5-9C1 8.5 3.5 4 8 4c2 0 3.5 1 4 2 .5-1 2-2 4-2 4.5 0 7 4.5 5.5 8-2.5 4.5-9.5 9-9.5 9z"/></Ico>,
  Apple:       (p) => <Ico {...p}><path d="M16 8c-1.5 0-3 1-4 1s-2.5-1-4-1c-2 0-4 2-4 5 0 4 3 8 5 8 1 0 1.5-.5 3-.5s2 .5 3 .5c2 0 5-4 5-8 0-3-2-5-4-5zM12 8V4M12 4c1.5-1 3-1 4-1"/></Ico>,
  Shield:      (p) => <Ico {...p}><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></Ico>,
  Scale:       (p) => <Ico {...p}><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M8 6V4h8v2M9 14h6"/></Ico>,
  Users:       (p) => <Ico {...p}><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15 20a4 4 0 0 1 6-3.5"/></Ico>,
  Twitter:     (p) => <Ico {...p}><path d="M22 5.8a8 8 0 0 1-2.4.7 4 4 0 0 0 1.8-2.2 8 8 0 0 1-2.6 1A4 4 0 0 0 12 9a11 11 0 0 1-8-4s-4 9 5 13a12 12 0 0 1-7 2c9 5 20 0 20-11.5v-.5A6 6 0 0 0 22 5.8z"/></Ico>,
  Instagram:   (p) => <Ico {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/></Ico>,
  Linkedin:    (p) => <Ico {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 13v4"/></Ico>,
  Youtube:     (p) => <Ico {...p}><rect x="2" y="6" width="20" height="12" rx="3"/><path d="M10 9l5 3-5 3V9z" fill="currentColor"/></Ico>,
  Search:      (p) => <Ico {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></Ico>,
  Bell:        (p) => <Ico {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></Ico>,
  LogOut:      (p) => <Ico {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Ico>,
  Menu:        (p) => <Ico {...p}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></Ico>,
  ClipboardList:(p) => <Ico {...p}><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="12" y2="16"/></Ico>,
  Star:        (p) => <Ico {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Ico>,
  Refresh:     (p) => <Ico {...p}><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></Ico>,
};

export default Icons;
