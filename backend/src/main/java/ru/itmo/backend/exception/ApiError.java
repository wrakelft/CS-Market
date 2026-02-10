package ru.itmo.backend.exception;

import lombok.Builder;
import lombok.Value;

import java.time.OffsetDateTime;

@Value
@Builder
public class ApiError {
    OffsetDateTime timestamp;
    int status;
    String error;
    String message;
    String path;
}
