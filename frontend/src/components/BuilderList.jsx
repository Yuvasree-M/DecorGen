
import React,{useEffect,useState} from "react";
import { apiFetch } from "../services/api";

export default function BuilderList(){

  const [builders,setBuilders] = useState([]);

  useEffect(()=>{
    const load = async ()=>{
      const data = await apiFetch("/api/builders");
      setBuilders(data || []);
    };
    load();
  },[]);

  return (
    <div>
      <h2>Builders</h2>
      {builders.map(b=>(
        <div key={b.id} style={{border:"1px solid #ddd",padding:"10px",margin:"10px"}}>
          <h3>{b.name}</h3>
          <p>{b.location}</p>
        </div>
      ))}
    </div>
  );
}
