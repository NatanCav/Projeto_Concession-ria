package com.concessionaria.user;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    @EntityGraph(attributePaths = "brand")
    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    @Override
    @EntityGraph(attributePaths = "brand")
    List<User> findAll();

    @Query("select u.brand.id, count(u) from User u where u.brand is not null group by u.brand.id")
    List<Object[]> countSellersByBrand();
}
