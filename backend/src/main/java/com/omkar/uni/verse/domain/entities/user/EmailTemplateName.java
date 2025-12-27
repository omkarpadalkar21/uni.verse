package com.omkar.uni.verse.domain.entities.user;

import lombok.Getter;

@Getter
public enum EmailTemplateName {
    VERIFY_ACCOUNT("verify_account"),
    FORGOT_PASSWORD("forgot_password");

    private final String name;

    EmailTemplateName(String name) {
        this.name = name;
    }
}
