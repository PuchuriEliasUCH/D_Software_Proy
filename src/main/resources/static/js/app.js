/* app.js - Versión extendida para StoqING
   Funcionalidades añadidas:
   - Reserva como 'pendiente_aceptacion' al enviar solicitud
   - Modal de confirmación
   - Slots mostrados debajo del calendario (en reservas.html)
   - DNI/Teléfono sólo números y maxlength
   - Comentarios
   - Dashboard con login (admin/admin)
   - Asignar mesa (salon, segundo_piso, jardin)
   - Colores de mesa (libre/ocupado/reservado/mantenimiento)
   - Reglas: duración 2h, gap 30min entre reservas por mesa
   - Resumen e impresión (window.print)
*/

const PRICE_PER_PERSON = 10.00;
const LS_KEY = 'stoqing_reservas_v2';
const LS_TABLES = 'stoqing_tables_v2';
const LS_USER = 'stoqing_user_v2';

// default tables (agregué ubicaciones incluyendo segundo_piso y jardin)
const DEFAULT_TABLES = [
    { num: 1, capacidad: 2, ubicacion: 'salon' },
    { num: 2, capacidad: 4, ubicacion: 'salon' },
    { num: 3, capacidad: 4, ubicacion: 'segundo_piso' },
    { num: 4, capacidad: 6, ubicacion: 'jardin' },
    { num: 5, capacidad: 8, ubicacion: 'salon' }
];

const RESERVATION_STATES = {
    PEND_ACEPT: 'pendiente_aceptacion',
    PEND_PAGO: 'pendiente_pago',
    CANCELADA: 'cancelada',
    PEND_ASIGN: 'pendiente_asignacion',
    PROGRAMADA: 'programada',
    EN_CURSO: 'en_curso',
    FINALIZADA: 'finalizada'
};

// ---------- Storage helpers ----------
function initStorage(){
    if(!localStorage.getItem(LS_KEY)) localStorage.setItem(LS_KEY, JSON.stringify([]));
    if(!localStorage.getItem(LS_TABLES)) localStorage.setItem(LS_TABLES, JSON.stringify(DEFAULT_TABLES));
}
function getReservas(){ return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
function saveReservas(arr){ localStorage.setItem(LS_KEY, JSON.stringify(arr)); }
function getTables(){ return JSON.parse(localStorage.getItem(LS_TABLES) || '[]'); }
function saveUser(user){ localStorage.setItem(LS_USER, JSON.stringify(user)); }
function getUser(){ return JSON.parse(localStorage.getItem(LS_USER) || 'null'); }

// ---------- Time helpers ----------
function parseTimeToMinutes(hhmm){
    const [h,m] = hhmm.split(':').map(Number);
    return h*60 + m;
}
function minutesToHHMM(min){
    const h = Math.floor(min/60);
    const m = min % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}
function addMinutesToTimeStr(hhmm, minutesToAdd){
    const m = parseTimeToMinutes(hhmm) + minutesToAdd;
    const dayMinutes = ((m % (24*60)) + (24*60)) % (24*60);
    return minutesToHHMM(dayMinutes);
}
function slotDisplay(slot){
    const [hh,mm] = slot.split(':').map(Number);
    const hour12 = hh % 12 === 0 ? 12 : hh % 12;
    const ampm = hh < 12 ? 'AM' : 'PM';
    return `${hour12}:${mm.toString().padStart(2,'0')} ${ampm}`;
}

// ---------- Slots generation ----------
function generateSlots(){
    const slots = [];
    for(let h=10; h<=21; h++){
        slots.push(`${String(h).padStart(2,'0')}:00`);
        slots.push(`${String(h).padStart(2,'0')}:30`);
    }
    return slots;
}

// ---------- Availability check per table ----------
/*
 Rules:
  - reservation duration: 2 hours (120 minutes)
  - gap between bookings in same table: 30 minutes
  - when checking a candidate slot, ensure no existing reservations (in states scheduled/programada/pendiente_asignacion?) overlap
*/
function isTableAvailableForSlot(tableNum, dateIso, slotTime){
    const reservas = getReservas();
    const start = parseTimeToMinutes(slotTime);
    const end = start + 120; // 2 hours
    const gap = 30;
    // consider reservations that are in PROGRAMADA or EN_CURSO or PEND_ASIGN as blocking
    const blockingStates = [RESERVATION_STATES.PROGRAMADA, RESERVATION_STATES.EN_CURSO];
    // Also consider reservations already assigned to this table even if pending assignment -> only assigned ones (have mesa property)
    for(const r of reservas){
        if(String(r.mesa) === String(tableNum) || blockingStates.includes(r.estado)){
            if(r.fecha !== dateIso) continue;
            // if this reservation has assigned mesa equals tableNum OR is scheduled/ongoing and assigned same table
            if(r.mesa && String(r.mesa) !== String(tableNum)) {
                // if other table, ignore
            }
            // compute existing reservation interval
            const existingStart = parseTimeToMinutes(r.hora);
            const existingEnd = existingStart + 120;
            // Apply gap: existing interval expanded by gap before and after
            const existingStartWithGap = existingStart - gap;
            const existingEndWithGap = existingEnd + gap;
            // if candidate interval intersects expanded existing, not available
            if(!(end <= existingStartWithGap || start >= existingEndWithGap)){
                // If existing reservation is not assigned to a table (no r.mesa) but is pending assignment, it shouldn't block availability for a specific table.
                // But if r has assigned mesa equal to this table -> block.
                if(r.mesa && String(r.mesa) === String(tableNum)) return false;
                // Also block if reservation is PROGRAMADA or EN_CURSO (they've reserved a table already likely)
                if(blockingStates.includes(r.estado)) return false;
            }
        }
    }
    return true;
}

// Count number of tables free for a date and slotTime
function countFreeTablesForSlot(dateIso, slotTime){
    const tables = getTables();
    let free = 0;
    for(const t of tables){
        if(isTableAvailableForSlot(t.num, dateIso, slotTime)) free++;
    }
    return free;
}

// ---------- Calendar builder ----------
function buildCalendar(rootEl, year, month, onDateClick){
    rootEl.innerHTML = '';
    const header = document.createElement('div'); header.className='calendar-header';
    const monthName = document.createElement('div'); monthName.className='month';
    const btns = document.createElement('div');
    const prev = document.createElement('button'); prev.className='btn btn-sm btn-light'; prev.textContent='‹';
    const next = document.createElement('button'); next.className='btn btn-sm btn-light'; next.textContent='›';
    monthName.textContent = `${new Date(year,month).toLocaleString('es-PE',{month:'long', year:'numeric'})}`;
    btns.appendChild(prev); btns.appendChild(next);
    header.appendChild(monthName); header.appendChild(btns);
    rootEl.appendChild(header);
    const weekdays = document.createElement('div'); weekdays.className='weekdays';
    ['Dom','Lun','Mar','Mie','Jue','Vie','Sab'].forEach(w=>{
        const d = document.createElement('div'); d.textContent = w; weekdays.appendChild(d);
    });
    rootEl.appendChild(weekdays);
    const grid = document.createElement('div'); grid.className='calendar-grid';
    const firstDay = new Date(year,month,1).getDay();
    const daysInMonth = new Date(year, month+1, 0).getDate();
    for(let i=0;i<firstDay;i++){
        const empty = document.createElement('div'); empty.className='day other-month'; empty.innerHTML=''; grid.appendChild(empty);
    }
    const today = new Date(); today.setHours(0,0,0,0);
    for(let d=1; d<=daysInMonth; d++){
        const dateObj = new Date(year, month, d);
        const iso = dateObj.toISOString().slice(0,10);
        const cell = document.createElement('div'); cell.className='day card';
        cell.textContent = d;
        if(dateObj < today){
            cell.classList.add('past');
        } else {
            cell.addEventListener('click', ()=> {
                onDateClick(iso, cell);
            });
            cell.style.cursor = 'pointer';
        }
        grid.appendChild(cell);
    }
    rootEl.appendChild(grid);
    return { prev, next, monthName, grid };
}

// ---------- RESERVAS PAGE ----------
function setupReservasPage(){
    const calendarEl = document.getElementById('calendarEl');
    const slotsContainer = document.getElementById('slotsUnderCalendar');
    const form = document.getElementById('reservaForm');
    const mensajeEl = document.getElementById('mensaje');
    const resumenDiv = document.getElementById('resumenReserva');
    const resumenContenido = document.getElementById('resumenContenido');
    const modalConfirm = document.getElementById('modalConfirm');
    const modalClose = document.getElementById('modalClose');
    const imprimirBtn = document.getElementById('imprimirBtn');

    if(!calendarEl) return;

    // input numeric enforcement for dni and telefono
    const dniInput = document.getElementById('dni');
    const telInput = document.getElementById('telefono');
    [dniInput, telInput].forEach(inp=>{
        if(!inp) return;
        inp.addEventListener('input', (e)=>{
            // remove non-digits and enforce maxlength
            const max = inp.getAttribute('maxlength') || 999;
            inp.value = inp.value.replace(/\D/g,'').slice(0,max);
        });
    });

    const slots = generateSlots();
    let current = new Date();
    let month = current.getMonth();
    let year = current.getFullYear();
    let selectedDate = null;
    let selectedSlot = null;

    function renderSlotsUnderCalendar(isoDate){
        slotsContainer.innerHTML = '';
        selectedDate = isoDate;
        selectedSlot = null;
        // build a grid of slots showing number of free tables
        slots.forEach(s=>{
            const freeCount = countFreeTablesForSlot(isoDate, s);
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'slot';
            btn.textContent = `${slotDisplay(s)} — ${freeCount} mesa(s) disponible(s)`;
            if(freeCount === 0){ btn.classList.add('disabled'); btn.disabled = true; }
            btn.addEventListener('click', ()=>{
                document.querySelectorAll('.slot.selected').forEach(el=>el.classList.remove('selected'));
                btn.classList.add('selected');
                selectedSlot = s;
                mensajeEl.textContent = '';
            });
            slotsContainer.appendChild(btn);
        });
    }

    const calendarObj = buildCalendar(calendarEl, year, month, (iso, cell)=>{
        document.querySelectorAll('.day.selected').forEach(e => e.classList.remove('selected'));
        cell.classList.add('selected');
        renderSlotsUnderCalendar(iso);
    });

    // prev/next
    calendarObj.prev.addEventListener('click', function goPrev(){
        month--; if(month<0){ month=11; year--; }
        const newCal = buildCalendar(calendarEl, year, month, (iso, cell)=>{
            document.querySelectorAll('.day.selected').forEach(e => e.classList.remove('selected'));
            cell.classList.add('selected');
            renderSlotsUnderCalendar(iso);
        });
        // reattach
        newCal.prev.addEventListener('click', goPrev);
        calendarObj.prev = newCal.prev; calendarObj.next = newCal.next;
    });
    calendarObj.next.addEventListener('click', function goNext(){
        month++; if(month>11){ month=0; year++; }
        const newCal = buildCalendar(calendarEl, year, month, (iso, cell)=>{
            document.querySelectorAll('.day.selected').forEach(e => e.classList.remove('selected'));
            cell.classList.add('selected');
            renderSlotsUnderCalendar(iso);
        });
        newCal.next.addEventListener('click', goNext);
        calendarObj.prev = newCal.prev; calendarObj.next = newCal.next;
    });

    // form submission
    if(form){
        form.addEventListener('submit', (e)=>{
            e.preventDefault();
            const nombre = document.getElementById('nombre').value.trim();
            const apellido = document.getElementById('apellido').value.trim();
            const dni = document.getElementById('dni').value.trim();
            const telefono = document.getElementById('telefono').value.trim();
            const correo = document.getElementById('correo').value.trim();
            const personas = parseInt(document.getElementById('personas').value,10);
            const comentarios = document.getElementById('comentarios').value.trim();
            const aceptaGarantia = document.getElementById('aceptaGarantia').checked;

            if(!nombre || !apellido || !dni || !telefono || !correo || !personas){
                mensajeEl.textContent = 'Completa todos los campos obligatorios.';
                mensajeEl.style.color = 'crimson';
                return;
            }
            if(!selectedDate || !selectedSlot){
                mensajeEl.textContent = 'Selecciona una fecha y un horario desde el calendario.';
                mensajeEl.style.color = 'crimson';
                return;
            }
            if(!/^\d{8}$/.test(dni)){ mensajeEl.textContent='DNI inválido (8 dígitos)'; mensajeEl.style.color='crimson'; return; }
            if(!/^\d{9}$/.test(telefono)){ mensajeEl.textContent='Teléfono inválido (9 dígitos)'; mensajeEl.style.color='crimson'; return; }
            if(!/^\S+@\S+\.\S+$/.test(correo)){ mensajeEl.textContent='Correo inválido'; mensajeEl.style.color='crimson'; return; }

            // check free tables now
            const free = countFreeTablesForSlot(selectedDate, selectedSlot);
            if(free <= 0){
                mensajeEl.textContent = 'El horario se llenó mientras completabas. Elige otro.';
                mensajeEl.style.color = 'crimson';
                renderSlotsUnderCalendar(selectedDate);
                return;
            }

            // create reservation object with required fields and initial state pendiente_aceptacion
            const codigo = 'R' + Math.random().toString(36).substring(2,8).toUpperCase();
            const nueva = {
                id: Date.now(),
                cod: codigo,
                nombre, apellido, dni, telefono, correo,
                personas, fecha: selectedDate, hora: selectedSlot,
                comentarios: comentarios || null,
                aceptaGarantia: !!aceptaGarantia,
                garantia: (personas * PRICE_PER_PERSON).toFixed(2),
                estado: RESERVATION_STATES.PEND_ACEPT,
                createdAt: new Date().toISOString(),
                mesa: null // sin asignar al crear
            };

            const reservas = getReservas();
            reservas.push(nueva);
            saveReservas(reservas);

            // show modal
            modalConfirm.style.display = 'flex';
            // show resumen
            resumenContenido.innerHTML = `
        <div><strong>Código:</strong> ${nueva.cod}</div>
        <div><strong>Nombre:</strong> ${nueva.nombre} ${nueva.apellido}</div>
        <div><strong>Fecha:</strong> ${nueva.fecha}</div>
        <div><strong>Hora:</strong> ${slotDisplay(nueva.hora)}</div>
        <div><strong>Personas:</strong> ${nueva.personas}</div>
        <div><strong>Garantía:</strong> S/ ${nueva.garantia}</div>
        <div><strong>Estado:</strong> Pendiente de aceptación</div>
        <div><strong>Comentarios:</strong> ${nueva.comentarios || '-'}</div>
      `;
            resumenDiv.style.display = 'block';
            mensajeEl.textContent = `Solicitud registrada — Código ${codigo} — Garantía S/ ${nueva.garantia}`;
            mensajeEl.style.color = '#0a7a07';

            // reset selection & re-render slots
            selectedSlot = null;
            document.querySelectorAll('.slot.selected').forEach(el => el.classList.remove('selected'));
            renderSlotsUnderCalendar(selectedDate);

            renderAdminIfPresent();
        });
    }

    // modal close
    if(modalClose){
        modalClose.addEventListener('click', ()=>{
            document.getElementById('modalConfirm').style.display = 'none';
        });
    }

    // imprimir comprobante (simple: abre vista de impresión con el resumen)
    if(imprimirBtn){
        imprimirBtn.addEventListener('click', ()=>{
            const content = resumenContenido.innerHTML;
            const w = window.open('', '_blank');
            w.document.write(`<html><head><title>Comprobante ${new Date().toISOString()}</title></head><body><h2>Comprobante de reserva</h2>${content}<p style="margin-top:20px">Gracias por reservar con StoqING.</p></body></html>`);
            w.document.close();
            w.print();
        });
    }
}

// ---------- ADMIN PAGE & LOGIN ----------
function setupAdminPage(){
    const loginForm = document.getElementById('loginForm');
    const loginMsg = document.getElementById('loginMsg');
    const adminLogin = document.getElementById('adminLogin');
    const dashboard = document.getElementById('dashboard');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminDate = document.getElementById('adminDate');

    if(!loginForm) return;

    // initialize adminDate default
    if(adminDate) adminDate.value = new Date().toISOString().slice(0,10);

    // check if logged
    const user = getUser();
    if(user && user.logged){
        showDashboard();
    }

    loginForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        const u = document.getElementById('loginUser').value.trim();
        const p = document.getElementById('loginPass').value;
        // simple auth: admin/admin
        if(u === 'admin' && p === 'admin'){
            saveUser({ username: u, logged: true });
            loginMsg.textContent = 'Acceso correcto.';
            loginMsg.style.color = 'green';
            showDashboard();
        } else {
            loginMsg.textContent = 'Credenciales inválidas.';
            loginMsg.style.color = 'crimson';
        }
    });

    if(logoutBtn){
        logoutBtn.addEventListener('click', ()=>{
            saveUser({ username: null, logged: false });
            window.location.reload();
        });
    }

    function showDashboard(){
        adminLogin.style.display = 'none';
        dashboard.style.display = 'block';
        renderAdmin();
        renderMesasMap();
    }
}

// render admin view: KPIs, lists
function renderAdmin(){
    const date = document.getElementById('adminDate') ? document.getElementById('adminDate').value : new Date().toISOString().slice(0,10);
    const reservas = getReservas();
    // KPIs
    const pendientesAcept = reservas.filter(r => r.estado === RESERVATION_STATES.PEND_ACEPT && r.fecha === date);
    const pendientesPago = reservas.filter(r => r.estado === RESERVATION_STATES.PEND_PAGO && r.fecha === date);
    const pendientesAsign = reservas.filter(r => r.estado === RESERVATION_STATES.PEND_ASIGN && r.fecha === date);
    const programadas = reservas.filter(r => r.estado === RESERVATION_STATES.PROGRAMADA && r.fecha === date);

    const kpiPendAcept = document.getElementById('kpiPendAcept');
    const kpiPendPago = document.getElementById('kpiPendPago');
    const kpiPendAsign = document.getElementById('kpiPendAsign');
    const kpiProg = document.getElementById('kpiProgramadas');
    if(kpiPendAcept) kpiPendAcept.textContent = pendientesAcept.length;
    if(kpiPendPago) kpiPendPago.textContent = pendientesPago.length;
    if(kpiPendAsign) kpiPendAsign.textContent = pendientesAsign.length;
    if(kpiProg) kpiProg.textContent = programadas.length;

    // render pending acceptance list
    const pendAcceptEl = document.getElementById('pendientesAccept');
    if(pendAcceptEl){
        pendAcceptEl.innerHTML = '';
        if(pendientesAcept.length === 0) pendAcceptEl.innerHTML = `<div class="small-muted">No hay solicitudes para ${date}.</div>`;
        pendientesAcept.forEach(r=>{
            const div = document.createElement('div');
            div.className = 'card';
            div.style.padding = '10px';
            div.style.marginBottom = '8px';
            div.innerHTML = `
        <div><strong>${r.cod}</strong> — ${r.nombre} ${r.apellido} — ${slotDisplay(r.hora)} — ${r.personas}p</div>
        <div style="margin-top:6px;color:var(--muted);font-size:0.95rem">Garantía: S/ ${r.garantia} — Aceptó pagar: ${r.aceptaGarantia ? 'Sí' : 'No'}</div>
        <div style="margin-top:8px;display:flex;gap:8px">
          <button class="btn btn-sm btn-success" data-id="${r.id}" onclick="adminAccept('${r.id}')">✓ Aceptar</button>
          <button class="btn btn-sm btn-danger" data-id="${r.id}" onclick="adminReject('${r.id}')">✗ Rechazar</button>
          <button class="btn btn-sm btn-outline-dark" data-id="${r.id}" onclick="viewReservaDetails('${r.id}')">Ver</button>
        </div>
      `;
            pendAcceptEl.appendChild(div);
        });
    }

    // render pending assignment list
    const pendAsignEl = document.getElementById('pendientesAsign');
    if(pendAsignEl){
        pendAsignEl.innerHTML = '';
        const list = reservas.filter(r => r.estado === RESERVATION_STATES.PEND_ASIGN && r.fecha === date);
        if(list.length === 0) pendAsignEl.innerHTML = `<div class="small-muted">No hay reservas pendientes de asignación para ${date}.</div>`;
        list.forEach(r=>{
            const div = document.createElement('div');
            div.className = 'card';
            div.style.padding = '10px';
            div.style.marginBottom = '8px';
            div.innerHTML = `
        <div><strong>${r.cod}</strong> — ${r.nombre} ${r.apellido} — ${slotDisplay(r.hora)} — ${r.personas}p</div>
        <div style="margin-top:6px;color:var(--muted);font-size:0.95rem">Comentarios: ${r.comentarios || '-'}</div>
        <div style="margin-top:8px;display:flex;gap:8px">
          <button class="btn btn-sm btn-dark" onclick="openAssignModal('${r.id}')">Asignar mesa</button>
          <button class="btn btn-sm btn-outline-danger" onclick="cancelReserva('${r.id}','cancelada')">Cancelar</button>
          <button class="btn btn-sm btn-outline-dark" onclick="viewReservaDetails('${r.id}')">Ver</button>
        </div>
      `;
            pendAsignEl.appendChild(div);
        });
    }

    // render mesas map updated
    renderMesasMap();
}

// admin accepts a reservation (decide manual acceptance)
function adminAccept(id){
    const arr = getReservas();
    const idx = arr.findIndex(r => String(r.id) === String(id));
    if(idx === -1) return alert('Reserva no encontrada.');
    const r = arr[idx];
    if(r.aceptaGarantia){
        r.estado = RESERVATION_STATES.PEND_ASIGN;
    } else {
        r.estado = RESERVATION_STATES.PEND_PAGO;
    }
    saveReservas(arr);
    renderAdmin();
    alert('Solicitud aceptada. Estado actualizado.');
}
function adminReject(id){
    if(!confirm('Rechazar esta solicitud?')) return;
    const arr = getReservas();
    const idx = arr.findIndex(r => String(r.id) === String(id));
    if(idx === -1) return alert('Reserva no encontrada.');
    arr[idx].estado = RESERVATION_STATES.CANCELADA;
    saveReservas(arr);
    renderAdmin();
}

// cancel reservation generic
function cancelReserva(id, reason='cancelada'){
    if(!confirm('Confirmar cancelación?')) return;
    const arr = getReservas();
    const idx = arr.findIndex(r => String(r.id) === String(id));
    if(idx === -1) return alert('Reserva no encontrada.');
    arr[idx].estado = RESERVATION_STATES.CANCELADA;
    saveReservas(arr);
    renderAdmin();
}

// View details (simple)
function viewReservaDetails(id){
    const arr = getReservas();
    const r = arr.find(x => String(x.id) === String(id));
    if(!r) return alert('No encontrada.');
    alert(`Reserva ${r.cod}\nCliente: ${r.nombre} ${r.apellido}\nFecha: ${r.fecha}\nHora: ${slotDisplay(r.hora)}\nPersonas: ${r.personas}\nEstado: ${r.estado}\nMesa: ${r.mesa || '-'}`);
}

// ---------- Mesas map rendering ----------
function renderMesasMap(){
    const mapEl = document.getElementById('mesasMap');
    if(!mapEl) return;
    mapEl.innerHTML = '';
    const tables = getTables();
    const reservas = getReservas();
    // For each table, determine state based on reservations for today (programada/en_curso) assigned to that table
    const today = document.getElementById('adminDate') ? document.getElementById('adminDate').value : new Date().toISOString().slice(0,10);
    for(const t of tables){
        // find if table has assigned reservation for today in programada or en_curso
        const assigned = reservas.find(r => r.mesa === t.num && r.fecha === today && (r.estado === RESERVATION_STATES.PROGRAMADA || r.estado === RESERVATION_STATES.EN_CURSO));
        let stateClass = 'estado-libre';
        let label = `M${t.num} (${t.ubicacion})`;
        if(assigned){
            stateClass = 'estado-ocupado';
            label += ` — ${assigned.cod}`;
        } else {
            // check if there's a reservation reserved (assigned future) -> reserved
            const reserved = reservas.find(r => r.mesa === t.num && r.fecha === today && r.estado === RESERVATION_STATES.PEND_ASIGN);
            if(reserved) { stateClass = 'estado-reservado'; label += ' — reservado'; }
        }
        const div = document.createElement('div');
        div.className = `mesa ${stateClass}`;
        div.innerHTML = `<div>${label}</div><div style="font-size:0.85rem;margin-top:6px">cap ${t.capacidad}</div>`;
        // click to change state manually (e.g., marcar mantenimiento)
        div.addEventListener('contextmenu', (e)=>{
            e.preventDefault();
            const newState = prompt('Estado de mesa: libre / ocupado / reservado / mantenimiento', 'libre');
            if(!newState) return;
            if(newState === 'mantenimiento'){
                div.className = 'mesa estado-mantenimiento';
            } else if(newState === 'ocupado') div.className = 'mesa estado-ocupado';
            else if(newState === 'reservado') div.className = 'mesa estado-reservado';
            else div.className = 'mesa estado-libre';
        });
        mapEl.appendChild(div);
    }
}

// ---------- Assign modal logic ----------
let assignTargetReservaId = null;
function openAssignModal(reservaId){
    assignTargetReservaId = reservaId;
    const modal = document.getElementById('assignModal');
    const ubic = document.getElementById('assignUbic');
    const mesaSel = document.getElementById('assignMesa');
    if(!modal || !ubic || !mesaSel) return;
    // fill mesas disponibles según ubicación and availability for that reserva's slot and date
    const reservas = getReservas();
    const r = reservas.find(x => String(x.id) === String(reservaId));
    if(!r) return alert('Reserva no encontrada');
    const ub = ubic.value;
    fillMesaSelect(ub, r.fecha, r.hora, mesaSel);
    modal.style.display = 'flex';

    ubic.onchange = ()=> fillMesaSelect(ubic.value, r.fecha, r.hora, mesaSel);

    document.getElementById('assignCancel').onclick = ()=> { modal.style.display='none'; assignTargetReservaId = null; };
    document.getElementById('assignSave').onclick = ()=>{
        const chosen = mesaSel.value;
        if(!chosen) return alert('Selecciona una mesa disponible.');
        // assign
        const arr = getReservas();
        const idx = arr.findIndex(x => String(x.id) === String(reservaId));
        if(idx === -1) return alert('Reserva no encontrada.');
        arr[idx].mesa = Number(chosen);
        arr[idx].estado = RESERVATION_STATES.PROGRAMADA;
        saveReservas(arr);
        modal.style.display='none';
        assignTargetReservaId = null;
        renderAdmin();
        alert('Mesa asignada y reserva programada.');
    };
}

function fillMesaSelect(ubicacion, fecha, hora, selectEl){
    selectEl.innerHTML = '';
    const tables = getTables().filter(t => t.ubicacion === ubicacion);
    for(const t of tables){
        if(isTableAvailableForSlot(t.num, fecha, hora)){
            const op = document.createElement('option');
            op.value = t.num;
            op.textContent = `Mesa ${t.num} (cap ${t.capacidad})`;
            selectEl.appendChild(op);
        }
    }
    if(selectEl.options.length === 0){
        const op = document.createElement('option');
        op.value = '';
        op.textContent = 'No hay mesas disponibles en esta ubicación';
        selectEl.appendChild(op);
    }
}

// ---------- Helper to detect if admin page loaded and render -->
function renderAdminIfPresent(){
    const adminDate = document.getElementById('adminDate');
    if(adminDate) renderAdmin();
}

// ---------- BOOT ----------
document.addEventListener('DOMContentLoaded', ()=>{
    initStorage();
    setupReservasPage();
    setupAdminPage();
});
