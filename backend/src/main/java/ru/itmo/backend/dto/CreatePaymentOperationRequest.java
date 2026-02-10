package ru.itmo.backend.dto;

import lombok.Data;

@Data
public class CreatePaymentOperationRequest {
    private Integer userId;
    private String type;
    private String method;
    private String status;
    private Integer amount;
}