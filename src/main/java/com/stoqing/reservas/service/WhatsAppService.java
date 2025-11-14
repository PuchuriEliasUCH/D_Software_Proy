package com.stoqing.reservas.service;

import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class WhatsAppService {

    @Value("${twilio.from}")
    private String emisor;

    public void confirmacionMensaje(String receptor, String mensaje){
        Message.creator(
            new PhoneNumber("whatsapp:+51" + receptor),
            new PhoneNumber("whatsapp:" + emisor),
            mensaje
        )
            .create()
            .getSid();
    }
}
