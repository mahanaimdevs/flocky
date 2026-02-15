package com.flocky.api.verification

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface VerificationRepository : JpaRepository<Verification, UUID> {
    fun findByIdentifierAndValue(
        identifier: String,
        value: String,
    ): Verification?
    fun deleteByIdentifier(identifier: String)
}
