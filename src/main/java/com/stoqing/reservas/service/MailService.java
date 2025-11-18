package com.stoqing.reservas.service;

import com.stoqing.reservas.entities.dto.EmailDTO;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AllArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@AllArgsConstructor
public class MailService {

    private JavaMailSender mailSender;
    private TemplateEngine templateEngine;

    public void sendMail(EmailDTO emailDTO) throws MessagingException {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

        helper.setTo(emailDTO.getDestinatario());
        helper.setSubject(emailDTO.getAsunto());

        Context ctx = new Context();
        ctx.setVariable("mensaje", emailDTO.getMensaje());
        ctx.setVariable("reserva", emailDTO.getReserva());


        String contentHtml = templateEngine.process("emailTemplates/confirmacionReserva.html", ctx);
        helper.setText(contentHtml, true);

        mailSender.send(mimeMessage);
    }
}
