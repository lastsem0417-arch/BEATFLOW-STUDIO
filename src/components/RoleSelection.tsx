import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import AuthModal from "./AuthModal";
import { useAuth } from "../context/AuthContext";

const roles = [
{
id: "rapper",
title: "RAPPER",
image: "/images/rapper.jpg",
gradient: "from-purple-900 via-black to-black",
desc: "Vocal tracking. AI auto-mix. Beat discovery."
},

{
id: "producer",
title: "PRODUCER",
image: "/images/producer.jpg",
gradient: "from-emerald-900 via-black to-black",
desc: "Upload beats. Stem management. Collab network."
},

{
id: "lyricist",
title: "LYRICIST",
image: "/images/lyricist.jpg",
gradient: "from-yellow-900 via-black to-black",
desc: "Writing pads. Rhythm analysis. Vocal matching."
},

{
id: "listener",
title: "LISTENER",
image: "/images/listener.jpg",
gradient: "from-blue-900 via-black to-black",
desc: "Discover tracks. Support artists. Vibe on the Global Feed."
}
];

export default function RoleSelection() {

const containerRef = useRef(null);
const navigate = useNavigate();
const { login } = useAuth();

const [showAuth,setShowAuth] = useState(false);
const [selectedRole,setSelectedRole] = useState("");

useEffect(()=>{

let ctx = gsap.context(()=>{

gsap.fromTo(
".role-header",
{opacity:0,y:-40,filter:"blur(10px)"},
{opacity:1,y:0,filter:"blur(0px)",duration:1.4,ease:"power4.out"}
);

gsap.fromTo(
".role-card",
{y:120,opacity:0},
{y:0,opacity:1,stagger:0.15,duration:1.2,ease:"power4.out",delay:0.3}
);

},containerRef);

return ()=> ctx.revert();

},[]);

const handleRoleClick=(roleTitle)=>{

setSelectedRole(roleTitle);
setShowAuth(true);

};

const handleAuthSuccess=(data)=>{

const userData = {
...(data.user || data),
token:data.token
};

login(userData);
setShowAuth(false);

const roleStr=(userData.role || selectedRole).toLowerCase();

setTimeout(()=>{

if(roleStr==="listener"){
navigate("/feed");
}
else{
navigate(`/studio/${roleStr}`);
}

},100);

};

return (

<div
ref={containerRef}
className="min-h-screen w-full flex flex-col items-center justify-center bg-[#050505] px-8 relative overflow-hidden"
>

{showAuth && (
<AuthModal
role={selectedRole}
onClose={()=>setShowAuth(false)}
onSuccess={handleAuthSuccess}
/>
)}

<h2 className="role-header font-serif text-sm tracking-[0.4em] text-neutral-500 uppercase mb-12 text-center">
Define Your Space
</h2>

<div className="flex w-full max-w-7xl flex-col md:flex-row gap-5 h-[70vh]">

{roles.map((role,index)=>(
  
<div
key={role.id}
onClick={()=>handleRoleClick(role.title)}
className="role-card group relative flex-1 cursor-pointer overflow-hidden border border-neutral-800/40 rounded-xl transition-all duration-[900ms] hover:flex-[1.4]"
>

{/* Background Container */}

<div className="absolute inset-0">

{/* Image Background */}

<img
src={role.image}
alt={role.title}
onError={(e)=>{e.currentTarget.style.display="none"}}
className="h-full w-full object-cover opacity-40 group-hover:scale-110 transition duration-[1500ms]"
/>

{/* Gradient fallback */}

<div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-80`} />

</div>

{/* Dark overlay */}

<div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition duration-500" />

{/* Index */}

<div className="absolute top-8 left-8 font-mono text-xs text-neutral-500 group-hover:text-white transition">
0{index+1}
</div>

{/* Title */}

<div className="absolute bottom-16 left-8 transition-transform duration-700 group-hover:-translate-y-6">

<h3 className="font-serif text-3xl md:text-4xl lg:text-5xl text-neutral-400 group-hover:text-emerald-400 transition">

{role.title}

</h3>

</div>

{/* Description */}

<div className="absolute bottom-8 left-8 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700">

<p className="max-w-[85%] text-xs md:text-sm text-neutral-300 tracking-wide">

{role.desc}

</p>

</div>

</div>

))}

</div>

</div>

);

}