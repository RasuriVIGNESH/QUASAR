package com.ADP.peerConnect.model.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Generic API response wrapper
 */
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    
    private boolean success;
    private String message;
    private T data;
    private Object error;

    public ApiResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
    
    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }
    
    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(true, message);
    }
    
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }
    
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message);
    }
    
    public static <T> ApiResponse<T> error(String message, Object error) {
        ApiResponse<T> response = new ApiResponse<>(false, message);
        response.setError(error);
        return response;
    }
    public boolean isSuccess() {
        return success;
    }

}

