package io.ssafy.trycatch.global.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
public class RequestLoggingFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;

        log.info("========================================");
        log.info("요청 Method: {}", httpRequest.getMethod());
        log.info("요청 URI: {}", httpRequest.getRequestURI());
        log.info("요청 Origin: {}", httpRequest.getHeader("Origin"));
        log.info("요청 Authorization: {}", httpRequest.getHeader("Authorization"));
        log.info("요청 Content-Type: {}", httpRequest.getContentType());
        log.info("========================================");

        chain.doFilter(request, response);
    }
}