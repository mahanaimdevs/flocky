package com.flocky.api.account

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface AccountRepository : JpaRepository<Account, UUID> {
    fun findByProviderAndProviderAccountId(
        provider: String,
        providerAccountId: String,
    ): Account?
}
