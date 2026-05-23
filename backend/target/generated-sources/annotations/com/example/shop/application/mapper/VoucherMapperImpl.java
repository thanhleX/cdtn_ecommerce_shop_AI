package com.example.shop.application.mapper;

import com.example.shop.application.dto.request.VoucherRequest;
import com.example.shop.application.dto.response.VoucherResponse;
import com.example.shop.domain.entity.Voucher;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-15T08:52:59+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class VoucherMapperImpl implements VoucherMapper {

    @Override
    public VoucherResponse toResponse(Voucher voucher) {
        if ( voucher == null ) {
            return null;
        }

        VoucherResponse voucherResponse = new VoucherResponse();

        voucherResponse.setCode( voucher.getCode() );
        voucherResponse.setCreatedAt( voucher.getCreatedAt() );
        voucherResponse.setEndDate( voucher.getEndDate() );
        voucherResponse.setId( voucher.getId() );
        voucherResponse.setMaxDiscount( voucher.getMaxDiscount() );
        voucherResponse.setMinOrderValue( voucher.getMinOrderValue() );
        voucherResponse.setStartDate( voucher.getStartDate() );
        voucherResponse.setStatus( voucher.getStatus() );
        voucherResponse.setType( voucher.getType() );
        voucherResponse.setUpdatedAt( voucher.getUpdatedAt() );
        voucherResponse.setUsageLimit( voucher.getUsageLimit() );
        voucherResponse.setUsagePerUser( voucher.getUsagePerUser() );
        voucherResponse.setValue( voucher.getValue() );

        return voucherResponse;
    }

    @Override
    public Voucher toEntity(VoucherRequest request) {
        if ( request == null ) {
            return null;
        }

        Voucher voucher = new Voucher();

        voucher.setCode( request.getCode() );
        voucher.setEndDate( request.getEndDate() );
        voucher.setMaxDiscount( request.getMaxDiscount() );
        voucher.setMinOrderValue( request.getMinOrderValue() );
        voucher.setStartDate( request.getStartDate() );
        voucher.setStatus( request.getStatus() );
        voucher.setType( request.getType() );
        voucher.setUsageLimit( request.getUsageLimit() );
        voucher.setUsagePerUser( request.getUsagePerUser() );
        voucher.setValue( request.getValue() );

        return voucher;
    }
}
