package com.stoqing.reservas.controller;

import com.stoqing.reservas.service.ReservaService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.time.LocalDate;

@Controller
@RequestMapping("/dashboard")
@AllArgsConstructor
public class DashboardController {

    private ReservaService reservaService;

    @GetMapping({"/", ""})
    public String dashboard(Model model){
        return "pages/admin_dashboard";
    }


}
