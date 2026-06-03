package com.example.shop.application.mapper;

import com.example.shop.application.dto.request.VoucherRequest;
import com.example.shop.application.dto.response.VoucherResponse;
import com.example.shop.domain.entity.Voucher;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-03T22:54:26+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Oracle Corporation)"
)
@Component
public class VoucherMapperImpl implements VoucherMapper {

    @Override
    public VoucherResponse toResponse(Voucher voucher) {
        if ( voucher == null ) {
            return null;
        }

        VoucherResponse voucherResponse = new VoucherResponse();

        voucherResponse.setId( voucher.getId() );
        voucherResponse.setCode( voucher.getCode() );
        voucherResponse.setType( voucher.getType() );
        voucherResponse.setValue( voucher.getValue() );
        voucherResponse.setMaxDiscount( voucher.getMaxDiscount() );
        voucherResponse.setMinOrderValue( voucher.getMinOrderValue() );
        voucherResponse.setStartDate( voucher.getStartDate() );
        voucherResponse.setEndDate( voucher.getEndDate() );
        voucherResponse.setUsageLimit( voucher.getUsageLimit() );
        voucherResponse.setUsagePerUser( voucher.getUsagePerUser() );
        voucherResponse.setStatus( voucher.getStatus() );
        voucherResponse.setCreatedAt( voucher.getCreatedAt() );
        voucherResponse.setUpdatedAt( voucher.getUpdatedAt() );

        return voucherResponse;
    }

    @Override
    public Voucher toEntity(VoucherRequest request) {
        if ( request == null ) {
            return null;
        }

        Voucher voucher = new Voucher();

        voucher.setCode( request.getCode() );
        voucher.setType( request.getType() );
        voucher.setValue( request.getValue() );
        voucher.setMaxDiscount( request.getMaxDiscount() );
        voucher.setMinOrderValue( request.getMinOrderValue() );
        voucher.setStartDate( request.getStartDate() );
        voucher.setEndDate( request.getEndDate() );
        voucher.setUsageLimit( request.getUsageLimit() );
        voucher.setUsagePerUser( request.getUsagePerUser() );
        voucher.setStatus( request.getStatus() );

        return voucher;
    }
}
