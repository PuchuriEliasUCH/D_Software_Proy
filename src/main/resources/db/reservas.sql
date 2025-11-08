create database reservas;
use reservas;

-- drop table reservas


select *
from reservas.estado;

-- insert inicial

-- OPERARIO

insert into operario(nombre, apellido, dni, contrasena, telefono, enabled, created_at)
values ('Janito', 'Tineo', '87654321', '$2a$12$Uy/ZzYCZuKt41iFt1Q2EieKJ9AIe6na29KOZwDq/H4opNvnCP1NZW','987654321', 1, '2025-11-03 13:34:00');

-- ESTADOS
insert into estado(nombre, tipo, descripcion,color, activo)
values ( 'Pago pendiente', 'RESERVA', 'Falta confirmar el pago', '#fae09d', 1),
       ( 'Reserva programada', 'RESERVA', 'Pago exitoso, reserva confirmada', '#6c9ae6', 1),
       ( 'Cancelado - Expirado', 'RESERVA', 'No se realizó el pago de garantía', '#6c9ae6', 1),
       ( 'Cancelado - Inconvenientes', 'RESERVA', 'Inconvenientes internos del restaurant', '#6c9ae6', 1)
