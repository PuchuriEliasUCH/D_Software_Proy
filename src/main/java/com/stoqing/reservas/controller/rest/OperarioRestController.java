package com.stoqing.reservas.controller.rest;

import com.stoqing.reservas.entities.model.Operario;
import com.stoqing.reservas.service.OperarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/operario")
public class OperarioRestController {

    @Autowired
    private OperarioService operarioService;

    @GetMapping("/listar")
    public ResponseEntity<?> listar(){
        return ResponseEntity.status(HttpStatus.OK).body(operarioService.findAll());
    }

    @Transactional
    @PostMapping("/crear")
    public ResponseEntity<?> crear(@RequestBody Operario operario) {

        operarioService.createOperario(operario);

        return ResponseEntity.status(HttpStatus.CREATED).body(operario);
    }
}