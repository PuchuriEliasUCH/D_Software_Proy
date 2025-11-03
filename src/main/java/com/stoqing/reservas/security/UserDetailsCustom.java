package com.stoqing.reservas.security;

import com.stoqing.reservas.entities.model.Operario;
import com.stoqing.reservas.repository.OperarioRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@AllArgsConstructor
public class UserDetailsCustom implements UserDetailsService {

    private OperarioRepository operarioRepo;

    @Override
    public UserDetails loadUserByUsername(String dni) throws UsernameNotFoundException {
        if (operarioRepo.findByDni(dni).isPresent()) {
            Operario op =  operarioRepo.findByDni(dni).get();

            return User.builder()
                .username(dni)
                .password(op.getContrasena())
                .authorities("OPERARIO")
                .build();
        } else {
            throw new UsernameNotFoundException("No existe el usuario");
        }
    }
}
