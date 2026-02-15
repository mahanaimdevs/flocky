package com.flocky.api.auth

import com.flocky.api.account.Account
import com.flocky.api.account.AccountRepository
import com.flocky.api.auth.dto.AuthResponse
import com.flocky.api.auth.dto.LoginRequest
import com.flocky.api.auth.dto.RegisterRequest
import com.flocky.api.auth.dto.VerifyEmailRequest
import com.flocky.api.session.Session
import com.flocky.api.session.SessionRepository
import com.flocky.api.user.User
import com.flocky.api.user.UserRepository
import com.flocky.api.verification.Verification
import com.flocky.api.verification.VerificationRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.security.SecureRandom
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.Base64

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val accountRepository: AccountRepository,
    private val sessionRepository: SessionRepository,
    private val verificationRepository: VerificationRepository,
    private val passwordEncoder: PasswordEncoder,
) {
    companion object {
        private const val SESSION_EXPIRY_DAYS = 30L
        private const val VERIFICATION_EXPIRY_HOURS = 24L
        private const val TOKEN_BYTE_LENGTH = 32
    }

    @Transactional
    fun register(
        request: RegisterRequest,
        ipAddress: String?,
        userAgent: String?,
    ): AuthResponse {
        if (userRepository.findByEmail(request.email) != null) {
            throw IllegalArgumentException("Email already in use")
        }

        val user =
            userRepository.save(
                User(
                    email = request.email,
                    name = request.name,
                ),
            )

        accountRepository.save(
            Account(
                user = user,
                provider = "credentials",
                providerAccountId = request.email,
                password = passwordEncoder.encode(request.password),
            ),
        )

        // Create email verification token
        verificationRepository.save(
            Verification(
                identifier = user.email,
                value = generateToken(),
                expiresAt = Instant.now().plus(VERIFICATION_EXPIRY_HOURS, ChronoUnit.HOURS),
            ),
        )

        // TODO: Send email to verify email

        val session = createSession(user, ipAddress, userAgent)

        return toAuthResponse(session, user)
    }

    @Transactional
    fun login(
        request: LoginRequest,
        ipAddress: String?,
        userAgent: String?,
    ): AuthResponse {
        val account =
            accountRepository.findByProviderAndProviderAccountId("credentials", request.email)
                ?: throw IllegalArgumentException("Invalid email or password")

        if (!passwordEncoder.matches(request.password, account.password)) {
            throw IllegalArgumentException("Invalid email or password")
        }

        val user = account.user
        val session = createSession(user, ipAddress, userAgent)

        return toAuthResponse(session, user)
    }

    @Transactional
    fun logout(token: String) {
        sessionRepository.deleteByToken(token)
    }

    @Transactional
    fun verifyEmail(request: VerifyEmailRequest) {
        val verification =
            verificationRepository.findByIdentifierAndValue(request.identifier, request.value)
                ?: throw IllegalArgumentException("Invalid verification token")

        if (verification.expiresAt.isBefore(Instant.now())) {
            throw IllegalArgumentException("Verification token has expired")
        }

        val user =
            userRepository.findByEmail(verification.identifier)
                ?: throw IllegalArgumentException("User not found")

        user.emailVerified = true
        userRepository.save(user)

        verificationRepository.deleteByIdentifier(verification.identifier)
    }

    private fun createSession(
        user: User,
        ipAddress: String?,
        userAgent: String?,
    ): Session =
        sessionRepository.save(
            Session(
                user = user,
                token = generateToken(),
                expiresAt = Instant.now().plus(SESSION_EXPIRY_DAYS, ChronoUnit.DAYS),
                ipAddress = ipAddress,
                userAgent = userAgent,
            ),
        )

    private fun toAuthResponse(
        session: Session,
        user: User,
    ): AuthResponse =
        AuthResponse(
            token = session.token,
            expiresAt = session.expiresAt,
            user =
                AuthResponse.UserInfo(
                    id = user.id!!,
                    email = user.email,
                    name = user.name,
                    emailVerified = user.emailVerified,
                ),
        )

    private fun generateToken(): String {
        val bytes = ByteArray(TOKEN_BYTE_LENGTH)
        SecureRandom().nextBytes(bytes)
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
    }
}
