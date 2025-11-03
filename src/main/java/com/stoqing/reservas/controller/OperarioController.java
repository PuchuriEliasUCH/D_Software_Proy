package com.stoqing.reservas.controller;

import com.stoqing.reservas.service.OperarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/operario")
public class OperarioController {

    @Autowired
    private OperarioService operarioService;


}
