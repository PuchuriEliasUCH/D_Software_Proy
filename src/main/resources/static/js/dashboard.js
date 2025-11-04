const renderAdmin = () => {
    const fecha = document.getElementById("adminDate").value;
    fetch(`/api/reserva/listar_fecha?fecha=${encodeURIComponent(fecha)}`)
        .then(res => res.json())
        .then(data => {

        })
}
