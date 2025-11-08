package com.stoqing.reservas.controller.rest;

import com.stoqing.reservas.entities.model.Reserva;
import com.stoqing.reservas.service.ReservaService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;


@RestController
@RequestMapping("/api/reserva")
@AllArgsConstructor
public class ReservaRestController {

    private ReservaService reservaService;

    @Transactional(readOnly = true)
    @GetMapping("/listar_todo")
    public ResponseEntity<?> listarTodo(){
        return ResponseEntity.status(HttpStatus.OK).body(reservaService.findAll());
    }

    @GetMapping("/listar")
    public ResponseEntity<?> listar(){
        return ResponseEntity.status(HttpStatus.OK).body(reservaService.findByEstado_Id(1));
    }

    @Transactional
    @PostMapping("/crear")
    public ResponseEntity<?> crear(@RequestBody Reserva reserva){
        reservaService.save(reserva);
        return ResponseEntity.status(HttpStatus.CREATED).body(reserva);
    }

    @GetMapping("/listar_fecha")
    public ResponseEntity<?> listarFecha(@RequestParam LocalDate fecha){
        return ResponseEntity.status(HttpStatus.OK).body(reservaService.listarCardSolicitud(fecha));
    }

    @Transactional
    @PatchMapping("/aceptar_soli/{idReserva}")
    public ResponseEntity<?> aceptarSoli(@PathVariable int idReserva){

        reservaService.actualizarEstadoReserva(2, idReserva);

        return ResponseEntity.status(HttpStatus.OK).body("Reserva aceptada exitosamente");
    }

    @Transactional
    @PatchMapping("/denegar_soli/{idReserva}")
    public ResponseEntity<?> denegarrSoli(@PathVariable int idReserva){

        reservaService.actualizarEstadoReserva(5, idReserva);

        return ResponseEntity.status(HttpStatus.OK).body("Reserva denegada");
    }


}
