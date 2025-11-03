/* admin-dashboard.js — KPIs del doc + autocierre 1h + RT */
const LS_KEY='stoqing_reservas_v2', LS_TABLES='stoqing_tables_v2', LS_USER='stoqing_user_v2';
const LIMA_TZ='America/Lima';
const bc=new BroadcastChannel('stoqing');

const DEFAULT_TABLES=[{num:1,capacidad:2,ubicacion:'salon'},{num:2,capacidad:2,ubicacion:'salon'},{num:3,capacidad:2,ubicacion:'segundo_piso'},{num:4,capacidad:2,ubicacion:'segundo_piso'},{num:5,capacidad:4,ubicacion:'salon'},{num:6,capacidad:4,ubicacion:'salon'},{num:7,capacidad:4,ubicacion:'salon'},{num:8,capacidad:4,ubicacion:'segundo_piso'},{num:9,capacidad:4,ubicacion:'segundo_piso'},{num:10,capacidad:6,ubicacion:'salon'},{num:11,capacidad:6,ubicacion:'salon'},{num:12,capacidad:6,ubicacion:'segundo_piso'},{num:13,capacidad:6,ubicacion:'segundo_piso'},{num:14,capacidad:8,ubicacion:'salon'},{num:15,capacidad:8,ubicacion:'segundo_piso'}];

const RESERVATION_STATES={PEND_PAGO:'pendiente_pago',CANCELADA:'cancelada',PROGRAMADA:'programada',EN_CURSO:'en_curso',FINALIZADA:'finalizada'};
function statusLabel(s){switch(s){
  case 'pendiente_pago': return 'Pendiente de pago';
  case 'cancelada': return 'Cancelada';
  case 'programada': return 'Programada';
  case 'en_curso': return 'En curso';
  case 'finalizada': return 'Finalizada';
  default: return s||'-';
}}
function slotDisplay(s){ if(!s)return'-'; const[hh,mm]=s.split(':').map(Number); const h12=hh%12===0?12:hh%12; return `${h12}:${String(mm).padStart(2,'0')} ${hh<12?'AM':'PM'}`; }

function nowLima(){ return new Date(new Date().toLocaleString('en-US',{timeZone:LIMA_TZ})); }
function limaDateTime(iso,hhmm){ return new Date(`${iso}T${hhmm}:00-05:00`); }

function initStorage(){ if(!localStorage.getItem(LS_KEY)) localStorage.setItem(LS_KEY,JSON.stringify([])); if(!localStorage.getItem(LS_TABLES)) localStorage.setItem(LS_TABLES,JSON.stringify(DEFAULT_TABLES)); }
function getReservas(){ try{return JSON.parse(localStorage.getItem(LS_KEY)||'[]')}catch{return[]} }
function saveReservas(arr){ localStorage.setItem(LS_KEY,JSON.stringify(arr)); try{ bc.postMessage({key:'reservas',ts:Date.now()}); }catch{} }
function getTables(){ try{return JSON.parse(localStorage.getItem(LS_TABLES)||'[]')}catch{return DEFAULT_TABLES} }
function getUser(){ try{return JSON.parse(localStorage.getItem(LS_USER)||'null')}catch{return null} }

bc.onmessage=()=>{ autoUpdateReservationStates(); renderAdmin(); };

/* Reglas automáticas del doc + autocierre 1h */ /* :contentReference[oaicite:5]{index=5} */
function autoUpdateReservationStates(){
  const now=new Date(); const arr=getReservas(); let changed=false;
  for(const r of arr){
    // 15m sin pagar => cancelada
    if(r.estado===RESERVATION_STATES.PEND_PAGO && r.pagoLimite && new Date(r.pagoLimite)<now){ r.estado=RESERVATION_STATES.CANCELADA; r.cancelledReason='timeout_pago_15m'; changed=true; }
    // No show: 10m después de la hora
    if(r.estado===RESERVATION_STATES.PROGRAMADA){
      const slot = limaDateTime(r.fecha,r.hora);
      const deadline = new Date(slot.getTime()+10*60*1000);
      if(deadline<now && !r.iniciadaAt){ r.estado=RESERVATION_STATES.CANCELADA; r.cancelledReason='no_show_10m'; changed=true; }
    }
    // ⏰ Autocierre a 1h
    if(r.estado===RESERVATION_STATES.EN_CURSO && r.iniciadaAt){
      if(now - new Date(r.iniciadaAt) >= 60*60*1000){ r.estado=RESERVATION_STATES.FINALIZADA; r.finalizadaAt=new Date().toISOString(); r.autoClosed='1h_autofinalizada'; changed=true; }
    }
  }
  if(changed) saveReservas(arr);
}

function sweepMaintenance(){
  const t=getTables(); let ch=false, now=Date.now();
  for(const tb of t){ if(tb.manual==='mantenimiento' && tb.mantenimientoHasta && new Date(tb.mantenimientoHasta).getTime()<=now){ delete tb.manual; delete tb.mantenimientoHasta; ch=true; } }
  if(ch) localStorage.setItem(LS_TABLES,JSON.stringify(t));
}

function setupAdminDashboard(){
  const user=getUser(); if(!user||!user.logged){ window.location.href='admin-login.html'; return; }
  const adminDate=document.getElementById('adminDate'), logoutBtn=document.getElementById('logoutBtn'), mesasBtn=document.getElementById('mesasBtn');
  if(adminDate){ const n=nowLima(); const iso=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`; adminDate.value=iso; adminDate.addEventListener('change',renderAdmin); }
  if(logoutBtn){ logoutBtn.addEventListener('click',e=>{ e.preventDefault(); if(confirm('¿Cerrar sesión y salir del panel administrativo?')){ localStorage.setItem(LS_USER,JSON.stringify({username:null,logged:false})); sessionStorage.clear(); setTimeout(()=>{ window.location.href='admin-login.html'; },200); } }); }
  if(mesasBtn){ mesasBtn.addEventListener('click',()=>{ mesasBtn.textContent='Cargando...'; mesasBtn.disabled=true; setTimeout(()=>{ window.location.href='mesas-reservas.html'; },300); }); }
  autoUpdateReservationStates(); sweepMaintenance(); renderAdmin();
  setInterval(()=>{ autoUpdateReservationStates(); sweepMaintenance(); renderAdmin(); },5_000);
  setInterval(updateCountdowns,1_000);
  window.addEventListener('storage',e=>{ if(e.key===LS_KEY||e.key===LS_TABLES){ autoUpdateReservationStates(); sweepMaintenance(); renderAdmin(); } });
}

function renderAdmin(){
  const date=document.getElementById('adminDate')?.value || (()=>{
    const n=nowLima(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
  })();

  const reservas=getReservas();
  const canceladas = reservas.filter(r=>r.estado===RESERVATION_STATES.CANCELADA  && r.fecha===date).length;
  const programadas= reservas.filter(r=>r.estado===RESERVATION_STATES.PROGRAMADA && r.fecha===date).length;
  const enCurso    = reservas.filter(r=>r.estado===RESERVATION_STATES.EN_CURSO   && r.fecha===date).length;
  const finalizadas= reservas.filter(r=>r.estado===RESERVATION_STATES.FINALIZADA && r.fecha===date).length;

  updateKPIValue('kpiCanceladas',canceladas);
  updateKPIValue('kpiProgramadas',programadas);
  updateKPIValue('kpiEnCurso',enCurso);
  updateKPIValue('kpiFinalizadas',finalizadas);

  const porAsignar=getPorAsignar(date);
  updateKPIValue('kpiMesasPorAsignar',porAsignar.length);

  const pendPago=reservas.filter(r=>r.estado===RESERVATION_STATES.PEND_PAGO && r.fecha===date).sort((a,b)=>(a.pagoLimite||'').localeCompare(b.pagoLimite||''));
  renderPendingAcceptance(pendPago);
  renderPorAsignarList(porAsignar);
}
function getPorAsignar(date){
  const tables=getTables(); const reservas=getReservas().filter(r=>r.fecha===date && (r.estado==='pendiente_pago'||r.estado==='programada'));
  const needs=[]; for(const r of reservas){ const t=tables.find(x=>String(x.num)===String(r.mesa)); if(!r.mesa || (t&&t.manual==='mantenimiento')) needs.push(r); }
  return needs;
}
function updateKPIValue(id,val){ const el=document.getElementById(id); if(!el) return; const cur=parseInt(el.textContent)||0; if(cur!==val){ el.style.transform='scale(1.1)'; el.textContent=val; setTimeout(()=>{ el.style.transform='scale(1)'; },200); } }

function renderPendingAcceptance(items){
  const root=document.getElementById('pendientesAccept'); if(!root) return; root.innerHTML='';
  if(items.length===0){ root.innerHTML='<div class="empty-state">No hay solicitudes pendientes para la fecha seleccionada.</div>'; return; }
  items.forEach((r,i)=>{
    const div=document.createElement('div'); div.className='reservation-item'; div.style.animationDelay=`${i*0.1}s`;
    div.innerHTML=`
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <div><strong>${r.cod}</strong> — ${r.nombre} ${r.apellido}</div>
          <div class="small-muted">${slotDisplay(r.hora)} — ${r.personas} persona${r.personas>1?'s':''}</div>
          <div class="small-muted">Garantía: S/ ${(r.garantia ?? (r.personas*5).toFixed(2))} — Acepta pagar: <strong>${r.aceptaGarantia?'Sí':'No'}</strong></div>
          <div class="small-muted">Tiempo restante: <strong class="countdown" data-deadline="${r.pagoLimite||''}">–</strong></div>
          ${r.comentarios?`<div class="small-muted mt-1">💬 ${r.comentarios}</div>`:''}
        </div>
      </div>
      <div class="mt-2 d-flex gap-2 flex-wrap">
        <button class="btn btn-sm btn-success" type="button" onclick="confirmarPago('${r.id}')">✓ Aceptar</button>
        <button class="btn btn-sm btn-danger"  type="button" onclick="denegarSolicitud('${r.id}')">✗ Denegar</button>
        <button class="btn btn-sm btn-outline-dark" type="button" onclick="viewReservaDetails('${r.id}')">👁 Ver</button>
      </div>`;
    root.appendChild(div);
  });
  updateCountdowns();
}
function updateCountdowns(){
  const nodes=document.querySelectorAll('.countdown[data-deadline]'); const now=new Date();
  nodes.forEach(el=>{ const d=el.getAttribute('data-deadline'); if(!d){ el.textContent='—'; return; }
    const diff=new Date(d)-now; if(diff<=0){ el.textContent='vencido'; el.style.color='#dc3545'; return; }
    const m=Math.floor(diff/60000), s=Math.floor((diff%60000)/1000);
    el.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; el.style.color=m<2?'#dc3545':'#111';
  });
}
function renderPorAsignarList(items){
  const root=document.getElementById('porAsignarList'); if(!root) return; root.innerHTML='';
  if(items.length===0){ root.innerHTML='<div class="empty-state">Todo listo: no hay reservas que requieran asignación.</div>'; return; }
  for(const r of items){
    const div=document.createElement('div'); div.className='reservation-item';
    const cause=r.mesa?'Mesa en mantenimiento':'Sin mesa asignada';
    div.innerHTML=`<div><strong>${r.cod}</strong> — ${r.nombre} ${r.apellido} <span class="small-muted">(${cause})</span></div>
      <div class="small-muted">${slotDisplay(r.hora)} · ${r.personas} persona(s) · Mesa actual: ${r.mesa||'-'}</div>
      <div style="margin-top:8px">
        <button class="btn btn-sm btn-dark" type="button" onclick="openAssignModal('${r.id}')">📍 Reasignar mesa</button>
        <button class="btn btn-sm btn-outline-dark" type="button" onclick="viewReservaDetails('${r.id}')">Ver</button>
      </div>`;
    root.appendChild(div);
  }
}

/* Acciones */
function confirmarPago(id){
  const arr=getReservas(); const idx=arr.findIndex(r=>String(r.id)===String(id)); if(idx===-1) return;
  if(!confirm('¿Confirmar pago recibido e INICIAR la reserva?')) return;
  arr[idx].estado=RESERVATION_STATES.EN_CURSO; arr[idx].pagoConfirmadoAt=new Date().toISOString(); arr[idx].iniciadaAt=new Date().toISOString();
  saveReservas(arr); renderAdmin();
}
function denegarSolicitud(id){ if(!confirm('¿Denegar esta solicitud de reserva?')) return;
  const arr=getReservas(); const idx=arr.findIndex(r=>String(r.id)===String(id)); if(idx===-1) return;
  arr[idx].estado=RESERVATION_STATES.CANCELADA; arr[idx].cancelledReason='denegada_operario'; arr[idx].denegadaAt=new Date().toISOString();
  saveReservas(arr); renderAdmin();
}
function viewReservaDetails(id){
  const r=getReservas().find(x=>String(x.id)===String(id)); if(!r) return;
  alert(`📋 DETALLES DE RESERVA
Código: ${r.cod}
Cliente: ${r.nombre} ${r.apellido}
DNI: ${r.dni} | Tel: ${r.telefono} | Email: ${r.correo}
Fecha: ${new Date(r.fecha+'T00:00:00').toLocaleDateString('es-PE',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
Hora: ${slotDisplay(r.hora)} | Personas: ${r.personas} | Mesa: ${r.mesa||'-'}
Garantía: S/ ${(r.garantia ?? (r.personas*5).toFixed(2))}
Estado: ${statusLabel(r.estado)}
${r.comentarios?('Comentarios: '+r.comentarios):''}`.trim());
}

/* Modal asignación */
function openAssignModal(reservaId){
  window.assignTargetReservaId=reservaId;
  const modal=document.getElementById('assignModal'), ubic=document.getElementById('assignUbic'), mesaSel=document.getElementById('assignMesa');
  const arr=getReservas(); const r=arr.find(x=>String(x.id)===String(reservaId)); if(!modal||!ubic||!mesaSel||!r) return;
  const tPrev=getTables().find(t=>String(t.num)===String(r.mesa)); if(tPrev){ ubic.value=tPrev.ubicacion; } else { ubic.value='salon'; }
  fillMesaSelect(ubic.value,r.fecha,r.hora,mesaSel); modal.style.display='flex'; ubic.onchange=()=>fillMesaSelect(ubic.value,r.fecha,r.hora,mesaSel);
  document.getElementById('assignCancel').onclick=()=>{ modal.style.display='none'; window.assignTargetReservaId=null; };
  document.getElementById('assignSave').onclick=()=>{
    const val=mesaSel.value; if(!val) return;
    const idx=arr.findIndex(x=>String(x.id)===String(reservaId));
    arr[idx].mesa=Number(val); if(arr[idx].estado!==RESERVATION_STATES.PEND_PAGO) arr[idx].estado=RESERVATION_STATES.PROGRAMADA;
    arr[idx].assignedAt=new Date().toISOString(); saveReservas(arr); modal.style.display='none'; renderAdmin();
  };
}
function fillMesaSelect(ubic,date,slot,sel){
  sel.innerHTML=''; const t=getTables().filter(x=>x.ubicacion===ubic && x.manual!=='mantenimiento'); let c=0;
  for(const tb of t){ if(isTableAvailableForSlot(tb.num,date,slot)){ const op=document.createElement('option'); op.value=tb.num; op.textContent=`Mesa ${tb.num} (cap.: ${tb.capacidad})`; sel.appendChild(op); c++; } }
  if(c===0){ const op=document.createElement('option'); op.value=''; op.textContent=`No hay mesas disponibles en ${ubic==='salon'?'Salón':'Segundo piso'}`; sel.appendChild(op); }
}
function isTableAvailableForSlot(tableNum,dateIso,slotTime){
  const tbs=getTables(); const t=tbs.find(x=>String(x.num)===String(tableNum)); if(t&&t.manual==='mantenimiento') return false;
  const rs=getReservas(); const blocking=[RESERVATION_STATES.PROGRAMADA,RESERVATION_STATES.EN_CURSO,RESERVATION_STATES.PEND_PAGO];
  return !rs.some(r=>r.fecha===dateIso && r.hora===slotTime && String(r.mesa)===String(tableNum) && blocking.includes(r.estado));
}

document.addEventListener('DOMContentLoaded',()=>{ try{ initStorage(); setupAdminDashboard(); }catch(e){ console.error(e); } });
window.confirmarPago=confirmarPago; window.denegarSolicitud=denegarSolicitud; window.viewReservaDetails=viewReservaDetails; window.openAssignModal=openAssignModal; window.renderAdmin=renderAdmin;
