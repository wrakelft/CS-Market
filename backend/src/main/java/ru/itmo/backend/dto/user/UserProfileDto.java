package ru.itmo.backend.dto.user;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class UserProfileDto {
    Integer id;
    String steamId;
    String nickname;
    Integer balance;
}