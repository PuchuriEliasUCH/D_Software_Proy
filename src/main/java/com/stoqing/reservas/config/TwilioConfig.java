package com.stoqing.reservas.config;

import com.twilio.Twilio;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TwilioConfig {
    public TwilioConfig(
        @Value("${twilio.account_sid}") String accountSid,
        @Value("${twilio.auth_token}") String authToken
    ) {
        Twilio.init(accountSid, authToken);
    }
}
