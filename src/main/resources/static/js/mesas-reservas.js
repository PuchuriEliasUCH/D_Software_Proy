/* mesas-reservas.js — Vista “Actualmente”, GMT-5 Lima, mantenimiento y autocierre de 1h */
var LS_KEY = 'stoqing_reservas_v2', LS_TABLES = 'stoqing_tables_v2', LS_USER = 'stoqing_user_v2';
var LIMA_TZ = 'America/Lima';
var bc = new BroadcastChannel('stoqing');

var DEFAULT_TABLES = [
    {num: 1, capacidad: 2, ubicacion: 'salon'}, {num: 2, capacidad: 2, ubicacion: 'salon'},
    {num: 3, capacidad: 2, ubicacion: 'segundo_piso'}, {num: 4, capacidad: 2, ubicacion: 'segundo_piso'},
    {num: 5, capacidad: 4, ubicacion: 'salon'}, {num: 6, capacidad: 4, ubicacion: 'salon'},
    {num: 7, capacidad: 4, ubicacion: 'salon'}, {num: 8, capacidad: 4, ubicacion: 'segundo_piso'},
    {num: 9, capacidad: 4, ubicacion: 'segundo_piso'}, {num: 10, capacidad: 6, ubicacion: 'salon'},
    {num: 11, capacidad: 6, ubicacion: 'salon'}, {num: 12, capacidad: 6, ubicacion: 'segundo_piso'},
    {num: 13, capacidad: 6, ubicacion: 'segundo_piso'}, {num: 14, capacidad: 8, ubicacion: 'salon'},
    {num: 15, capacidad: 8, ubicacion: 'segundo_piso'}
];

var STATES = {
    PEND_PAGO: 'pendiente_pago',
    CANCELADA: 'cancelada',
    PROGRAMADA: 'programada',
    EN_CURSO: 'en_curso',
    FINALIZADA: 'finalizada'
};

function initStorage() {
    if (!localStorage.getItem(LS_KEY)) localStorage.setItem(LS_KEY, JSON.stringify([]));
    if (!localStorage.getItem(LS_TABLES)) localStorage.setItem(LS_TABLES, JSON.stringify(DEFAULT_TABLES));
}

function getReservas() {
    try {
        return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
    } catch (e) {
        return []
    }
}

function saveReservas(arr) {
    localStorage.setItem(LS_KEY, JSON.stringify(arr));
    try {
        bc.postMessage({key: 'reservas', ts: Date.now()});
    } catch {
    }
}

function getTables() {
    try {
        return JSON.parse(localStorage.getItem(LS_TABLES) || '[]')
    } catch (e) {
        return DEFAULT_TABLES
    }
}

function saveTables(arr) {
    localStorage.setItem(LS_TABLES, JSON.stringify(arr));
    try {
        bc.postMessage({key: 'mesas', ts: Date.now()});
    } catch {
    }
}

function getUser() {
    try {
        return JSON.parse(localStorage.getItem(LS_USER) || 'null')
    } catch (e) {
        return null
    }
}

function nowLima() {
    return new Date(new Date().toLocaleString('en-US', {timeZone: LIMA_TZ}));
}

function todayIsoLima() {
    var n = nowLima();
    return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0');
}

function nowSlotHHMMLima() {
    var n = nowLima();
    return String(n.getHours()).padStart(2, '0') + ':00';
}

function limaDateTime(iso, hhmm) {
    return new Date(iso + 'T' + hhmm + ':00-05:00');
}

function prettyUbicacion(u) {
    if (u === 'salon') return 'Salón';
    if (u === 'segundo_piso') return 'Segundo piso';
    return (u || '').replace('_', ' ').replace(/^\w/, c => c.toUpperCase());
}

function slotDisplay(s) {
    if (!s) return '-';
    var p = s.split(':'), hh = parseInt(p[0]), mm = parseInt(p[1]);
    var h12 = hh % 12 === 0 ? 12 : hh % 12;
    return h12 + ':' + (mm < 10 ? '0' : '') + mm + ' ' + (hh < 12 ? 'AM' : 'PM');
}

function formatDate(dateStr) {
    var d = limaDateTime(dateStr, '00:00');
    return d.toLocaleDateString('es-PE', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
}

/* Reglas automáticas del doc + autocierre 1h en EN_CURSO */ /* :contentReference[oaicite:4]{index=4} */
function autoUpdateReservationStates() {
    var now = new Date();
    var arr = getReservas();
    var changed = false;
    for (var i = 0; i < arr.length; i++) {
        var r = arr[i];
        // 15m sin pago -> cancelada
        if (r.estado === STATES.PEND_PAGO && r.pagoLimite && new Date(r.pagoLimite) < now) {
            r.estado = STATES.CANCELADA;
            r.cancelledReason = 'timeout_pago_15m';
            changed = true;
        }
        // No show 10m después de la hora programada
        if (r.estado === STATES.PROGRAMADA) {
            var slot = limaDateTime(r.fecha, r.hora);
            var deadline = new Date(slot.getTime() + 10 * 60 * 1000);
            if (deadline < now && !r.iniciadaAt) {
                r.estado = STATES.CANCELADA;
                r.cancelledReason = 'no_show_10m';
                changed = true;
            }
        }
        // ⏰ Autocierre: en curso > 1h => finalizada
        if (r.estado === STATES.EN_CURSO && r.iniciadaAt) {
            if (now - new Date(r.iniciadaAt) >= 60 * 60 * 1000) {
                r.estado = STATES.FINALIZADA;
                r.finalizadaAt = new Date().toISOString();
                r.autoClosed = '1h_autofinalizada';
                changed = true;
            }
        }
    }
    if (changed) saveReservas(arr);
}

function sweepMaintenance() {
    var t = getTables(), nowTs = Date.now(), ch = false;
    for (var i = 0; i < t.length; i++) {
        var tb = t[i];
        if (tb.manual === 'mantenimiento' && tb.mantenimientoHasta && new Date(tb.mantenimientoHasta).getTime() <= nowTs) {
            delete tb.manual;
            delete tb.mantenimientoHasta;
            ch = true;
        }
    }
    if (ch) saveTables(t);
}

function setupMesasReservas() {
    var user = getUser();
    if (!user || !user.logged) {
        window.location.href = 'admin-login.html';
        return;
    }
    var mesasDate = document.getElementById('mesasDate'), logoutBtn = document.getElementById('logoutBtn'),
        dashboardBtn = document.getElementById('dashboardBtn'),
        estadoFilter = document.getElementById('reservasEstadoFilter');

    if (mesasDate) {
        mesasDate.value = todayIsoLima();
        mesasDate.addEventListener('change', renderMesasView);
    }
    if (estadoFilter) {
        estadoFilter.addEventListener('change', renderReservasDelDia);
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (confirm('¿Cerrar sesión?')) {
                localStorage.setItem(LS_USER, JSON.stringify({username: null, logged: false}));
                window.location.href = 'admin-login.html';
            }
        });
    }
    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', function () {
            window.location.href = 'admin-dashboard.html';
        });
    }

    autoUpdateReservationStates();
    sweepMaintenance();
    renderMesasView();
    setInterval(function () {
        autoUpdateReservationStates();
        sweepMaintenance();
        renderMesasView();
    }, 5_000);
    window.addEventListener('storage', function (e) {
        if (e.key === LS_KEY || e.key === LS_TABLES) {
            autoUpdateReservationStates();
            sweepMaintenance();
            renderMesasView();
        }
    });
}

function renderMesasView() {
    var date = document.getElementById('mesasDate') ? document.getElementById('mesasDate').value : todayIsoLima();
    renderMesasMap(date);
    renderReservasDelDia();
}

function getMesaState(mesa, reservas, fecha, tables) {
    var t = tables.find(function (x) {
        return x.num === mesa.num;
    });
    if (t && t.manual === 'mantenimiento') return 'mantenimiento';
    var target = nowSlotHHMMLima();
    for (var i = 0; i < reservas.length; i++) {
        var r = reservas[i];
        if (r.mesa === mesa.num && r.fecha === fecha) {
            if (r.estado === STATES.EN_CURSO) return 'ocupada';
            if (r.estado === STATES.PROGRAMADA && r.hora === target) return 'reservada';
            if (r.estado === STATES.PEND_PAGO && r.hora === target) return 'solicitada';
        }
    }
    if (t && t.manual === 'ocupada') return 'ocupada';
    return 'libre';
}

function renderMesasMap(date) {
    var mapEl = document.getElementById('mesasMap');
    if (!mapEl) return;
    mapEl.innerHTML = '';
    var targetSlot = nowSlotHHMMLima();
    var tables = getTables();
    var reservas = getReservas();

    var byLocation = {}, i;
    for (i = 0; i < tables.length; i++) {
        var t = tables[i];
        if (!byLocation[t.ubicacion]) byLocation[t.ubicacion] = [];
        byLocation[t.ubicacion].push(t);
    }
    var locations = Object.keys(byLocation).sort();

    for (var j = 0; j < locations.length; j++) {
        var loc = locations[j];
        var header = document.createElement('div');
        header.className = 'location-header';
        header.textContent = prettyUbicacion(loc);
        mapEl.appendChild(header);

        var container = document.createElement('div');
        container.className = 'location-container';
        var mesasLoc = byLocation[loc];
        for (var k = 0; k < mesasLoc.length; k++) {
            var mesa = mesasLoc[k];
            var state = getMesaState(mesa, reservas, date, tables);
            var assigned = null;
            for (i = 0; i < reservas.length; i++) {
                var r = reservas[i], sameSlot = (r.hora === targetSlot || r.estado === STATES.EN_CURSO);
                if (r.mesa === mesa.num && r.fecha === date && sameSlot) {
                    if ([STATES.PEND_PAGO, STATES.PROGRAMADA, STATES.EN_CURSO].indexOf(r.estado) >= 0) {
                        assigned = r;
                        break;
                    }
                }
            }
            var div = document.createElement('div');
            div.className = 'mesa estado-' + state;
            div.tabIndex = 0;
            var icon = state === 'libre' ? '✅' : state === 'solicitada' ? '🟢' : state === 'reservada' ? '🔴' : state === 'ocupada' ? '🟠' : '⚠️';
            var details = 'Cap.: ' + mesa.capacidad;
            if (state === 'solicitada') details = assigned ? (assigned.cod + ' — Pend. pago') : 'Solicitada';
            if (state === 'reservada') details = assigned ? (assigned.cod + ' — ' + slotDisplay(assigned.hora)) : 'Reservada';
            if (state === 'ocupada') details = assigned ? (assigned.cod + ' — En uso') : 'Ocupada';
            if (state === 'mantenimiento') details = 'No disponible';

            div.innerHTML = '<div style="font-weight:bold;display:flex;align-items:center;gap:4px"><span>' + icon + '</span><span>Mesa ' + mesa.num + '</span></div><div style="font-size:0.75rem;margin-top:4px;text-align:center">' + details + '</div>';
            div.setAttribute('data-mesa', mesa.num);
            div.setAttribute('data-assigned', assigned ? assigned.id : '');

            div.addEventListener('click', onMesaClick);
            div.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') this.click();
            });
            container.appendChild(div);
        }
        mapEl.appendChild(container);
    }
}

function onMesaClick() {
    var mesaNum = Number(this.getAttribute('data-mesa'));
    var assignedId = this.getAttribute('data-assigned');
    var tablesArr = getTables();
    var table = tablesArr.find(function (x) {
        return x.num === mesaNum;
    });
    if (assignedId) {
        var res = getReservas().find(function (x) {
            return String(x.id) === String(assignedId);
        });
        var msg = 'MESA ' + table.num + '\nUbicación: ' + prettyUbicacion(table.ubicacion) + '\nCapacidad: ' + table.capacidad + '\n\nRESERVA:\nCódigo: ' + res.cod + '\nCliente: ' + res.nombre + ' ' + res.apellido + '\nHora: ' + slotDisplay(res.hora) + '\nPersonas: ' + res.personas;
        alert(msg);
        return;
    }
    var modal = document.getElementById('tableOptionsModal'), info = document.getElementById('tableOptInfo'),
        sel = document.getElementById('tableStateSelect'), maintWrap = document.getElementById('maintUntilWrap'),
        maintInput = document.getElementById('maintUntil');
    info.textContent = 'Mesa ' + table.num + ' — ' + prettyUbicacion(table.ubicacion) + ' — Capacidad ' + table.capacidad + ' personas';
    sel.value = table.manual || 'libre';
    maintWrap.style.display = sel.value === 'mantenimiento' ? 'block' : 'none';
    maintInput.value = '';
    sel.onchange = function () {
        maintWrap.style.display = sel.value === 'mantenimiento' ? 'block' : 'none';
    };
    modal.style.display = 'flex';
    document.getElementById('tableOptSave').onclick = function () {
        var v = sel.value;
        if (v === 'libre') {
            delete table.manual;
            delete table.mantenimientoHasta;
        } else if (v === 'ocupada') {
            table.manual = 'ocupada';
            delete table.mantenimientoHasta;
        } else {
            table.manual = 'mantenimiento';
            table.mantenimientoHasta = maintInput.value ? new Date(maintInput.value).toISOString() : undefined;
        }
        saveTables(tablesArr);
        modal.style.display = 'none';
        renderMesasView();
    };
}

/* Lista del día */
function renderReservasDelDia() {
    var el = document.getElementById('reservasDelDia');
    if (!el) return;
    var date = document.getElementById('mesasDate') ? document.getElementById('mesasDate').value : todayIsoLima();
    var estadoSel = document.getElementById('reservasEstadoFilter') ? document.getElementById('reservasEstadoFilter').value : 'todas';
    var reservas = getReservas();
    var filtered = [];
    for (var i = 0; i < reservas.length; i++) {
        var r = reservas[i];
        if (r.fecha !== date) continue;
        if (estadoSel !== 'todas' && r.estado !== estadoSel) continue;
        filtered.push(r);
    }

    el.innerHTML = '';
    if (filtered.length === 0) {
        el.innerHTML = '<div class="empty-state">No hay reservas para ' + formatDate(date) + '.</div>';
        return;
    }
    filtered.sort(function (a, b) {
        return a.hora.localeCompare(b.hora) || (a.cod || '').localeCompare(b.cod || '');
    });

    for (var j = 0; j < filtered.length; j++) {
        var res = filtered[j];
        var statusClass = res.estado === 'pendiente_pago' ? 'status-pendiente' : res.estado === 'programada' ? 'status-programada' : res.estado === 'en_curso' ? 'status-en-curso' : res.estado === 'finalizada' ? 'status-finalizada' : '';
        var statusText = (res.estado === 'pendiente_pago') ? 'Pendiente de pago' :
            (res.estado === 'programada') ? 'Programada' :
                (res.estado === 'en_curso') ? 'En curso' :
                    (res.estado === 'finalizada') ? 'Finalizada' : 'Cancelada';

        var btns = '';
        if (res.estado === STATES.PEND_PAGO) {
            btns = '<button class="btn btn-sm btn-success" type="button" onclick="confirmarPago(\'' + res.id + '\')">Confirmar pago</button> ' +
                '<button class="btn btn-sm btn-danger" type="button" onclick="denegarSolicitud(\'' + res.id + '\')">Denegar</button>';
        } else if (res.estado === STATES.PROGRAMADA) {
            btns = '<button class="btn btn-sm btn-outline-primary" type="button" onclick="openEditModal(\'' + res.id + '\')">Editar</button> ' +
                '<button class="btn btn-sm btn-success" type="button" onclick="iniciarReserva(\'' + res.id + '\')">Iniciar</button>';
        } else if (res.estado === STATES.EN_CURSO) {
            btns = '<button class="btn btn-sm btn-primary" type="button" onclick="finalizarReserva(\'' + res.id + '\')">Finalizar</button>';
        }
        if (res.estado !== STATES.FINALIZADA && res.estado !== STATES.CANCELADA) {
            btns += ' <button class="btn btn-sm btn-outline-danger" type="button" onclick="cancelReserva(\'' + res.id + '\')">Cancelar</button>';
        }
        btns += ' <button class="btn btn-sm btn-outline-dark" type="button" onclick="viewReservaDetails(\'' + res.id + '\')">Ver detalles</button>';

        var div = document.createElement('div');
        div.className = 'reserva-item';
        div.innerHTML = '<div><strong>' + res.cod + '</strong> - ' + res.nombre + ' ' + res.apellido + ' <span class="reserva-status ' + statusClass + '">' + statusText + '</span></div>' +
            '<div class="small-muted">' + slotDisplay(res.hora) + ' | ' + res.personas + ' persona(s) | Mesa ' + (res.mesa || '-') + ' | ' + res.telefono + '</div>' +
            '<div style="margin-top:8px">' + btns + '</div>';
        el.appendChild(div);
    }
}

/* Acciones principales */
function confirmarPago(id) {
    if (!confirm('¿Confirmar pago recibido e iniciar?')) return;
    var rs = getReservas();
    for (var i = 0; i < rs.length; i++) {
        if (String(rs[i].id) === String(id)) {
            rs[i].estado = STATES.EN_CURSO;
            rs[i].pagoConfirmadoAt = new Date().toISOString();
            rs[i].iniciadaAt = new Date().toISOString();
            saveReservas(rs);
            renderMesasView();
            return;
        }
    }
}

function denegarSolicitud(id) {
    if (!confirm('¿Denegar solicitud?')) return;
    var rs = getReservas();
    for (var i = 0; i < rs.length; i++) {
        if (String(rs[i].id) === String(id)) {
            rs[i].estado = STATES.CANCELADA;
            rs[i].cancelledReason = 'denegada_operario';
            saveReservas(rs);
            renderMesasView();
            return;
        }
    }
}

function iniciarReserva(id) {
    if (!confirm('¿El cliente llegó? ¿Iniciar reserva?')) return;
    var rs = getReservas();
    for (var i = 0; i < rs.length; i++) {
        if (String(rs[i].id) === String(id)) {
            rs[i].estado = STATES.EN_CURSO;
            rs[i].iniciadaAt = new Date().toISOString();
            saveReservas(rs);
            renderMesasView();
            return;
        }
    }
}

function finalizarReserva(id) {
    if (!confirm('¿Finalizar reserva?')) return;
    var rs = getReservas();
    for (var i = 0; i < rs.length; i++) {
        if (String(rs[i].id) === String(id)) {
            rs[i].estado = STATES.FINALIZADA;
            rs[i].finalizadaAt = new Date().toISOString();
            saveReservas(rs);
            renderMesasView();
            return;
        }
    }
}

function cancelReserva(id) {
    if (!confirm('¿Cancelar esta reserva?')) return;
    var rs = getReservas();
    for (var i = 0; i < rs.length; i++) {
        if (String(rs[i].id) === String(id)) {
            var r = rs[i], now = new Date(), slot = limaDateTime(r.fecha, r.hora), diffMin = (slot - now) / 60000;
            r.estado = STATES.CANCELADA;
            r.refundEligible = diffMin > 60;
            r.cancelledReason = r.refundEligible ? 'cliente_cancela_>1h' : 'cliente_cancela_<1h';
            r.cancelledAt = new Date().toISOString();
            saveReservas(rs);
            renderMesasView();
            return;
        }
    }
}

function viewReservaDetails(id) {
    var r = getReservas().find(function (x) {
        return String(x.id) === String(id)
    });
    if (!r) {
        alert('Reserva no encontrada');
        return;
    }
    alert('DETALLES DE RESERVA\n\nCódigo: ' + r.cod + '\nCliente: ' + r.nombre + ' ' + r.apellido + '\nDNI: ' + r.dni + '\nTeléfono: ' + r.telefono + '\nEmail: ' + r.correo + '\n\nFecha: ' + formatDate(r.fecha) + '\nHora: ' + slotDisplay(r.hora) + '\nPersonas: ' + r.personas + '\nMesa: ' + (r.mesa || '-') + '\nGarantía: S/ ' + (r.garantia || (r.personas * 5).toFixed(2)) + '\nEstado: ' + (r.estado === 'pendiente_pago' ? 'Pendiente de pago' : r.estado === 'en_curso' ? 'En curso' : r.estado.charAt(0).toUpperCase() + r.estado.slice(1)) + '\nComentarios: ' + (r.comentarios || 'Ninguno'));
}

function openEditModal(id) {
    var rs = getReservas();
    var r = rs.find(function (x) {
        return String(x.id) === String(id)
    });
    if (!r) return;
    if (r.estado !== 'programada') {
        alert('Solo se editan reservas Programadas.');
        return;
    }
    var modal = document.getElementById('editModal'), info = document.getElementById('editInfo'),
        slotsDiv = document.getElementById('editSlots'), msg = document.getElementById('editMsg');
    info.textContent = r.cod + ' — ' + r.nombre + ' ' + r.apellido;
    msg.textContent = '';
    renderEditSlots(slotsDiv, r.fecha, r.personas, r.hora);
    slotsDiv.addEventListener('click', function handler(e) {
        if (e.target && e.target.matches('button.slot')) {
            if (e.target.disabled) return;
            slotsDiv.querySelectorAll('.slot.selected').forEach(function (b) {
                b.classList.remove('selected')
            });
            e.target.classList.add('selected');
            r.hora = e.target.getAttribute('data-hora');
        }
    });
    document.getElementById('editCancel').onclick = function () {
        modal.style.display = 'none';
    };
    document.getElementById('editSave').onclick = function () {
        var mesaNueva = asignarMesaAutomatica(parseInt(r.personas, 10), r.fecha, r.hora);
        if (!mesaNueva) {
            msg.textContent = 'No hay mesa disponible para esa combinación.';
            return;
        }
        r.mesa = mesaNueva;
        r.assignedAt = new Date().toISOString();
        saveReservas(rs);
        modal.style.display = 'none';
        renderMesasView();
    };
    modal.style.display = 'flex';
}

function renderEditSlots(container, date, personas, selected) {
    container.innerHTML = '';
    var slots = ['13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
    for (var i = 0; i < slots.length; i++) {
        var s = slots[i];
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'slot';
        btn.textContent = slotDisplay(s);
        btn.setAttribute('data-hora', s);
        if (!countFreeTablesForSlot(date, s, personas)) btn.disabled = true;
        if (s === selected) btn.classList.add('selected');
        container.appendChild(btn);
    }
}

function capacidadRequerida(p) {
    if (p <= 2) return 2;
    if (p <= 4) return 4;
    if (p <= 6) return 6;
    return 8;
}

function isTableAvailableForSlot(tableNum, dateIso, slotTime) {
    var tables = getTables();
    var t = tables.find(function (x) {
        return String(x.num) === String(tableNum)
    });
    if (t && t.manual === 'mantenimiento') return false;
    var reservas = getReservas();
    var blocking = [STATES.PROGRAMADA, STATES.EN_CURSO, STATES.PEND_PAGO];
    for (var i = 0; i < reservas.length; i++) {
        var r = reservas[i];
        if (r.fecha === dateIso && r.hora === slotTime && String(r.mesa) === String(tableNum) && blocking.indexOf(r.estado) >= 0) return false;
    }
    return true;
}

function countFreeTablesForSlot(dateIso, slotTime, personas) {
    var cap = capacidadRequerida(personas), t = getTables().filter(function (x) {
        return x.capacidad === cap && x.manual !== 'mantenimiento'
    });
    var free = 0;
    for (var i = 0; i < t.length; i++) if (isTableAvailableForSlot(t[i].num, dateIso, slotTime)) free++;
    return free;
}

function asignarMesaAutomatica(personas, fecha, hora) {
    var cap = capacidadRequerida(personas), t = getTables().filter(function (x) {
        return x.capacidad === cap && x.manual !== 'mantenimiento'
    });
    for (var i = 0; i < t.length; i++) {
        if (isTableAvailableForSlot(t[i].num, fecha, hora)) return t[i].num;
    }
    return null;
}

document.addEventListener('DOMContentLoaded', function () {
    try {
        initStorage();
        setupMesasReservas();
    } catch (e) {
        console.error(e);
    }
});
window.confirmarPago = confirmarPago;
window.denegarSolicitud = denegarSolicitud;
window.iniciarReserva = iniciarReserva;
window.finalizarReserva = finalizarReserva;
window.cancelReserva = cancelReserva;
window.viewReservaDetails = viewReservaDetails;
window.renderMesasView = renderMesasView;
window.openEditModal = openEditModal;
