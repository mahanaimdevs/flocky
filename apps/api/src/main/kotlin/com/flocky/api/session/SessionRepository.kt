package com.flocky.api.session

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.util.UUID

interface SessionRepository : JpaRepository<Session, UUID> {
    @Query("SELECT s FROM Session s JOIN FETCH s.user WHERE s.token = :token")
    fun findByToken(token: String): Session?
    fun deleteByToken(token: String)
    fun deleteByUserId(userId: UUID)
}
