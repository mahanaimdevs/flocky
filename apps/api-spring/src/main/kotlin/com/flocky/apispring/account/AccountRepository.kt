package com.flocky.apispring.account

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface AccountRepository : JpaRepository<Account, UUID> {
    fun findByProviderAndProviderAccountId(
        provider: String,
        providerAccountId: String,
    ): Account?
}
