import {Routes,Route,Navigate} from 'react-router-dom';
import Shell from './Shell';import {Login,Register,OAuth2Redirect,Onboarding,RequireAuth} from './auth';import LandingPage from './components/LandingPage';
import {Dashboard,Discover,MyProjects} from './pages1';import ProjectPage from './ProjectPage';
import {CreateProject,Requests,Notifications,Events,Profile,Skills} from './pages2';
export default function App(){return(<Routes>
 <Route path="/" element={<LandingPage/>}/><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/><Route path="/auth/oauth2/redirect" element={<OAuth2Redirect/>}/><Route path="/onboarding" element={<RequireAuth><Onboarding/></RequireAuth>}/>
 {/* Project workspace is full-screen: deliberately OUTSIDE the sidebar/top-bar layout */}
 <Route path="/projects/:id" element={<RequireAuth><ProjectPage/></RequireAuth>}/>
 <Route element={<RequireAuth><Shell/></RequireAuth>}>
  <Route path="/dashboard" element={<Dashboard/>}/><Route path="/discover/projects" element={<Discover/>}/><Route path="/projects/my-projects" element={<MyProjects/>}/>
  <Route path="/projects/create" element={<CreateProject/>}/><Route path="/requests" element={<Requests/>}/><Route path="/notifications" element={<Notifications/>}/>
  <Route path="/events" element={<Events/>}/><Route path="/skills" element={<Skills/>}/><Route path="/profile" element={<Profile/>}/>
 </Route><Route path="*" element={<Navigate to="/dashboard" replace/>}/></Routes>)}
