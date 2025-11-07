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
    fetch(`/api/reserva/aceptar_soli/${idReserva}`, {
        method: "PATCH",
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