package com.flocky.apispring.auth

import com.flocky.apispring.auth.dto.AuthResponse
import com.flocky.apispring.auth.dto.LoginRequest
import com.flocky.apispring.auth.dto.RegisterRequest
import com.flocky.apispring.auth.dto.VerifyEmailRequest
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("auth")
class AuthController(
    private val authService: AuthService,
) {
    @PostMapping("register")
    @ResponseStatus(HttpStatus.CREATED)
    fun register(
        @Valid @RequestBody request: RegisterRequest,
        httpRequest: HttpServletRequest,
    ): AuthResponse =
        authService.register(
            request = request,
            ipAddress = httpRequest.remoteAddr,
            userAgent = httpRequest.getHeader("User-Agent"),
        )

    @PostMapping("login")
    fun login(
        @Valid @RequestBody request: LoginRequest,
        httpRequest: HttpServletRequest,
    ): AuthResponse =
        authService.login(
            request = request,
            ipAddress = httpRequest.remoteAddr,
            userAgent = httpRequest.getHeader("User-Agent"),
        )

    @PostMapping("logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun logout(httpRequest: HttpServletRequest) {
        val token =
            httpRequest
                .getHeader("Authorization")
                ?.removePrefix("Bearer ")
                ?: return
        authService.logout(token)
    }

    @PostMapping("verify-email")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun verifyEmail(
        @Valid @RequestBody request: VerifyEmailRequest,
    ) {
        authService.verifyEmail(request)
    }
}
