package com.stoqing.reservas.controller;

import com.stoqing.reservas.service.ReservaService;
import lombok.AllArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;

@Controller
@RequestMapping("/dashboard")
@AllArgsConstructor
public class DashboardController {

    private ReservaService reservaService;

    @Transactional(readOnly = true)
    @GetMapping({"/", ""})
    public String dashboard(Model model){
        model.addAttribute("cards", reservaService.listarCardSolicitud(LocalDate.now()));
        return "pages/admin_dashboard";
    }

    @Transactional(readOnly = true)
    @GetMapping("/listar_fecha")
    public String listarFecha(
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate fecha,
        Model model
    ){
        LocalDate fechaBusqueda= (fecha != null) ? fecha : LocalDate.now();

        model.addAttribute("cards", reservaService.listarCardSolicitud(fechaBusqueda));

        return "fragments/dashboard/fragment_solicitudes :: fragmentSoli";
    }


}
