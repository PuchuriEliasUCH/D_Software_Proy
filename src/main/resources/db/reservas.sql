create database reservas;
use reservas;

-- drop table reservas


select *
from estado;

-- INSERT INICIAL

-- OPERARIO

insert into operario(nombre, apellido, dni, contrasena, telefono, enabled, created_at)
values ('Janito', 'Tineo', '87654321', '$2a$12$Uy/ZzYCZuKt41iFt1Q2EieKJ9AIe6na29KOZwDq/H4opNvnCP1NZW','987654321', 1, '2025-11-03 13:34:00');

-- ESTADOS RESERVA
insert into estado(nombre, tipo, descripcion,color, activo)
values ('Pago pendiente',          'RESERVA', 'Reserva creada, a la espera del pago de la garantía.',                         '#22BB74', TRUE),
       ('Reserva programada',      'RESERVA', 'Reserva confirmada y programada (pago registrado).',                           '#2D89EF', TRUE),
       ('Cancelado - Expirado',    'RESERVA', 'Reserva cancelada automáticamente por no registrarse el pago en 15 minutos.',  '#888888', TRUE),
       ('Cancelado - Cliente',     'RESERVA', 'Reserva cancelada por el cliente o por solicitud de este.',                     '#999999', TRUE),
       ('Cancelado - Inconveniente','RESERVA','Reserva cancelada por motivos internos del local.',                             '#999999', TRUE),
       ('Reserva en curso',        'RESERVA', 'Reserva que ya está siendo atendida en el local.',                              '#F5660F', TRUE),
       ('Reserva finalizada',      'RESERVA', 'Reserva completada y finalizada exitosamente.',                                 '#22BB74', TRUE),
       ('Cancelado - No show',     'RESERVA', 'Cliente no se presentó luego del tiempo de tolerancia.',                        '#CC0000', TRUE);

-- ESTADOS MESA

INSERT INTO estado (nombre, tipo, descripcion, color, activo)
VALUES
    ('Libre', 'MESA', 'Mesa disponible para asignar', '#22BB74', TRUE),
    ('Solicitada', 'MESA', 'Mesa solicitada', '#22BB74', TRUE),
    ('Reservada', 'MESA', 'Mesa marcada como reservada cuando el cliente ya pagó la reserva', '#D42939', TRUE),
    ('Ocupada', 'MESA', 'Mesa marcada como ocupada cuando la reserva está en curso', '#F5660F', TRUE),
    ('Mantenimiento', 'MESA', 'Mesa no disponible por trabajos/mantenimiento', '#F3C40B', TRUE);

-- MESAS

INSERT INTO mesa (num_mesa, id_estado, capacidad) VALUES
      -- Mesas para 2 personas
      (1, 6, 'DOS'),
      (2, 6, 'DOS'),
      (3, 6, 'DOS'),
      (4, 6, 'DOS'),

      -- Mesas para 4 personas
      (5, 6, 'CUATRO'),
      (6, 6, 'CUATRO'),
      (7, 6, 'CUATRO'),
      (8, 6, 'CUATRO'),
      (9, 6, 'CUATRO'),

      -- Mesas para 6 personas
      (10, 6, 'SEIS'),
      (11, 6, 'SEIS'),
      (12, 6, 'SEIS'),
      (13, 6, 'SEIS'),

      -- Mesas para 8 personas
      (14, 6, 'OCHO'),
      (15, 6, 'OCHO');