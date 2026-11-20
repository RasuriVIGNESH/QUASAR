import {useState,useEffect,useCallback} from 'react';
import {NavLink,Outlet,useLocation,useNavigate} from 'react-router-dom';
import {motion,AnimatePresence} from 'framer-motion';
import {Home,FolderKanban,Mail,Search,CalendarDays,BarChart3,User,Bell,Menu,Sun,Moon,LogOut} from 'lucide-react';
import {Avatar,Btn,Badge,useStore,Skeleton} from './ui';import {useAuth} from './auth';
import {notificationService,userService} from './services';import {list,body,nNotif,fullName,errMsg} from './lib';
const NAV=[['Work',[['/dashboard','Dashboard',Home],['/projects/my-projects','My Projects',FolderKanban],['/requests','Requests',Mail]]],['Discover',[['/discover/projects','Discover Projects',Search],['/events','Events',CalendarDays]]],['Workspace',[['/skills','Skills',BarChart3]]],['Account',[['/profile','Profile',User]]]];
const TITLES={'/dashboard':'Dashboard','/discover/projects':'Discover projects','/projects/my-projects':'My projects','/projects/create':'Create project','/requests':'Requests','/notifications':'Notifications','/events':'Events','/skills':'Skills','/profile':'Profile'};
export default function Shell(){
 const loc=useLocation(),nav=useNavigate(),{say,confirm}=useStore(),{user,setUser,logout}=useAuth(),[menu,setMenu]=useState(false),[bell,setBell]=useState(false),[unread,setUnread]=useState(0),[items,setItems]=useState(null);
 const [dark,setDark]=useState(()=>{try{const t=localStorage.getItem('qt');if(t)return t==='dark'}catch{}return matchMedia('(prefers-color-scheme: dark)').matches});
 useEffect(()=>{document.documentElement.classList.toggle('dark',dark);try{localStorage.setItem('qt',dark?'dark':'light')}catch{}},[dark]);
 useEffect(()=>{setMenu(false);setBell(false);scrollTo(0,0)},[loc.pathname]);
 const count=useCallback(async()=>{try{const b=body(await notificationService.getUnreadCount());setUnread(Number(b?.unreadCount??b)||0)}catch{}},[]);
 useEffect(()=>{count();const t=setInterval(count,30000);return()=>clearInterval(t)},[count]);
 const openBell=async()=>{setBell(b=>!b);if(!bell){setItems(null);try{setItems(list(await notificationService.getNotifications({size:8})).map(nNotif))}catch(e){setItems([]);say(errMsg(e))}}};
 const open=async n=>{if(!n.read){setItems(x=>x.map(i=>i.id===n.id?{...i,read:true}:i));setUnread(u=>Math.max(0,u-1));notificationService.markAsRead(n.id).catch(()=>{})}nav(n.to)};
 const readAll=async()=>{setItems(x=>x?.map(i=>({...i,read:true})));setUnread(0);try{await notificationService.markAllAsRead();say('All marked as read')}catch(e){count();say(errMsg(e))}};
 const free=(user?.availabilityStatus||'AVAILABLE')==='AVAILABLE';
 const toggleFree=async()=>{const next=free?'BUSY':'AVAILABLE';setUser(u=>({...u,availabilityStatus:next}));try{await userService.updateAvailabilityStatus(next);say(`You’re now ${next==='AVAILABLE'?'available':'busy'}`)}catch(e){setUser(u=>({...u,availabilityStatus:free?'AVAILABLE':'BUSY'}));say(errMsg(e))}};
 return <div className="min-h-screen">
  {menu&&<div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={()=>setMenu(false)}/>}
  <aside className={`fixed inset-y-0 left-0 z-40 w-60 overflow-auto border-r border-line bg-surface p-3 transition-transform lg:translate-x-0 ${menu?'':'-translate-x-full'}`}>
   <div className="flex h-16 items-center px-2.5 py-2"><img src="/logo.png" alt="Quasar" className="h-10 w-10 rounded-xl object-cover"/><span className="ml-2 text-lg font-semibold text-ink">Quasar</span></div>
   {NAV.map(([s,its])=><div key={s}><div className="px-2.5 pb-1 pt-4 text-xs font-medium text-quiet">{s}</div>{its.map(([to,l,I])=><NavLink key={to} to={to} className={({isActive})=>`flex min-h-10 items-center gap-2.5 rounded-md px-2.5 font-medium ${isActive?'bg-tint text-brand':'hover:bg-bg'}`}><I size={16}/>{l}</NavLink>)}</div>)}
  </aside>
   <div className="lg:ml-60">
   <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-line bg-surface px-4 sm:gap-3 sm:px-8">
    <Btn v="g" s className="lg:hidden" aria-label="Open menu" onClick={()=>setMenu(true)}><Menu size={18}/></Btn>
    <b className="text-ink">{TITLES[loc.pathname]||''}</b><span className="flex-1"/>
    <button onClick={toggleFree} title="Change availability" className="hidden min-h-9 items-center gap-1.5 rounded-md px-2 text-xs text-muted hover:bg-bg sm:flex"><span className={`h-2 w-2 rounded-full ${free?'bg-ok':'bg-wn'}`}/>{free?'Available':'Busy'}</button>
    <Btn s onClick={()=>setDark(d=>!d)} aria-label="Toggle light or dark mode">{dark?<Sun size={16}/>:<Moon size={16}/>}</Btn>
    <div className="relative"><Btn s onClick={openBell} aria-label={`Notifications, ${unread} unread`}><Bell size={16}/>{unread>0&&<Badge tone="in">{unread}</Badge>}</Btn>
     <AnimatePresence>{bell&&<><div className="fixed inset-0 z-40" onClick={()=>setBell(false)}/><motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:.15}} className="absolute right-0 top-11 z-50 w-[360px] max-w-[calc(100vw-32px)] overflow-hidden rounded-lg border border-line bg-surface shadow-lg">
      <div className="flex items-center justify-between border-b border-line px-4 py-2"><b className="text-ink">Notifications</b><Btn v="g" s onClick={readAll} disabled={!unread}>Mark all as read</Btn></div>
      {!items?<div className="p-3"><Skeleton n={3} h={44}/></div>:items.length?items.map(n=><button key={n.id} onClick={()=>open(n)} className={`block w-full border-b border-line px-4 py-3 text-left hover:bg-bg ${n.read?'':'bg-tint'}`}><div className="font-medium text-ink">{n.title}</div><div className="text-xs text-muted">{n.text} · {n.time}</div></button>):<p className="px-4 py-8 text-center">You’re all caught up.</p>}
      <button onClick={()=>nav('/notifications')} className="min-h-11 w-full text-center font-medium text-brand hover:bg-bg">View all notifications</button></motion.div></>}</AnimatePresence></div>
    <Btn v="g" s onClick={async()=>{if(await confirm({title:'Sign out of Quasar?',text:'You can sign in again any time.',label:'Sign out',danger:true})){await logout();nav('/login')}}} aria-label="Sign out" title="Sign out"><Avatar name={fullName(user)} size={28} src={user?.profilePictureUrl}/><LogOut size={14}/></Btn>
   </header>
   <motion.main key={loc.pathname} initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} transition={{duration:.15}} className="mx-auto max-w-[1280px] px-4 pb-16 pt-7 sm:px-8"><Outlet/></motion.main>
  </div></div>}
