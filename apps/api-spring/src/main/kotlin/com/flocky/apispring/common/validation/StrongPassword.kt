package com.flocky.apispring.common.validation

import jakarta.validation.Constraint
import jakarta.validation.ConstraintValidator
import jakarta.validation.ConstraintValidatorContext
import jakarta.validation.Payload
import kotlin.reflect.KClass

@Target(AnnotationTarget.FIELD)
@Retention(AnnotationRetention.RUNTIME)
@Constraint(validatedBy = [StrongPasswordValidator::class])
annotation class StrongPassword(
    val message: String = "Password does not meet requirements",
    val groups: Array<KClass<*>> = [],
    val payload: Array<KClass<out Payload>> = [],
)

class StrongPasswordValidator : ConstraintValidator<StrongPassword, String> {
    companion object {
        private const val MIN_LENGTH = 8
        private const val MAX_LENGTH = 128
    }

    override fun isValid(
        value: String?,
        context: ConstraintValidatorContext,
    ): Boolean {
        if (value == null) return false

        val violations = mutableListOf<String>()

        if (value.length < MIN_LENGTH) {
            violations.add("must be at least $MIN_LENGTH characters")
        }
        if (value.length > MAX_LENGTH) {
            violations.add("must be at most $MAX_LENGTH characters")
        }
        if (!value.any { it.isUpperCase() }) {
            violations.add("must contain at least one uppercase letter")
        }
        if (!value.any { it.isLowerCase() }) {
            violations.add("must contain at least one lowercase letter")
        }
        if (!value.any { it.isDigit() }) {
            violations.add("must contain at least one number")
        }
        if (!value.any { !it.isLetterOrDigit() }) {
            violations.add("must contain at least one special character")
        }

        if (violations.isNotEmpty()) {
            context.disableDefaultConstraintViolation()
            context
                .buildConstraintViolationWithTemplate(
                    "Password ${violations.joinToString(", ")}",
                ).addConstraintViolation()
            return false
        }

        return true
    }
}
