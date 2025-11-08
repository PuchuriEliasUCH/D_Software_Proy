const URL_BASE = "http://localhost:8080"

const listarCards = () => {
    const fecha = document.getElementById("adminDate").value;
    const contenedor = document.getElementById('pendientesAccept');

    fetch(`${URL_BASE}/dashboard/listar_fecha?fecha=${fecha.toString()}`)
        .then(response => {
            if (!response.ok) throw new Error('Error en el servidor');
            return response.text();
        })
        .then(html => contenedor.innerHTML = html)
}

const confirmarPago = (idReserva) => {
    const metodoPago = document.getElementById("metPago").value;

    fetch(`/api/reserva/aceptar_soli`, {
        method: "PATCH",
        body: JSON.stringify({
            "idEstado": 2,
            idReserva,
            "metodoPago": metodoPago.toString()
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(arr => listarCards())
        .catch(er => alert(er));
}

const denegarSolicitud = (idReserva) => {
    fetch(`/api/reserva/denegar_soli/${idReserva}`, {
        method : "PATCH",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(arr => listarCards())
        .catch(er => alert(er));
}


document.getElementById("modalAceptarSoli").addEventListener('click', () => {
    const btnAceptarSoli = document.getElementById("btnAceptarSoli");
    const idTarjeta = btnAceptarSoli.getAttribute('reserva-id');
    const modalElement = document.getElementById("confirmarSolicitud");

    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();

    confirmarPago(idTarjeta);

})
document.getElementById("modalDenegarSoli").addEventListener('click', () => {
    const btnDenegarSoli = document.getElementById("btnDenegarSoli");
    const idTarjeta = btnDenegarSoli.getAttribute('reserva-id');
    const modalElement = document.getElementById("denegarSolicitud");

    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();

    denegarSolicitud(idTarjeta);

})