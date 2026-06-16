package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.dto.response.Project.ProjectResponse;
import com.ADP.peerConnect.model.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Paginated response wrapper
 */

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class PagedResponse<T> {
    
    private List<T> content;
    private int pageNumber;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;
    private int numberOfElements;

    public PagedResponse(List<T> content, int number, int size, long totalElements, int totalPages) {
        this.content=content;
        this.totalElements=totalElements;
        this.pageNumber=number;
        this.numberOfElements=size;
        this.totalPages=totalPages;
    }
}

